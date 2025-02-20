import { ISettingsConfigObject } from "@ctypes/settings";
import { Input } from "@components/Input";
import { createElement } from "react";

export default ({
  direction,
  label,
  icon,
  element,
  props,
}: ISettingsConfigObject) => {
  return (
    <Input.Container direction={direction}>
      {label || icon ? <Input.Label label={label} icon={icon} /> : false}
      {createElement(element, props)}
    </Input.Container>
  );
};
