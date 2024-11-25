import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Text } from "@radix-ui/themes";
import { useState } from "react";

export default () => {

    const [active, setActive] = useState(false);

    return (
        <ComponentContext onChange={(e: any) => setActive(!!e)}>
            <div className="flex f-col gap-l f-center padding-2xl flex-grow full-height">
                {
                    active && <p>component selected</p> || <Text size="1">Select a component with variants to begin.</Text>
                }
            </div>
        </ComponentContext>);
}