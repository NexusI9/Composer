import { ISettings, ILayerBooleanSettings, ValidNodeType, ILayerNameSettings, LayerType } from "@ctypes/settings";

export function replaceSettingKey(newValue: ILayerBooleanSettings, key: "state" | "type", settings: ISettings) {
    let targetIndex = settings[key].findIndex(item => item.key === newValue.key);
    if (targetIndex > -1) settings[key][targetIndex] = newValue;
}


export function getNodeAmount(type: LayerType | "HIDDEN") {

    switch (type) {
        case "HIDDEN":
            return figma.currentPage.findChildren(child => child.visible === false).length;

        default:
            return figma.currentPage.findChildren(child => child.type === type).length;
    }
}

export function validateActiveComponent(node: undefined | SceneNode): undefined | Partial<ComponentSetNode> {
    if (!node) { return node; }
    return node.type == "COMPONENT_SET" ? clone(node) : undefined;
}

export function clone(source: Object): Partial<Object> {

    const target = {};
    for (const key in source) {
        try {
            target[key as keyof typeof target] = source[key as keyof typeof target];
        } catch { }
    }
    return target;
}