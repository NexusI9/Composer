import Layout from "./Layout";
import { PageComponentSet } from "./Page";
import { Color } from "./Color";
import { DEFAULT_STYLE_PAINT } from "./constants";

export interface IColorStyles {
    name: string;
    color: RGB;
    style: undefined | PaintStyle;
}

const MIN_FRAME_HEIGHT = 500;
const MIN_FRAME_WIDTH = 1000;

const COLOR_STYLES: { [key: string]: IColorStyles } = {
    hover: {
        name: "sitemap/hover",
        color: { r: 0, g: 0.6, b: 1 },
        style: undefined
    },
    background: {
        name: "sitemap/background",
        color: { r: 0.965, g: 0.965, b: 0.965 },
        style: undefined
    },
    text: {
        name: "sitemap/text",
        color: { r: 0.1, g: 0.1, b: 0.1 },
        style: undefined,
    },
    subdirectory: {
        name: "sitemap/subdirectory",
        color: { r: 0.4, g: 0.4, b: 0.4 },
        style: undefined
    }
};

async function loadColors() {
    return await Promise.all(Object.keys(COLOR_STYLES).map(async key => {

        const color = COLOR_STYLES[key];
        const style = new Color({
            name: color.name,
            color: color.color
        });
        await style.create();

        COLOR_STYLES[key] = {
            ...color,
            style: style.style
        };

        return style;

    }));
}
