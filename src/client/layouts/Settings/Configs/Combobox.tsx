import { IRequest, send } from "@client/lib/api";
import Combobox from "@components/Combobox/Combobox";
import ComboboxText from "@components/Combobox/Combobox.Text";
import {
  ISettingsConfigObject,
  ISettingsInputConfigBase,
} from "@ctypes/settings";

interface IComboboxState {
  activeVariants: (string | undefined)[];
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
  const APIValue: string | undefined = itemIndex == 0 ? undefined : value;
  const temp = state.activeVariants;
  temp[index] = itemIndex == 0 ? undefined : value;

  state.setActiveVariants([...temp]);

  send({
    action: "UPDATE_VARIANTS_CONFIGURATION",
    payload: { index, value: APIValue },
  });
};

export interface ISettingsCombobox extends ISettingsInputConfigBase {
  paramIndex: number;
  active: ComponentSetNode | undefined;
  state: IComboboxState;
  disabled?: boolean;
}

export const comboboxConfig = ({
  paramIndex,
  active,
  state,
  label,
  direction,
  disabled,
}: ISettingsCombobox): ISettingsConfigObject => ({
  element: Combobox,
  label,
  direction,
  props: {
    label,
    disabled,
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
