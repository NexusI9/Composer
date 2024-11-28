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

    uniqueValues(children: ComponentCache[], key: string) {

        const obj = { [key]: {} };
        children.forEach(child => {
            const nameObj = child.nameObject;
            for (const k in nameObj) {
                if (k == key) {
                    let o = obj[key][nameObj[k] as keyof typeof obj[typeof key]];
                    obj[key] = { ...obj[key], [nameObj[k]]: o ? [...o, child] : [child] };
                }
            }
        });

        return obj;
    }

    /**
     * Organise cache raw data into an ordered table depending on the current configuration
     */
    cache2Table() {
        if (!this.activeComponent || !this.activeComponent.id || !this.cache[this.activeComponent.id]) return;

        const component = this.cache[this.activeComponent.id];
        const { x, y } = this.config.dimensions(2, true);

        let row = {};
        let col = {};
        y.forEach(key => { if (key) col = { ...col, ...this.uniqueValues(component, key) } });
        x.forEach(key => { if (key) row = { ...row, ...this.uniqueValues(component, key) } });

        console.log({ x, y });
        console.log({ row, col });

    }

    async loadPreview(node: SceneNode): Promise<Uint8Array> {

        const preview = await node.exportAsync({
            format: 'PNG',
            constraint: { type: 'WIDTH', value: 100 },
        });

        return preview;
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