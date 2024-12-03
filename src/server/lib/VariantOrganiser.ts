import { Table } from "./Table";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IIndexKeyVal { id: number; value: string; };
export interface ITreeConfig { tree: object; config: (string | undefined)[]; }
interface IIndex { relative: number; absolute: number; }
const MARGIN = 20;

export class VariantOrganiser {

    cache: { [key: string]: ComponentCache[] } = {};
    config: Configuration<string> = new Configuration(4);
    current = {};
    activeComponent: Partial<ComponentSetNode> | undefined;
    #groupCount = 0;

    /**
     * Put the component in cache if doesn't exist (and generate preview)
     */
    async init(set: Partial<ComponentSetNode>) {

        if (!set.id || !set.children) return;
        this.activeComponent = set;

        if (!this.cache[set.id]) {
            this.cache[set.id] = await Promise.all(set.children.map(async item => new ComponentCache({
                name: item.name,
                id: item.id,
                preview: await this.loadPreview(item),
                position: { x: item.x, y: item.y },
                size: { width: item.width, height: item.height }
            })));
        }

    }


    private traverse<T>({ tree, onLast, level = 0, index = { relative: 0, absolute: 0 } }: { tree: T[]; onLast?: (group: T[], index: IIndex) => any; readonly level?: number, readonly index?: IIndex }) {

        const length = this.config.filter().length;

        //check if last level
        if (level == length) {
            this.#groupCount++;
            if (onLast) onLast(tree, index);
        } else {
            level++;
            Object.keys(tree).forEach((key, i) => this.traverse({
                tree: tree[key as keyof typeof tree] as T[],
                onLast,
                level: level,
                index: { relative: i, absolute: this.#groupCount }
            }));
        }


    }

    private tree(children: ComponentCache[], keys: string[], parent: any = {}, fullpath: string[] = []) {

        const [currentKey, ...rest] = keys.slice(0);


        //filter out children that does not belong to the branch from fullpath (previous branch)
        if (!!fullpath.length) {

            children = children.filter(({ name }) => {
                let match = 0;
                for (const path of fullpath) {
                    if (name.match(path)) match++;
                }
                return match == fullpath.length;
            });
        }

        //Either append the child components in the right branch of dig more
        children.forEach(child => {
            const nameObj = child.nameObject;

            for (const k in nameObj) {
                if (k === currentKey) {
                    const value = nameObj[k]; //nameObj[k];
                    if (!!rest.length) {
                        parent[value] = this.tree(children, rest, parent[k as keyof typeof parent], [...fullpath, `${currentKey}=${value}`]); //append new variants
                    } else {
                        if (parent[value]) parent[value].push(child);
                        else parent[value] = [child];
                    }
                }

            }

        });

        return parent;
    }

    /**
     * Organise cache raw data into an ordered table depending on the current configuration
     */
    private cache2Tree() {
        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;

        const component = this.cache[this.activeComponent.id];

        /**
         * 1. Build Tree of component
         * Build children tree depending on the configuration data ([State 1, State 2, State 3...])
         * Reverse the array because to fit HTML table structure we fist need the rows (which are the second parameters in our UI)
         * <row><col1><col2><coln></row>
         * Such structure implies that we want our final content to end in the column, not the row, hence the reverse
         */
        const tree = this.tree(component, this.config.data.filter(n => !!n) as string[]);

        return tree;
    }

    private async loadPreview(node: SceneNode): Promise<string> {

        const bytes = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'WIDTH', value: 100 },
        });

        let binary = '';
        for (var i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return base64ArrayBuffer(bytes);
    }

    private resizeFitComponent(node: ComponentSetNode) {
        const initClip = node.clipsContent;

        node.clipsContent = false;
        const { width, height } = node.absoluteRenderBounds || { width: undefined, height: undefined };
        if (width && height) node.resizeWithoutConstraints(width, height);
        node.clipsContent = initClip;
    }

    destroy() {

    }


    async update(set: Partial<ComponentSetNode>, { id, value }: IIndexKeyVal): Promise<ITreeConfig> {

        if (!set.id || !this.activeComponent?.id) return {
            config: [],
            tree: {}
        };

        //Update configuration array
        this.config.allocate(id, value);
        const tree = this.cache2Tree();
        console.log(tree);

        //Arrange component differently depending on layout type
        this.#groupCount = 0;
        const groups: ComponentCache[][] = [];
        this.traverse<ComponentCache>({
            tree: tree,
            onLast: (group, index) => groups.push(group)
        });

        await Promise.all(groups.map(async (gp, i) => await Promise.all(gp.map(async (child, j) => {
            const node = await figma.getNodeByIdAsync(child.id);
            if (node && node.type == "COMPONENT") {

                //get previous node max size

                let x = child.position.x;
                let y = child.position.y;


                switch (this.config.layout) {

                    case "COLUMN":
                    case "ROW":
                        const prev = {
                            width: i > 0 ? groups[i - 1].map(item => item.size.width).reduce((a, b) => Math.max(a, b)) : 0, // get max width of the previous column
                            height: i > 0 && j > 0 ? groups.map(item => item[j - 1]?.size.height).filter(n => !!n).reduce((a, b) => Math.max(a, b)) //If advanced in the grid, refers to previous items in the grid within the same row
                                : i == 0 && j > 0 ? gp[j - 1].size.height //If first column, simply refers to elements above
                                    : 0
                        };
                        x = i * ((this.config.layout == "COLUMN" ? prev.width : prev.height) + MARGIN);
                        y = j * ((this.config.layout == "COLUMN" ? prev.height : prev.width) + MARGIN);
                        break;

                    case "CROSS":
                        break;
                }

                console.log(`x:${x}\ty:${y}`);

                node.x = x;
                node.y = y;
            }
        }))));

        const componentSet = await figma.getNodeByIdAsync(String(this.activeComponent?.id));
        if (componentSet && componentSet.type == "COMPONENT_SET") this.resizeFitComponent(componentSet);


        return {
            config: this.config.data,
            tree
        }

    }

    async reset() {

        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;
        const component = this.cache[this.activeComponent.id];
        //reset children to initial place
        Promise.all(component.map(async child => {
            const node = await figma.getNodeByIdAsync(child.id);
            if (node && node.type == "COMPONENT") {
                node.x = child.position.x;
                node.y = child.position.y;
            }
        }));


    }


}