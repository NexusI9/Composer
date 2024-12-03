// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { validateActiveComponent } from "./lib/utils";
import { VariantOrganiser } from "./lib/VariantOrganiser";

let activeComponent: undefined | Partial<ComponentSetNode>;
let organiser = new VariantOrganiser();

const DEFAULT_WINDOW_WIDTH = 250;
const DEFAULT_WINDOW_HEIGHT = 400;

function activeComponentFromSelection(selection: readonly SceneNode[]) {

  activeComponent = validateActiveComponent(selection[0]);

  //Preload preview in cache
  if (activeComponent) organiser.init(activeComponent);
  else organiser.destroy();

  figma.ui.postMessage({ action: "UPDATE_ACTIVE_COMPONENT", payload: activeComponent });
}

figma.showUI(__html__, { themeColors: true });
figma.ui.resize(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {

  const { action, payload } = msg;
  switch (action) {

    case 'RESIZE_WINDOW':
      figma.ui.resize(Math.max(payload.width, 250) || DEFAULT_WINDOW_WIDTH, Math.max(payload.height, 320) || DEFAULT_WINDOW_HEIGHT);
      break;

    case 'GET_ACTIVE_COMPONENT_VARIANTS_KEY':
      if (activeComponent) figma.ui.postMessage({ ...msg, payload: Object.keys(activeComponent.variantGroupProperties || {}) });
      break;

    case 'GET_SELECTION':
      activeComponentFromSelection(figma.currentPage.selection);
      break;

    case 'UPDATE_VARIANTS_CONFIGURATION':
      if (activeComponent) {
        figma.ui.postMessage({
          ...msg,
          action: "UPDATE_TABLE",
          payload: organiser.update(activeComponent, { id: payload.index, value: payload.value })
        });
      }
      break;

      case 'RESET':
       organiser.reset();
        break;

  }

};

figma.loadAllPagesAsync().then(_ => {


  figma.on("selectionchange", () => activeComponentFromSelection(figma.currentPage.selection));

  figma.on("documentchange", ({ documentChanges }) => {

    //@ts-ignore
    documentChanges.forEach(({ type, properties }) => {

      if ((type == "PROPERTY_CHANGE" && properties.includes("name")) ||
        type == "DELETE" ||
        type == "CREATE"
      ) {

      }

    });

  });
});