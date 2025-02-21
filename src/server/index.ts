// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import {
  DARK_BACKGROUND_DEFAULT,
  DARK_BACKGROUND_DIVIDER,
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  GAP_COLUMN_DEFAULT,
  GAP_ROW_DEFAULT,
} from "@lib/constants";
import { validateActiveComponent } from "./lib/utils";
import { VariantOrganiser } from "./lib/VariantOrganiser";
import { Store } from "./lib/store";

let activeComponent: undefined | Partial<ComponentSetNode>;
let organiser = new VariantOrganiser();
const store = new Store();
let currentSelection: SceneNode[] = [];

function activeComponentFromSelection(selection: readonly SceneNode[]) {
  activeComponent = validateActiveComponent(selection[0]);

  //Preload preview in cache
  if (activeComponent) organiser.init(activeComponent);
  else organiser.destroy();

  figma.ui.postMessage({
    action: "UPDATE_ACTIVE_COMPONENT",
    payload: activeComponent,
  });
}

figma.showUI(__html__, { themeColors: true });
figma.ui.resize(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  const { action, payload } = msg;
  switch (action) {
    case "RESIZE_WINDOW":
      figma.ui.resize(
        Math.max(payload.width, 250) || DEFAULT_WINDOW_WIDTH,
        Math.max(payload.height, 320) || DEFAULT_WINDOW_HEIGHT,
      );
      break;

    case "GET_ACTIVE_COMPONENT_VARIANTS_KEY":
      if (activeComponent)
        figma.ui.postMessage({
          ...msg,
          payload: Object.keys(activeComponent.variantGroupProperties || {}),
        });
      break;

    case "GET_SELECTION":
      activeComponentFromSelection(figma.currentPage.selection);
      break;

    case "ADD_DARK_BACKGROUND":
      // calculate bounding box
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
      break;

    case "UPDATE_VARIANTS_CONFIGURATION":
      if (activeComponent) {
        // store new values in global state
        store.update(payload);

        // update figma layout
        figma.ui.postMessage({
          ...msg,
          action: "UPDATE_TABLE",
          payload: organiser.update(activeComponent, {
            id: store.index,
            value: store.value,
            columnGap: store.columnGap,
            rowGap: store.rowGap,
          }),
        });
      }
      break;

    case "RESET":
      organiser.reset();
      break;
  }
};

figma.loadAllPagesAsync().then((_) => {
  figma.on("selectionchange", () => {
    activeComponentFromSelection(figma.currentPage.selection);

    currentSelection = [...figma.currentPage.selection];
  });

  figma.on("documentchange", ({ documentChanges }) => {
    //@ts-ignore
    documentChanges.forEach(({ type, properties }) => {
      if (
        (type == "PROPERTY_CHANGE" && properties.includes("name")) ||
        type == "DELETE" ||
        type == "CREATE"
      ) {
      }
    });
  });
});
