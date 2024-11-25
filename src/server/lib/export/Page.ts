import Layout from "./Layout";

export interface IPageProperties {
    text: string;
    subdir: string;
    state: "default" | "hover";
    type: "body" | "heading";
}

class PageComponent {

    layout;
    node: ComponentNode | null = null;
    properties: IPageProperties = {
        text: "0",
        subdir: "0",
        state: "default",
        type: "body"
    };
    name: string = "";


    constructor(name: string, type: IPageProperties["type"], layout: Layout) {
        this.layout = layout;
        this.name = name;
        this.properties.type = type;
    }


    async init() {
        const pageFrame = this.layout.frame({
            name: `page-frame`,
            layout: 'HORIZONTAL',
            itemSpacing: 6,
            transparent: true
        });

        const pageSubIcon = this.layout.body({ text: '└' });
        const pageName = this.layout.body({ text: "Page Name" });

        if (this.properties.type == "heading") {
            const headerFontName = { family: "Inter", style: "Semi Bold" };
            await figma.loadFontAsync(headerFontName);
            pageName.fontName = headerFontName;
            pageName.fontSize = 18;
        }


        pageFrame.appendChild(pageSubIcon);
        pageFrame.appendChild(pageName);

        const component = figma.createComponentFromNode(pageFrame);
        component.name = this.name;

        this.properties.text = component.addComponentProperty("Text", "TEXT", "Page name");
        this.properties.subdir = component.addComponentProperty("Subdir", "BOOLEAN", true);

        component.children[0].componentPropertyReferences = { visible: this.properties.subdir };
        component.children[1].componentPropertyReferences = { characters: this.properties.text };

        this.node = component;
    }

}

export class PageComponentSet {

    layout;
    state: { [key in IPageProperties["type"]]: { [key in IPageProperties["state"]]: ComponentNode | null } } = {
        body: {
            default: null,
            hover: null
        },
        heading: {
            default: null,
            hover: null
        }
    };
    componentSet: undefined | ComponentSetNode;
    properties: IPageProperties = {
        text: "0",
        subdir: "0",
        state: "default",
        type: "body"
    }


    constructor(layout: Layout) {
        this.layout = layout;

    }

    async init(parent: FrameNode) {

        //Instatiate Pages Components
        await this.spawnPageComponents();

        //Create Component Set
        this.componentSet = figma.combineAsVariants([...this.getStatesNodes()], parent);
        this.componentSet.name = "sitemap/page";

        //Assign attirbutes ID

        await Promise.all(Object.keys(this.state).map(async state => {
            if (this.componentSet) {
                //assign children state
                this.state[(state as IPageProperties["type"])].default = this.componentSet.findChild(child => !!child.name.match("default") && !!child.name.match(state)) as ComponentNode | null;
                this.state[(state as IPageProperties["type"])].hover = this.componentSet.findChild(child => !!child.name.match("hover") && !!child.name.match(state)) as ComponentNode | null;

                //create properties
                this.properties.text = this.componentSet.addComponentProperty("Text", "TEXT", "Page name");
                this.properties.subdir = this.componentSet.addComponentProperty("Subdir", "BOOLEAN", true);

                //assign children properties
                this.componentSet.children.forEach(variant => {
                    (variant as ComponentNode).children[0].componentPropertyReferences = { visible: this.getPropertyName("Subdir") };
                    (variant as ComponentNode).children[1].componentPropertyReferences = { characters: this.getPropertyName("Text") };
                });

                this.linkStatesPrototype((state as IPageProperties["type"]));
            }
        }));


    }

    async spawnPageComponents() {
        return await Promise.all(Object.keys(this.state).map(async state => {
            await Promise.all(Object.keys(this.state[((state as IPageProperties["type"]))]).map(async action => {
                const page = new PageComponent(`${action}/${state}`, (state as IPageProperties["type"]), this.layout);
                await page.init();
                this.state[(state as IPageProperties["type"])][(action as IPageProperties["state"])] = page.node;
            }));
        }));
    }

    getStatesNodes(): Array<ComponentNode> {
        const flattenStates = Object.keys(this.state).map(key => Object.keys(this.state[(key as IPageProperties["type"])]).map(subkey => this.state[(key as IPageProperties["type"])][(subkey as IPageProperties["state"])]));
        return flattenStates.flat(2).filter(n => !!n);
    }

    propertyFromName(name: string) {

        const def = this.componentSet?.componentPropertyDefinitions;
        if (def) {
            Object.keys(def).forEach(key => { if (key.includes(name)) name = key });
        }

        return String(name);

    }

    async linkStatesPrototype(type: IPageProperties["type"]) {
        const defaultNode = this.state[type].default;
        const hoverNode = this.state[type].hover;

        if (defaultNode && hoverNode) {
            await this.state[type].default?.setReactionsAsync([
                {
                    trigger: { type: "ON_HOVER" },
                    actions: [
                        {
                            type: "NODE",
                            destinationId: hoverNode.id,
                            navigation: "CHANGE_TO",
                            transition: {
                                type: "DISSOLVE",
                                easing: { type: "LINEAR" },
                                duration: 0.150
                            }
                        }
                    ]
                }

            ]);
        }

    }


    newInstance(type: IPageProperties["type"]) {
        return this.state[type].default?.createInstance();
    }

    setInstanceName(instance: InstanceNode, name: string) {
        instance.setProperties({ [this.propertyFromName("Text")]: name });
    }

    setInstanceSubdir(instance: InstanceNode, display: boolean) {
        instance.setProperties({ [this.propertyFromName("Subdir")]: display });
    }

    getPropertyName(name: string) {
        return this.propertyFromName(name);
    }

    async setStyles({ text, subdirectory, hover }: { text: PaintStyle, subdirectory: PaintStyle, hover: PaintStyle }) {
        if (!this.componentSet) { return; }

        //Set background + text color + subdirectory
        await Promise.all(this.componentSet.children.map(async child => {
            child = child as ComponentNode;
            await (child.children[0] as TextNode).setFillStyleIdAsync(subdirectory.id);
            await (child.children[1] as TextNode).setFillStyleIdAsync(text.id);
        }));

        //Set hover color
        const hoverChildren = this.componentSet.findChildren(child => !!child.name.match("hover"));
        if (!hoverChildren) { return; }


        await Promise.all(hoverChildren.map(async hoverChild => {
            const hoverText = (hoverChild as ComponentNode).children[1];
            if (hoverText)
                return await (hoverText as TextNode).setFillStyleIdAsync(hover.id);
        }));


    }

}