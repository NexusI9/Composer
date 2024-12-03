import { Table } from "./Table";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IIndexKeyVal { id: number; value: string; };
export interface ITreeConfig { tree: object; config: (string | undefined)[]; }
interface IIndex { relative: number; absolute: number; }
interface IGroup { items: ComponentCache[]; index: IIndex; }

export class VariantOrganiser {

    cache: { [key: string]: ComponentCache[] } = {};
    config: Configuration<string> = new Configuration(4);
    current = {};
    activeComponent: Partial<ComponentSetNode> | undefined;
    #groupCount = 0;
    margin: number = 20;

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
                preview: '', //await this.loadPreview(item) NOTE: UNUSED FOR NOW,
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

    private table(children: ComponentCache[], keys: string[]) {

        switch (this.config.layout) {

            case "COLUMN":

                break;

            case "ROW":

                break;

            case "CROSS_MONO":

                break;

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
    private cache2Tree(reverse: boolean = false) {
        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;

        const component = this.cache[this.activeComponent.id];

        /**
         * 1. Build Tree of component
         * Build children tree depending on the configuration data ([State 1, State 2, State 3...])
         * Reverse the array because to fit HTML table structure we fist need the rows (which are the second parameters in our UI)
         * <row><col1><col2><coln></row>
         * Such structure implies that we want our final content to end in the column, not the row, hence the reverse
         */
        const list = this.config.data.filter(n => !!n);
        const tree = this.tree(component, (reverse ? list.reverse() : list) as string[]);

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

    private async resizeFitComponent(bounds?: Rect) {

        const node = await figma.getNodeByIdAsync(String(this.activeComponent?.id));
        if (node && node.type == "COMPONENT_SET") {

            const initClip = node.clipsContent;

            node.clipsContent = false;
            let { width, height } = bounds || node.absoluteRenderBounds || { width: undefined, height: undefined };
            if (width && height) node.resizeWithoutConstraints(width, height);
            node.clipsContent = initClip;
        }


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
        if (!this.config.filter().length) return {
            config: [],
            tree: {}
        };

        const { layout } = this.config;

        //Init config is in order [col 1, col 2, row 1, row 2]
        //We reverse the list order if cross, easier to read "in row" rather than translating columns to row
        const tree = this.cache2Tree(!!layout.includes("CROSS"));
        console.log(tree);

        /**
         * Arrange component differently depending on layout type
         * { A: B: { [C],[D],[E] }} => [[C],[D],[E]]
         * */
        this.#groupCount = 0;
        const groups: IGroup[] = [];
        this.traverse<ComponentCache>({
            tree: tree,
            onLast: (group, index) => groups.push({ items: group, index })
        });


        //Cache bound box for later component set resizing
        let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

        //For CROSS configuration, use a global "max size" instead of a "per row/col max", easier and faster to manage to maintain a grid layout
        const maxSize: Rect = {
            x: 0,
            y: 0,
            width: groups.map(child => child.items.map(item => item.size.width).reduce((a, b) => Math.max(a, b))).reduce((a, b) => Math.max(a, b)),
            height: groups.map(child => child.items.map(item => item.size.height).reduce((a, b) => Math.max(a, b))).reduce((a, b) => Math.max(a, b))
        };

        let offset = 0;
        console.log(groups.map(item => item.items.map(it => it.name)));
        await Promise.all(groups.map(async (gp, i) => {

            return await Promise.all(gp.items.map(async (child, j) => {
                const node = await figma.getNodeByIdAsync(child.id);
                if (node && node.type == "COMPONENT") {

                    //get previous node max size

                    let x = child.position.x;
                    let y = child.position.y;

                    //Get previous dimension max size to align on grid
                    const prev = {
                        width: i > 0 ? groups[i - 1].items.map(item => item.size.width).reduce((a, b) => Math.max(a, b)) : 0, // get max width of the previous column
                        height: i > 0 && j > 0 ? groups.map(item => item.items[j - 1]?.size.height).filter(n => !!n).reduce((a, b) => Math.max(a, b)) //If advanced in the grid, refers to previous items in the grid within the same row
                            : i == 0 && j > 0 ? gp.items[j - 1].size.height //If first column, simply refers to elements above
                                : 0
                    };


                    switch (layout) {

                        case "COLUMN":
                            x = i * (prev.width + this.margin);
                            y = j * (prev.height + this.margin);
                            break;

                        case "ROW":
                            x = j * (prev.height + this.margin);
                            y = i * (prev.width + this.margin);
                            break;

                        case "CROSS_MONO": // 1 col + 2 row
                            const prevLength = i > 0 ? offset : 0;
                            console.log(i, j, gp.index.relative, child.name);
                            x = ((maxSize.width + this.margin) * j) + (Math.floor(i / 2) * (maxSize.width + this.margin));
                            y = gp.index.relative * (maxSize.height + this.margin);
                            //tidy up programatically the items

                            break;

                        case "CROSS_COL": //2 column properties + 1 row
                            break;

                        case "CROSS_ROW": //2 rows properties + 1 col
                            break;

                        case "CROSS": //2 col + 2 row properties
                            break;

                    }

                    node.x = this.margin + x;
                    node.y = this.margin + y;

                    //update bounds for later resize component
                    bounds = {
                        ...bounds,
                        width: Math.max(bounds.width, node.x + child.size.width + this.margin),
                        height: Math.max(bounds.height, node.y + child.size.height + this.margin)
                    };

                    offset++;
                }
            }));
        }));


        this.resizeFitComponent(bounds);


        return {
            config: this.config.data,
            tree
        }

    }

    async reset() {

        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;
        const component = this.cache[this.activeComponent.id];

        let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };
        //reset children to initial place
        await Promise.all(component.map(async child => {
            const node = await figma.getNodeByIdAsync(child.id);
            if (node && node.type == "COMPONENT") {
                node.x = child.position.x;
                node.y = child.position.y;
            }

            //update bounds for later resize component
            bounds = {
                ...bounds,
                width: Math.max(bounds.width, child.position.x + child.size.width + this.margin),
                height: Math.max(bounds.height, child.position.y + child.size.height + this.margin)
            };
        }));

        this.resizeFitComponent(bounds);

    }


}