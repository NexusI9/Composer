import { ReactNode } from "react";
import "./Chip.scss";

export default ({ children }: { children: ReactNode }) => (
  <div className="chip flex f-center">{children}</div>
);
