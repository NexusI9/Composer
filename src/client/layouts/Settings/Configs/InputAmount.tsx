import { BaseSyntheticEvent, FunctionComponent } from "react";
import { Input } from "@components/Input";
import {
  ISettingsConfigObject,
  ISettingsInputConfigBase,
} from "@ctypes/settings";
import { IInputAmount } from "@components/Input/InputAmount";
import { send } from "@client/lib/api";

export interface ISettingsInputConfig {
  element: FunctionComponent;
  props: Object;
}

export interface ISettingsAmount
  extends ISettingsInputConfigBase,
    Omit<IInputAmount, "onChange"> {
  gapType: "COLUMN" | "ROW";
}

export const inputAmountConfig = ({
  label,
  min,
  max,
  icon,
  direction,
  defaultValue,
  gapType,
}: ISettingsAmount): ISettingsConfigObject => ({
  element: Input.Amount,
  label,
  direction,
  props: {
    defaultValue,
    icon,
    min,
    max,
    onChange: (input: BaseSyntheticEvent) => {
      send({
        action: "UPDATE_VARIANTS_CONFIGURATION",
        payload: {
          [gapType == "COLUMN" ? "columnGap" : "rowGap"]: Number(
            input.target.value,
          ),
        },
      });
    },
  },
});
