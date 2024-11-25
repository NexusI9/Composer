import { ITreeItem } from "@components/TreeItem/TreeItem";
import { ISettings, ILayerBooleanSettings, ValidNodeType, ILayerNameSettings, LayerType } from "@ctypes/settings";

export function replaceSettingKey(newValue: ILayerBooleanSettings, key: "state" | "type", settings: ISettings) {
    let targetIndex = settings[key].findIndex(item => item.key === newValue.key);
    if (targetIndex > -1) settings[key][targetIndex] = newValue;
}


export async function filterTree(tree: Array<ITreeItem>, settings: ISettings) {

    for (const branch of tree) {
        const node = await figma.getNodeByIdAsync(branch.id) as ValidNodeType;
        if (!node) { continue; }
        let cache = { state: false, type: false, exclude: false, include: false };

        Object.keys(settings).forEach(key => {

            const currentSetting = settings[key as keyof typeof settings];
            switch (key) {

                case 'type':
                    (currentSetting as ISettings['type']).forEach(({ key, active }) => {
                        if (branch.type === key) { cache.type = active; }
                    });
                    break;

                case 'state':
                    (currentSetting as ISettings['state']).forEach(state => {
                        if (state.key == "HIDDEN") {
                            cache.state = state.active || node.visible;
                        }
                    });
                    break;

                case 'name':
                    //Exclude
                    const exclude = (currentSetting as ILayerNameSettings).exclude;
                    if (exclude.length) {
                        for (const word of exclude.split(" ")) {
                            if (branch.path.includes(word)) {
                                cache.exclude = true;
                            }
                        }
                    }

                    //Include
                    const include = (currentSetting as ILayerNameSettings).include;
                    if (include.length) {
                        for (const word of include.split(" ")) {
                            if (branch.path.includes(word)) {
                                cache.include = true;
                            }
                        }
                    } else {
                        cache.include = true;
                    }

                    break;
            }
        });

        branch.active = cache.state
            && cache.type
            && !cache.exclude
            && cache.include;

        await filterTree(branch.subdir, settings);

    }

}


export function createTree() {

    const { children } = figma.currentPage;
    const tree: Array<ITreeItem> = [];

    //only keep relevant children
    const filteredChildren = children.filter(child => child.type.match(/FRAME|COMPONENT|COMPONENT_SET|INSTANCE/g));

    const createBranch = (node: ValidNodeType) => {
        const { name, type, x, y } = node;

        //remove spaces before and after slashes
        let path: string[] = name.replace(/\s*$/gm, '').replace(/\s*\/\s*/gm, '/').split('/');

        //had subfolder
        let currentLevel: typeof tree = tree;

        for (let p = 0; p < path.length; p++) {

            const folder = path[p];

            const targetFolder = currentLevel.find(item => item.name === folder);
            const branch: ITreeItem = {
                name: folder,
                path: name,
                id: node.id,
                subdir: [],
                active: node.visible,
                position: { x, y },
                type
            };

            if (!targetFolder) {
                currentLevel.push(branch);
                currentLevel = branch.subdir;
            }
            else {
                currentLevel = targetFolder.subdir;
            }


        }

    }

    filteredChildren.forEach(child => createBranch(child as ValidNodeType));

    return tree;
}


export function allInactive(branch: Array<ITreeItem>) {
    let all = true;

    if (!branch.length) { return false; }

    const checkActive = (ar: Array<ITreeItem>) => {

        if (ar.find(item => item.active == true)) {
            all = false;
        } else {
            //all false, check children
            ar.forEach(item => checkActive(item.subdir));
        }
    }

    checkActive(branch);

    return all;

}


export function getNodeAmount(type: LayerType | "HIDDEN") {

    switch (type) {
        case "HIDDEN":
            return figma.currentPage.findChildren(child => child.visible === false).length;

        default:
            return figma.currentPage.findChildren(child => child.type === type).length;
    }
}


export function sortTree(tree: Array<ITreeItem>) {

    tree.sort((a, b) => a.position.x - b.position.x);

    tree.forEach(({ subdir }) => sortTree(subdir));
}