export type LayerType =
    "FRAME"
    | "TEXT"
    | "RECTANGLE"
    | "GROUP"
    | "LINE"
    | "ELLIPSE"
    | "POLYGON"
    | "STAR"
    | "COMPONENT"
    | "COMPONENT_SET"
    | "INSTANCE";


export type ValidNodeType = FrameNode | TextNode | RectangleNode | GroupNode | LineNode | EllipseNode | PolygonNode | StarNode | ComponentNode | ComponentSetNode | InstanceNode;

type LayerState = "HIDDEN";


export interface ILayerBooleanSettings {
    label: string;
    key: LayerType | LayerState;
    active: boolean;
    amount?:number;
}

export interface ILayerNameSettings {
    include: string;
    exclude: string;
}

export interface ISettings {
    state: Array<ILayerBooleanSettings>;
    type: Array<ILayerBooleanSettings>;
    name: ILayerNameSettings;
}

export type UpdateSettingsPayload =
    { state: ILayerBooleanSettings }
    | { type: ILayerBooleanSettings }
    | { name: ILayerNameSettings };


export interface IVariantComponent {
    id:string;
    image: string;
}
    