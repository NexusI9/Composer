// imports
import "./Settings.scss";
import SettingsOrganise from "./SettingsOrganise";
import SettingsGeneral from "./SettingsGeneral";
import { Tabs } from "@radix-ui/themes";
import { createElement } from "react";

const tabs = [
  {
    name: "Organise",
    element: SettingsOrganise,
    value: "orgcomp",
    onClick: void 0,
  },
  {
    name: "Other",
    element: SettingsGeneral,
    value: "genaction",
    onClick: void 0,
  },
];

export default () => {
  return (
    <div className="settings">
      <Tabs.Root defaultValue={tabs[0].value}>
        <Tabs.List>
          {tabs.map(({ name, value, onClick }) => (
            <Tabs.Trigger
              key={`${name}trigger`}
              onClick={onClick}
              value={value}
            >
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
