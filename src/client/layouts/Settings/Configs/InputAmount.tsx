import { FunctionComponent } from "react";
import InputAmount from "@components/InputAmount/InputAmount";

export interface ISettingsInputConfig {
  element: FunctionComponent;
  props: Object;
}

export const inputAmountConfig = (
  label: string,
  min: number,
  max: number,
  step: number,
) => ({
  element: InputAmount as FunctionComponent,
  props: {
    label,
    min,
    max,
    step,
  },
});

