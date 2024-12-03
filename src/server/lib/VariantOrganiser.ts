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


    private traverse<T>({ tree, onLast, onBeforeLast, level = 0, index = { relative: 0, absolute: 0 } }: { tree: T[]; onLast?: (group: T[], index: IIndex) => any; onBeforeLast?: (tree: Object, index: IIndex) => any; readonly level?: number, readonly index?: IIndex }) {

        const length = this.config.filter().length;

        //check if last level
        if (level == length) {
            this.#groupCount++;
            if (onLast) onLast(tree, index);
        } else {
            if (onBeforeLast && ((length > 1 && level == length - 1) || length == 1)) onBeforeLast(tree, index);
            level++;
            Object.keys(tree).forEach((key, i) => this.traverse({
                tree: tree[key as keyof typeof tree] as T[],
                onLast,
                onBeforeLast,
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
    private cache2Tree(reverse: boolean = false) {
        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;

        const component = this.cache[this.activeComponent.id];

        /**
         * Build Tree of component
         * Build children tree depending on the configuration data ([State 1, State 2, State 3...])
         * Reverse the array because to fit HTML table structure we fist need the rows (which are the second parameters in our UI)
         * <row><col1><col2><coln></row>
         * Such structure implies that we want our final content to end in the column, not the row, hence the reverse
         * 
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
         * ## CONTEXT:
         * Arrange component differently depending on layout type from {Object} => [Table]
         * { A: B: { [C],[D],[E] }} => [[C],[D],[E]]
         * The current process first establishes a tree to segment the different types of components based on filters
         * 
         * ## ISSUE:
         * However the issue with this approach is that the output tree is completely "major order" agnostic. 
         * This is also due to the flexiblity of the plugin that allows a "column-strict" layout, hence the necessity to store 
         * the components in a "neutral" structure either for rows or columns-strict layout.
         * Hence our output tree does not give any hints on how to layout its components, it simply dispatches them through distinct branches 
         * 
         * ## SOLUTION:
         * The goal of the below method will be to transform the tree into a ROW-Major order matrix, so we shall reduce it's translation to table 
         * and the ≠ approaches to lay out the components.
         * 
         * */

        this.#groupCount = 0;
        const groups: ComponentCache[][] = [];
        let row = 0;
        let col = 0;

        //Traverse the object and rearrange its content to fit a Row-Major order matrix (multi-dim array) in function of the layout configuration
        //TODO: Maybe do it directly in parallel of the tree creation so maybe don't even need tree anymore
        this.traverse<ComponentCache>({
            tree: tree,
            onBeforeLast: (tree, index) => {
                for (const key in tree) {
                    const value = tree[key as keyof typeof tree] as any;

                    //Handle 1D cases
                    if (layout == "COLUMN") {
                        //For [[A1,A2,A3],[B1,B2,B3],[C1,C2,C3]] :
                        // [[A1,B1,C1],
                        //  [A2,B2,C2],
                        //  [A3,B3,C3]]
                        for (let v = 0; v < value.length; v++) {
                            if (!groups[v]) groups[v] = [];
                            groups[v][col] = value[v];
                        }

                    } if (layout == "ROW") {
                        groups.push(value);
                    }

                    //Handle 2D (i.e. cross) cases
                    else {
                        //Concat each "one before last" array to one, so each groups index = one new row and the elements inside shall be columns
                        groups[row] = [...(groups[row] || []), ...value];
                    }
                    col++;
                };
                row++;
            }
        });


        //Cache bound box for later component set resizing
        let bounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

        //For CROSS configuration, use a global "max size" instead of a "per row/col max", easier and faster to manage to maintain a grid layout
        const maxSize: Rect = {
            x: 0,
            y: 0,
            width: groups.map(child => child.map(item => item.size.width).reduce((a, b) => Math.max(a, b))).reduce((a, b) => Math.max(a, b)),
            height: groups.map(child => child.map(item => item.size.height).reduce((a, b) => Math.max(a, b))).reduce((a, b) => Math.max(a, b))
        };

        let offset = 0;
        console.log(groups);
        console.log(groups.map(item => item.map(it => it.name)));

        await Promise.all(groups.map(async (gp, i) => {

            return await Promise.all(gp.map(async (child, j) => {
                const node = await figma.getNodeByIdAsync(child.id);
                if (node && node.type == "COMPONENT") {

                    //get previous node max size

                    let x = child.position.x;
                    let y = child.position.y;

                    //Get previous dimension max size to align on grid
                    const prev = {
                        width: i > 0 ? groups[i - 1].map(item => item.size.width).reduce((a, b) => Math.max(a, b)) : 0, // get max width of the previous column
                        height: i > 0 && j > 0 ? groups.map(item => item[j - 1]?.size.height).filter(n => !!n).reduce((a, b) => Math.max(a, b)) //If advanced in the grid, refers to previous items in the grid within the same row
                            : i == 0 && j > 0 ? gp[j - 1].size.height //If first column, simply refers to elements above
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
                            x = ((maxSize.width + this.margin) * j) + (Math.floor(i / 2) * (maxSize.width + this.margin));
                            //y = gp.index.relative * (maxSize.height + this.margin);
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