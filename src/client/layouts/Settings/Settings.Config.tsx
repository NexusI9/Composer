import { IRequest, send } from "@client/lib/api";
import Combobox from "@components/Combobox/Combobox";
import ComboboxText from "@components/Combobox/Combobox.Text";
import { FunctionComponent } from "react";
import InputAmount from "../../../../../../../../.emacs.d/backup/!Users!elkhantour!Documents!Websites!FigmaPlugins!Composer!src!client!components!InputAmount!InputAmount.tsx~";

interface IComboboxState {
  activeVariants: string[];
  setActiveVariants: Function;
}

const handleOnComboboxChange = ({
  index,
  value,
  itemIndex,
  state,
}: {
  index: number;
  value: string;
  itemIndex: number;
  state: IComboboxState;
}) => {
  let APIValue = itemIndex == 0 ? undefined : value;
  const temp = state.activeVariants;
  temp[index] = value;
  state.setActiveVariants([...temp]);

  send({
    action: "UPDATE_VARIANTS_CONFIGURATION",
    payload: { index, value: APIValue },
  });
};

export interface ISettingsInputConfig {
  element: FunctionComponent;
  props: Object;
}

export const comboboxConfig: ISettingsInputConfig = (
  label: string,
  paramIndex: number,
  active: ComponentSetNode | undefined,
  state: IComboboxState,
) => ({
  element: Combobox as FunctionComponent,
  props: {
    label,
    content: {
      key: active, //append a key so Combobox only reload when this key changes instead of the whole content
      type: "ASYNC",
      placeholder: "None",
      action: "GET_ACTIVE_COMPONENT_VARIANTS_KEY",
      transformer: (e: IRequest) => {
        //Add empty initial value
        e.payload.unshift("None");
        return e.payload;
      },
      element: ComboboxText,
      props: (e: string) => ({
        disabled: e != "None" && state.activeVariants.includes(e),
      }),
    },
    onChange: (value: string, index: number) =>
      handleOnComboboxChange({
        index: paramIndex,
        value,
        itemIndex: index,
        state,
      }),
  },
});

export const inputAmountConfig: ISettingsInputConfig = (
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
