// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { ISettings, UpdateSettingsPayload } from "@ctypes/settings";
import { replaceSettingKey, getNodeAmount, validateActiveComponent } from "./lib/utils";

/**
 * {
 *   fdfjkdjkgf30dl: [{
 *      dark: on
 *      opened: off
 *      preview: bytearray
 *    },{
 *      dark: off
 *      opened: off
 *      preview: bytearray
 *    }]
 * }
 */

let activeComponent: undefined | ComponentSetNode;
let variants = [];

const DEFAULT_WINDOW_WIDTH = 600;
const DEFAULT_WINDOW_HEIGHT = 400;

figma.showUI(__html__, { themeColors: true });
figma.ui.resize(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {

  const { action, payload } = msg;
  switch (action) {

    case 'RESIZE_WINDOW':
      figma.ui.resize(Math.max(payload.width, 540) || DEFAULT_WINDOW_WIDTH, Math.max(payload.height, 320) || DEFAULT_WINDOW_HEIGHT);
      break;

    case 'GET_ACTIVE_COMPONENT_VARIANTS_KEY':
      if (activeComponent) figma.ui.postMessage({ ...msg, payload: Object.keys(activeComponent.variantGroupProperties) });
      break;

  }

};

function activeComponentFromSelection(selection: readonly SceneNode[]) {

  activeComponent = validateActiveComponent(selection[0]);

  //Preload preview in cache
  if(activeComponent){
    console.log(activeComponent.id, activeComponent.children);
  }

  figma.ui.postMessage({ action: "UPDATE_ACTIVE_COMPONENT", payload: activeComponent });
}

figma.loadAllPagesAsync().then(_ => {

  activeComponentFromSelection(figma.currentPage.selection);

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