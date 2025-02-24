import { SegmentedControl } from "@radix-ui/themes";
import JustifyLeftIcon from "@icons/justify-left.svg";
import JustifyRightIcon from "@icons/justify-right.svg";
import JustifyCenterIcon from "@icons/justify-center.svg";
import { createElement } from "react";
import { send } from "@client/lib/api";

const alignMap = [
  {
    icon: JustifyLeftIcon,
    command: {
      action: "UPDATE_VARIANTS_CONFIGURATION",
      payload: { justify: "LEFT" },
    },
    value: "justify_left",
  },
  {
    icon: JustifyCenterIcon,
    command: {
      action: "UPDATE_VARIANTS_CONFIGURATION",
      payload: { justify: "CENTER" },
    },
    value: "justify_center",
  },
  {
    icon: JustifyRightIcon,
    command: {
      action: "UPDATE_VARIANTS_CONFIGURATION",
      payload: { justify: "RIGHT" },
    },
    value: "justify_right",
  },
];

export default () => {
  return (
    <SegmentedControl.Root defaultValue={alignMap[0].value}>
      {alignMap.map(({ icon, value, command }) => (
        <SegmentedControl.Item
          key={value}
          value={value}
          onClick={() => send(command)}
        >
          {createElement(icon)}
        </SegmentedControl.Item>
      ))}
    </SegmentedControl.Root>
  );
};
