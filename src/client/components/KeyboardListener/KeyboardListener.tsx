import { CallbackMethod } from "@ctypes/api";
import { ReactNode, useEffect } from "react";

export interface IKeyboardCallback {
  action: CallbackMethod;
  keys: string[];
}

export default ({
  children,
  commands,
}: {
  children: ReactNode;
  commands: IKeyboardCallback[];
}) => {
    
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      commands.forEach(({ action, keys }) => {
        let isAction = new Array(keys.length).fill(false);

        console.log(isAction);
        switch (action.type) {
          case "API":
            break;

          case "FUNCTION":
            break;
        }
      });
    }; 

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return <>{children}</>;
};
