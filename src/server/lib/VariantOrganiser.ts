import { Table } from "./Table";
import { base64ArrayBuffer } from "./base64";
import { ComponentCache } from "./ComponentCache";
import { Configuration } from "./Configuration";

interface IIndexKeyVal { id: number; value: string; };
export interface ITreeConfig { tree: object; config: (string | undefined)[]; }

export class VariantOrganiser {

    cache: { [key: string]: ComponentCache[] } = {};
    config: Configuration<string> = new Configuration(4);
    current = {};
    activeComponent: Partial<ComponentSetNode> | undefined;
    table: string[][] = [];

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

    destroy() {

    }

    update(set: Partial<ComponentSetNode>, { id, value }: IIndexKeyVal): ITreeConfig {

        if (!set.id) return {
            config: [],
            tree: {}
        };

        //Update configuration array
        this.config.allocate(id, value);

        return {
            config: this.config.data,
            tree: this.cache2Tree()
        }

    }


}