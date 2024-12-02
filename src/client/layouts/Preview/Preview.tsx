import ComponentContext, { ActiveComponent } from "@components/ComponentContext/ComponentContext";
import { Text } from "@radix-ui/themes";
import { useState } from "react";
import ComponentIcon from "@icons/component.svg";
import "./Preview.scss";
import Matrix from "./Matrix";


export default () => {

    const [active, setActive] = useState<ActiveComponent>(undefined);

    return (
        <ComponentContext onChange={(e: any) => setActive(e)}>
            <div className="preview flex f-col gap-l f-center padding-2xl flex-grow full-height">
                {
                    active &&
                    <>
                        <header>
                            <Text size="1" className="flex f-row f-center-h gap-s">Preview for <span className="flex f-row gap-xs f-center-h"><ComponentIcon />{active.name}</span></Text>
                        </header>
                        <Matrix />
                    </>
                    || <Text size="1">Select a component with variants to begin.</Text>
                }
            </div>
        </ComponentContext>);
}