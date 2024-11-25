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

export function validateActiveComponent(selection: undefined | SceneNode): undefined | ComponentSetNode {
    if (!selection) { return selection; }
    return selection.type == "COMPONENT_SET" ? selection : undefined;
}