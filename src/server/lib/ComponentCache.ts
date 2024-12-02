


export interface IComponentCache {
    name: string;
    id: string;
    preview: string;
}

export class ComponentCache {

    name: string;
    id: string;
    preview: string;

    constructor({ name, id, preview }: IComponentCache) {
        this.name = name;
        this.id = id;
        this.preview = preview;
    }

    get nameObject() {
        const obj: { [key: string]: string } = {};
        this.name.split(', ').forEach(item => {
            const split = item.split('=');
            if (split[0] && split[1]) obj[split[0] as keyof typeof obj] = split[1];
        });

        return obj;
    }

    hasKeyValue({ key, value }: { key: string, value: string }): boolean {

        let has = false;
        for (const k in this.nameObject) {
            if (k == key && value == this.nameObject[k as keyof typeof this.nameObject]) {
                has = true;
                break;
            }
        }

        return has;
    }


}
