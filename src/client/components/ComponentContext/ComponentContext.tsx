import { listen, send } from "@client/lib/api";
import { useEffect } from "react";

export interface IComponentContext {
    onChange: Function;
    children: JSX.Element
}

export type ActiveComponent = ComponentSetNode | undefined;

export default ({ onChange, children }: IComponentContext) => {

    useEffect(() => {
        send({ action: 'GET_SELECTION' });
    }, []);

    listen(({ action, payload }) => {
        switch (action) {
            case "UPDATE_ACTIVE_COMPONENT":
                onChange(payload);
                break;
        }
    });

    return (<>{children}</>);

}