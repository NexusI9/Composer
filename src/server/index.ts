// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import { ISettings, UpdateSettingsPayload } from "@ctypes/settings";
import { replaceSettingKey, getNodeAmount } from "./lib/utils";


let settings: ISettings = {
  state: [
    { label: "Include hidden layers", key: "HIDDEN", active: false, amount: 0 }
  ],
  type: [
    { label: "Frame", key: "FRAME", active: true, amount: 0 },
    { label: "Component", key: "COMPONENT", active: true, amount: 0 },
    { label: "Component Set", key: "COMPONENT_SET", active: true, amount: 0 },
    { label: "Instance", key: "INSTANCE", active: true, amount: 0 },
    /*{ label: "Text", key: "TEXT", active: true },
    { label: "Rectangle", key: "RECTANGLE", active: true },
    { label: "Group", key: "GROUP", active: true },
    { label: "Line", key: "LINE", active: true },
    { label: "Ellipse", key: "ELLIPSE", active: true },
    { label: "Polygon", key: "POLYGON", active: true },
    { label: "Star", key: "STAR", active: true },*/
  ],
  name: {
    include: "",
    exclude: ""
  }
};



figma.showUI(__html__, { themeColors: true });
figma.ui.resize(600, 400);
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {

  const { action, payload } = msg;
  switch (action) {

    case "UPDATE_SETTINGS":
      payload as UpdateSettingsPayload;

      Object.keys(payload).forEach(key => {

        const newValue = payload[key];
        switch (key) {
          case 'state':
          case 'type':
            replaceSettingKey(newValue, key, settings);
            break;

          case 'name':
            settings[key] = { ...settings[key], ...newValue };
        }

      });

      figma.ui.postMessage({ ...msg, payload: settings });

      break;

    case 'GET_SETTINGS':
      //fill up node amounts
      ["state", "type"].forEach(key => {
        settings[key as "state" | "type"].forEach(set => { set.amount = getNodeAmount(set.key) });
      });

      figma.ui.postMessage({ ...msg, payload: settings });
      break;

  }

};



figma.loadAllPagesAsync().then(_ => {

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