import { ITreeItem } from "@components/TreeItem/TreeItem";
import Layout from "./Layout";
import { IPageProperties, PageComponentSet } from "./Page";
import { allInactive } from "../utils";
import { IColorStyles } from ".";


async function navigateTo(source: InstanceNode, destinationId: string) {

    try {

        await source.setReactionsAsync([
            ...source.reactions,
            {
                trigger: { type: "ON_CLICK" },
                actions: [
                    {
                        type: "NODE",
                        destinationId: destinationId,
                        navigation: "NAVIGATE",
                        preserveScrollPosition: false,
                        resetInteractiveComponents: true,
                        transition: null
                    }
                ]
            }

        ]);

    } catch {
        return;
    }

}


async function removeInteractions(source: InstanceNode) {

    try {
        await source.setReactionsAsync([]);
    } catch {
        return;
    }

}

export interface IBranch {
    branch: ITreeItem;
    displaySubdir: boolean;
    textType: IPageProperties["type"];
    pageComponent: PageComponentSet;
    layout: Layout;
}

export async function genBranch({ branch, textType, displaySubdir, pageComponent, layout }: IBranch): Promise<FrameNode | false> {

    if ((!branch.active && !branch.subdir.length) || (!branch.active && allInactive(branch.subdir))) return false;

    const branchFrame = layout.frame({
        name: 'parent-branch-frame',
        layout: 'VERTICAL',
        itemSpacing: 6,
        padding: [0, 0, 0, 12],
        transparent: true
    });

    branchFrame.fills = [];

    const instance = pageComponent.newInstance(textType);

    if (instance) {
        branchFrame.appendChild(instance);
        pageComponent.setInstanceName(instance, branch.name);
        pageComponent.setInstanceSubdir(instance, displaySubdir);

        if (branch.active) {
            await navigateTo(instance, branch.id);
        } else {
            //remove hover interaction
            await removeInteractions(instance);
        }
    }


    await Promise.all(branch.subdir.map(async br => {
        const branch = await genBranch({ branch: br, textType: "body", displaySubdir: true, pageComponent, layout });
        if (branch) branchFrame.appendChild(branch);
    }));

    return branchFrame;

}