export type CallbackMethod = ICallbackMethodAPI | ICallbackMethodFunction;

export interface ICallbackMethodAPI {
  type: "API";
  action: string;
}

export interface ICallbackMethodFunction {
  type: "FUNCTION";
  action: Function;
}
