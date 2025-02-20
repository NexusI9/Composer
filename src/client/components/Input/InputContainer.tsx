import { ReactNode } from "react";
import "./InputContainer.scss";

export interface IInputContainer {
  direction: "VERTICAL" | "HORIZONTAL";
  children?: ReactNode;
  className?: string;
}

export default ({ direction, className, children }: IInputContainer) => {
  return (
    <div
      className={`input-container flex gap-s ${className || ""}`}
      data-direction={direction}
    >
      {children && children}
    </div>
  );
};
