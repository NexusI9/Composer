import { Text } from "@radix-ui/themes";
import { createElement } from "react";

export interface IInputLabel {
  label?: string | undefined;
  icon?: React.FunctionComponent;
}

export default ({ label, icon }: IInputLabel) => (
  <div className="input-label flex f-row gap-xs">
    {icon && createElement(icon)}
    {label && <Text size="1">{label}</Text>}
  </div>
);
