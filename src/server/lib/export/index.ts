import { ITreeItem } from "@components/TreeItem/TreeItem";
import Layout from "./Layout";
import { genBranch } from "./Branch";
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

export async function exportTree(tree: Array<ITreeItem>) {


    const layout = new Layout({ font: { family: 'Inter', style: 'Regular' } });
    await layout.init();

    //MASTER
    const masterFrame = layout.frame({
        name: 'Sitemap',
        layout: 'VERTICAL',
        itemSpacing: 32,
        padding: [40, 64, 40, 64]
    });
    masterFrame.opacity = 0;

    const title = layout.header({ text: "Site Map" });

    //SITE MAP
    const sitemapFrame = layout.frame({
        name: 'Sitemap',
        layout: 'HORIZONTAL',
        itemSpacing: 48,
        transparent: true
    });

    //Generate Page component
    const page = new PageComponentSet(layout);
    await page.init(masterFrame);

    //Create color styles
    await loadColors();

    //Apply colors
    if (COLOR_STYLES.hover.style &&
        COLOR_STYLES.text.style &&
        COLOR_STYLES.subdirectory.style &&
        COLOR_STYLES.background.style
    ) {
        await title.setFillStyleIdAsync(COLOR_STYLES.text.style.id);
        await page.setStyles({
            text: COLOR_STYLES.text.style,
            subdirectory: COLOR_STYLES.subdirectory.style,
            hover: COLOR_STYLES.hover.style
        });
        await masterFrame.setFillStyleIdAsync(COLOR_STYLES.background.style.id);


    } else {
        console.warn("Error creating styles, aborting sitemap generation");
    }

    //resize page components
    if (page.componentSet) {
        masterFrame.appendChild(page.componentSet);
        page.componentSet.resize(0.1, 0.1);
        page.componentSet.x = 0;
        page.componentSet.y = 0;
        page.componentSet.layoutPositioning = "ABSOLUTE";
    }


    await Promise.all(tree.map(async br => {
        const branch = await genBranch({
            branch: br,
            displaySubdir: false,
            pageComponent: page,
            textType: "heading",
            layout,
        });

        if (branch) sitemapFrame.appendChild(branch);
    }));


    masterFrame.appendChild(title);
    masterFrame.appendChild(sitemapFrame);

    //adjust height
    masterFrame.resize(
        Math.max(masterFrame.width, MIN_FRAME_WIDTH),
        Math.max(masterFrame.height, MIN_FRAME_HEIGHT)
    );

    masterFrame.counterAxisAlignItems = "CENTER";
    masterFrame.opacity = 1;

    figma.currentPage.flowStartingPoints = [...figma.currentPage.flowStartingPoints, { nodeId: masterFrame.id, name: 'Sitemap' }];
}