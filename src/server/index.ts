// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { DEFAULT_WINDOW_HEIGHT, DEFAULT_WINDOW_WIDTH } from "@lib/constants";
import { generateDarkBackground, validateActiveComponent } from "./lib/utils";
import { VariantOrganiser } from "./lib/VariantOrganiser";
import { Store } from "./lib/store";

const store = new Store();
let activeComponent: undefined | Partial<ComponentSetNode>;
let organiser = new VariantOrganiser();
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

    case "GET_ACTIVE_COMPONENT":
      activeComponentFromSelection(figma.currentPage.selection);
      break;

    case "GET_SELECTION":
      figma.ui.postMessage({ ...msg, payload: currentSelection });
      break;

    case "ADD_DARK_BACKGROUND":
      // calculate bounding box
      if (!!currentSelection.length) generateDarkBackground(currentSelection);
      break;

    case "UPDATE_VARIANTS_CONFIGURATION":
      if (activeComponent) {
        // store new values in global state
        //TODO: merge the store with organiser (Organiser.store)
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
            justify: store.justify,
          }),
        });
      }
      break;

    case "RESET":
      store.reset();
      organiser.reset();
      break;
  }
};

figma.loadAllPagesAsync().then((_) => {
  //get selection on start
  currentSelection = [...figma.currentPage.selection];
  figma.ui.postMessage({
    action: "UPDATE_SELECTION",
    payload: currentSelection,
  });

  figma.on("selectionchange", () => {
    activeComponentFromSelection(figma.currentPage.selection);

    currentSelection = [...figma.currentPage.selection];
    figma.ui.postMessage({
      action: "UPDATE_SELECTION",
      payload: currentSelection,
    });
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
