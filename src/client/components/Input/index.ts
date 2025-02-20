import "./index.scss";
import InputAmount from "@components/Input/InputAmount";
import InputContainer from "@components/Input/InputContainer";
import InputLabel from "@components/Input/InputLabel";

export const Input = ({ children }: { children: JSX.Element }) => children;

Input.Label = InputLabel;
Input.Container = InputContainer;
Input.Amount = InputAmount;
