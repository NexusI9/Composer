import { TextField } from "@radix-ui/themes";
import { BaseSyntheticEvent, useEffect, useRef } from "react";

export interface IInputAmount {
  min: number;
  max: number;
  defaultValue: number;
  icon?: JSX.Element;
  onChange: (e: BaseSyntheticEvent) => void;
}

export default ({ defaultValue, min, max, icon, onChange }: IInputAmount) => {
  const ref = useRef<any>();

  useEffect(() => {
    const handleOnKeyUp = (e: any) => onChange && onChange(e);
    const handleOnKeyDown = (e: any) => {
      if (e.shiftKey && e.key == "ArrowUp") {
        e.preventDefault();
        e.target.value = Math.min(Number(e.target.value) + 10, max);
      } else if (e.shiftKey && e.key == "ArrowDown") {
        e.preventDefault();
        e.target.value = Math.max(Number(e.target.value) - 10, min);
      }
    };

    ref.current?.addEventListener("keyup", handleOnKeyUp);
    ref.current?.addEventListener("keydown", handleOnKeyDown);

    return () => {
      ref.current?.removeEventListener("keyup", handleOnKeyUp);
      ref.current?.removeEventListener("keydown", handleOnKeyDown);
    };
  }, [ref.current]);
  return (
    <TextField.Root
      ref={ref}
      type="number"
      defaultValue={defaultValue}
      min={min}
      max={max}
    >
      <TextField.Slot>{icon && icon}</TextField.Slot>
    </TextField.Root>
  );
};
