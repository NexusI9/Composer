import { ReactNode, useEffect } from "react";

interface ICallbackMethodAPI {
  type: "API";
  action: string;
}

interface ICallbackMethodFunction {
  type: "FUNCTION";
  action: Function;
}

export interface IKeyboardCallback {
  action: ICallbackMethodAPI | ICallbackMethodFunction;
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
