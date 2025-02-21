import { ISettingsConfigObject } from "@ctypes/settings";
import { Input } from "@components/Input";
import { createElement } from "react";

export default ({
  direction,
  label,
  element,
  props,
}: ISettingsConfigObject) => {
  return (
    <Input.Container direction={direction}>
      {label ? <Input.Label label={label} /> : false}
      {createElement(element, props)}
    </Input.Container>
  );
};
