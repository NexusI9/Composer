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
  temp[index] = value;

  // handle if None is selected
  if (itemIndex == 0) {
    temp[index] = undefined;
    /*
      handle if second combobox is filled but remove the first one
      [ Value A ] [ Value B ] ===> [ None ] [ Value B ]
    */
    if (index == 0 && temp[1]) temp[1] = undefined;
    if (index == 2 && temp[3]) temp[3] = undefined;
  }

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
  value: string;
}

export const comboboxConfig = ({
  paramIndex,
  active,
  state,
  label,
  direction,
  disabled,
  value,
}: ISettingsCombobox): ISettingsConfigObject => ({
  element: Combobox,
  label,
  direction,
  props: {
    label,
    disabled,
    value,
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
