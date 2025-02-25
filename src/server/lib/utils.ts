import {
  ISettings,
  ILayerBooleanSettings,
  LayerType,
} from "@ctypes/settings";

import {
  DARK_BACKGROUND_DEFAULT,
  DARK_BACKGROUND_DIVIDER,
  GAP_COLUMN_DEFAULT,
  GAP_ROW_DEFAULT,
} from "@lib/constants";

export function replaceSettingKey(
  newValue: ILayerBooleanSettings,
  key: "state" | "type",
  settings: ISettings,
) {
  let targetIndex = settings[key].findIndex(
    (item) => item.key === newValue.key,
  );
  if (targetIndex > -1) settings[key][targetIndex] = newValue;
}

export function getNodeAmount(type: LayerType | "HIDDEN") {
  switch (type) {
    case "HIDDEN":
      return figma.currentPage.findChildren((child) => child.visible === false)
        .length;

    default:
      return figma.currentPage.findChildren((child) => child.type === type)
        .length;
  }
}

export function validateActiveComponent(
  node: undefined | SceneNode,
): undefined | Partial<ComponentSetNode> {
  if (!node) {
    return node;
  }
  return node.type == "COMPONENT_SET" ? clone(node) : undefined;
}

export function clone(source: Object): Partial<Object> {
  const target = {};
  for (const key in source) {
    try {
      target[key as keyof typeof target] = source[key as keyof typeof target];
    } catch {}
  }
  return target;
}


export function generateDarkBackground(currentSelection: SceneNode[] ){
    const boundingBox = {
        x: Infinity,
        y: Infinity,
        width: -Infinity,
        height: -Infinity,
      };

      currentSelection.forEach((item) => {
        const { absoluteBoundingBox } = item;

        if (absoluteBoundingBox) {
          boundingBox.x = Math.min(absoluteBoundingBox.x, boundingBox.x);
          boundingBox.y = Math.min(absoluteBoundingBox.y, boundingBox.y);
          boundingBox.width = Math.max(
            absoluteBoundingBox.x + absoluteBoundingBox.width,
            boundingBox.width,
          );
          boundingBox.height = Math.max(
            absoluteBoundingBox.y + absoluteBoundingBox.height,
            boundingBox.height,
          );
        }
      });

      boundingBox.width = Math.abs(
        Math.abs(boundingBox.width) - Math.abs(boundingBox.x),
      );
      boundingBox.height = Math.abs(
        Math.abs(boundingBox.height) - Math.abs(boundingBox.y),
      );

      // create background
      const rect = figma.createRectangle();

      rect.name = "composer-dark-background";
      rect.cornerRadius = 3;

      rect.x = Math.round(
        boundingBox.x - GAP_COLUMN_DEFAULT / DARK_BACKGROUND_DIVIDER,
      );
      rect.y = Math.round(
        boundingBox.y - GAP_ROW_DEFAULT / DARK_BACKGROUND_DIVIDER,
      );
      rect.resize(
        Math.round(
          boundingBox.width +
            (2 * GAP_COLUMN_DEFAULT) / DARK_BACKGROUND_DIVIDER,
        ),
        Math.round(
          boundingBox.height + (2 * GAP_ROW_DEFAULT) / DARK_BACKGROUND_DIVIDER,
        ),
      );
      rect.fills = [{ type: "SOLID", color: DARK_BACKGROUND_DEFAULT }];
      figma.currentPage.insertChild(0, rect);

}
