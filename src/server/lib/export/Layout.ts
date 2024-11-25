import { mapKeys } from "@lib/utils";
import { COLOR_STYLES } from "./constants";

export default class Layout {

    textStyles: any;
    font: FontName;

    constructor({ font = { family: 'Inter', style: 'Regular' } }: { font?: FontName }) {
        this.font = font;
    }

    async TEXT_STYLES(font: FontName) {

        let mediumFont = { ...font, style: 'Medium' };

        try {
            await figma.loadFontAsync(font);
            await figma.loadFontAsync(mediumFont);
        }
        catch { mediumFont = font; }

        return ({
            header: {
                fontName: mediumFont,
                fontSize: 24
            },
            body: {
                fontName: font,
                fontSize: 14
            },
            caption: {
                fontName: font,
                fontSize: 10
            },
            footnote_1: {
                fontName: font,
                fontSize: 8
            },
            footnote_2: {
                fontName: font,
                fontSize: 6
            }
        });
    };


    async init() {
        this.textStyles = await this.TEXT_STYLES(this.font);
        return this.textStyles;
    }


    header({ text }: { text: string; }) {
        const header = figma.createText();
        header.fontName = this.textStyles.header.fontName;
        header.characters = text;
        header.fontSize = this.textStyles.header.fontSize;
        return header;
    }

    body({ text }: { text: string }) {
        const body = figma.createText();
        body.fontName = this.textStyles.body.fontName;
        body.characters = text;
        body.fontSize = this.textStyles.body.fontSize;
        return body;
    }

    footnote1({ text }: { text: string }) {
        const ft = figma.createText();
        ft.fontName = this.textStyles.footnote_1.fontName;
        ft.characters = text;
        ft.fontSize = this.textStyles.footnote_1.fontSize;
        return ft;
    }

    footnote2({ text }: { text: string }) {
        const ft = figma.createText();
        ft.fontName = this.textStyles.footnote_2.fontName;
        ft.characters = text;
        ft.fontSize = this.textStyles.footnote_2.fontSize;
        return ft;
    }

    caption({ text }: { text: string }) {
        const cp = figma.createText();
        cp.fontName = this.textStyles.caption.fontName;
        cp.characters = text;
        cp.fontSize = this.textStyles.caption.fontSize;
        return cp;
    }

    frame({ layout, name, itemSpacing, center, padding, radius, children, transparent }: { layout: 'HORIZONTAL' | 'VERTICAL'; name: string; center?: boolean; itemSpacing: number; padding?: Array<number>, radius?: Array<number>, children?: Array<SceneNode>, transparent?: boolean }) {
        const frame = figma.createFrame();
        frame.layoutMode = layout;
        frame.layoutSizingHorizontal = 'HUG';
        frame.layoutSizingVertical = 'HUG';
        frame.name = name;
        frame.itemSpacing = itemSpacing;

        if (center) {
            frame.counterAxisAlignItems = 'CENTER';
        }
        if (padding) {
            frame.paddingTop = padding[0];
            frame.paddingRight = padding[1];
            frame.paddingBottom = padding[2];
            frame.paddingLeft = padding[3];
        }
        if (radius) {
            frame.topLeftRadius = radius[0];
            frame.topRightRadius = radius[1];
            frame.bottomRightRadius = radius[2];
            frame.bottomLeftRadius = radius[3];
        }

        if (transparent) {
            frame.fills = [];
        }

        children?.forEach(child => frame.appendChild(child))
        return frame;

    }
    color({ color, opacity = 1 }: { color: RGB, opacity?: number }): Paint[] {
        return [{ type: 'SOLID', color, opacity }];
    }

    async label(props: Partial<TextSublayerNode | TextStyle>) {

        const label = figma.createText();

        if ((props as TextStyle).id) {

            //load font
            const fontFile = await figma.getStyleByIdAsync((props as TextStyle).id);
            if (fontFile) {
                try {
                    await figma.loadFontAsync((fontFile as TextStyle).fontName);
                    // @ts-ignore 
                    await label.setTextStyleIdAsync((props as TextStyle).id);
                } catch { }
            }
        }

        mapKeys(props, label);

        return label;
    }
    underline({ node, layout }: { node: TextNode | FrameNode; layout: 'VERTICAL' | 'HORIZONTAL' }) {

        const box = figma.createFrame();
        box.name = `${node.name}-box`;
        box.layoutMode = layout;
        box.layoutSizingHorizontal = 'HUG';
        box.layoutSizingVertical = 'HUG';
        box.paddingBottom = 6;
        box.counterAxisAlignItems = 'CENTER';

        box.appendChild(node);
        node.layoutSizingHorizontal = 'FILL';
        node.layoutSizingVertical = 'FILL';

        box.strokeWeight = 0;
        box.strokes = COLOR_STYLES.lightGrey;
        box.strokeBottomWeight = 1;

        return box;
    }
};