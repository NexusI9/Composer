// imports
import "./Settings.scss";
import SettingsOrganise from "./SettingsOrganise";
import SettingsGeneral from "./SettingsGeneral";
import { Tabs } from "@radix-ui/themes";
import { createElement } from "react";

const tabs = [
  { name: "Organise", element: SettingsOrganise, value: "orgcomp" },
  { name: "Other", element: SettingsGeneral, value: "genaction" },
];

export default () => {
  return (
    <div className="settings flex f-col full-width">
      <Tabs.Root defaultValue={tabs[0].value}>
        <Tabs.List>
          {tabs.map(({ name, value }) => (
            <Tabs.Trigger key={`${name}trigger`} value={value}>
              {name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {tabs.map(({ name, element, value }) => (
          <Tabs.Content key={`${name}content`} value={value}>
            {createElement(element)}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  );
};
