import {
  GAP_COLUMN_DEFAULT,
  GAP_ROW_DEFAULT,
  JUSTIFY_ALIGNMENT_DEFAULT,
} from "@lib/constants";

export class Store {
  value: string = "None";
  index: number = 0;
  columnGap: number = GAP_COLUMN_DEFAULT;
  rowGap: number = GAP_ROW_DEFAULT;
  justify: "LEFT" | "CENTER" | "RIGHT" = JUSTIFY_ALIGNMENT_DEFAULT;

  constructor() {}

  update(obj: any) {
    Object.keys(obj).forEach((key) => {
      if (key in this)
        this[key as keyof typeof this] = obj[key as keyof typeof this];
    });
  }

  reset() {
    this.value = "None";
    this.index = 0;
    this.columnGap = GAP_COLUMN_DEFAULT;
    this.rowGap = GAP_ROW_DEFAULT;
  }
}
