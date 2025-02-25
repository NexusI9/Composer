import AlignMatrix from "@components/AlignMatrix/AlignMatrix";
import { ISettingsConfigObject } from "@ctypes/settings";

export const alignMatrixConfig = (): ISettingsConfigObject => ({
  element: AlignMatrix,
  props: {},
  direction: "VERTICAL",
});
