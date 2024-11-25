import { listen } from "@client/lib/api";

export interface IComponentContext {
    onChange: Function;
    children: JSX.Element
}

export default ({ onChange, children }: IComponentContext) => {

    listen(({ action, payload }) => {
        switch (action) {
            case "UPDATE_ACTIVE_COMPONENT":
                onChange(payload);
                break;
        }
    });

    return (<>{children}</>);

}