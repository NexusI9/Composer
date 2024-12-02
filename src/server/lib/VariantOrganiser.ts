import { Table } from "./Table";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IIndexKeyVal { id: number; value: string; };

export class VariantOrganiser {

    cache: { [key: string]: ComponentCache[] } = {};
    config: Configuration<string> = new Configuration(4);
    current = {};
    activeComponent: Partial<ComponentSetNode> | undefined;

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
                preview: await this.loadPreview(item)
            })));
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


        //console.log(fullpath);
        children.forEach(child => {
            const nameObj = child.nameObject;

            for (const k in nameObj) {
                if (k === currentKey) {
                    const value = `${currentKey}=${nameObj[k]}`; //nameObj[k];
                    if (!!rest.length) {
                        parent[value] = this.tree(children, rest, parent[k as keyof typeof parent], [...fullpath, `${currentKey}=${nameObj[k]}`]); //append new variants
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
    private cache2Table() {
        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;

        const component = this.cache[this.activeComponent.id];

        /**
         * 1. Build Tree of component
         * Build children tree depending on the configuration data ([State 1, State 2, State 3...])
         * Reverse the array because to fit HTML table structure we fist need the rows (which are the second parameters in our UI)
         * <row><col1><col2><coln></row>
         * Such structure implies that we want our final content to end in the column, not the row, hence the reverse
         */
        const tree = this.tree(component, this.config.data.filter(n => !!n).reverse() as string[]);

        /**
         * 2. Segment the tree into row and columns for HTML firendly output
         * According on configuration raw data [ s1, undefined, s2, undefined ] we can set which levels are rows and which levels are columns
         * We know that index 0 and 1 and columns and 2 and 3 are rows
         * 
         * Buffer:
         *      |      COL       |       ROW     |
         *      [   1   ,   0    |   1   ,   1   ]
         *          |               |       |
         * Data:    |               |       |
         *          |               |       L_____
         *      [   s1  ]           |             |
         *           L---------[   s2   ]         |
         *                          L--------[   s3  ]
         */

        const table: string[][] = [];
        //prefill table
        console.log(this.config.data);
        let cursor = 0;
        let row = 0;
        let level = tree;

        //console.log(this.config.data);
        for (const key in level) {
            break;
            const child = tree[key];
            //Define if key is row or col depending on config state 
            while (!this.config.data[cursor]) cursor++ % this.config.data.length;

            //set row
            if (cursor > 1) {
                console.log(`row: ${key}`);
                /*table.push([key]);

                for (const c of child) {
                    table[row].push(c.name);
                }*/
            }

            //set col
            else {
                console.log(`column: ${key}`);
                //Add new row by default
                /*if (table[row]) table[row].push('');
                else table[row] = [''];

                for (const item of value) {
                    row++;
                    table[row].push(item.name);
                }*/

                //col++;
            }

            cursor++;
            row++;

        }


        //console.log({ x, y });
        console.log(tree);
        //console.log(table);
        //console.log(table);

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

    destroy() {

    }

    update(set: Partial<ComponentSetNode>, { id, value }: IIndexKeyVal) {

        if (!set.id) return;

        //Update configuration array
        this.config.allocate(id, value);
        this.cache2Table();
    }


}