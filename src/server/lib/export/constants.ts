export const COLOR_STYLES: Record<string, Paint[]> = {
    transparent: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }],
    black: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }],
    grey: [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }],
    lightGrey: [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }]
};

export const DETAILS_WIDTH = 135;

export const FONT_FAMILY_ORDER = ['Primary', 'Secondary', 'Tertiary'];


export const DEFAULT_STYLE_PAINT: SolidPaint = {
    "type": "SOLID",
    "visible": true,
    "opacity": 1,
    "blendMode": "NORMAL",
    "color": {
        "r": 0.0,
        "g": 0.0,
        "b": 0.0
    },
    "boundVariables": {}
};