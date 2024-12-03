import "./Settings.scss";
import { IRequest, listen, send } from "@client/lib/api";
import Combobox from "@components/Combobox/Combobox";
import ComboboxText from "@components/Combobox/Combobox.Text";
import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Button, Text } from "@radix-ui/themes";
import { Children, createElement, FunctionComponent, useEffect, useState } from "react";
import ComponentIcon from "@icons/component.svg";

interface IParamItem {
    element: FunctionComponent<Object>;
    props: Object;
}

interface IParam {
    heading: string;
    options: Array<IParamItem>;
}


export default () => {

    const [active, setActive] = useState<ComponentSetNode>();
    const [activeVariants, setActiveVariants] = useState<string[]>([]);
    const [parameters, setParameters] = useState<IParam[]>([]);

    const handleOnComboboxChange = ({ index, value, itemIndex }: { index: number; value: string; itemIndex: number; }) => {

        let APIValue = itemIndex == 0 ? undefined : value;
        const temp = activeVariants;
        temp[index] = value;
        setActiveVariants([...temp]);

        send({ action: "UPDATE_VARIANTS_CONFIGURATION", payload: { index, value: APIValue } });
    };

    useEffect(() => {

        const comboboxOptions = (label: string, paramIndex: number) => ({
            element: Combobox as FunctionComponent,
            props: {
                label,
                content: {
                    key: active, //append a key so Combobox only reload when this key changes instead of the whole content
                    type: "ASYNC",
                    placeholder: "None",
                    action: "GET_ACTIVE_COMPONENT_VARIANTS_KEY",
                    transformer: (e: IRequest) => {
                        //Add empty initial value
                        e.payload.unshift("None");
                        return e.payload;
                    },
                    element: ComboboxText,
                    props: (e: string) => ({
                        disabled: e != "None" && activeVariants.includes(e)
                    })
                },
                onChange: (value: string, index: number) => handleOnComboboxChange({ index: paramIndex, value, itemIndex: index })
            }
        });

        setParameters([
            {
                heading: "Column",
                options: [
                    comboboxOptions('Property 1', 0),
                    comboboxOptions('Property 2', 1),
                ]
            },
            {
                heading: "Row",
                options: [
                    comboboxOptions('Property 1', 2),
                    comboboxOptions('Property 2', 3),
                ]
            }
        ]);

    }, [activeVariants, active]);


    useEffect(() => { setActiveVariants([]); }, [active]);

    return (
        <ComponentContext onChange={(e: any) => setActive(e)}>
            <div className="settings padding-xl flex full-width">
                <div className="settings-wrapper full-height flex f-col gap-2xl f-center-h f-between">
                    <div className="flex f-col gap-2xl full-width">
                        {parameters.map(({ heading, options }, i) => <div className="flex f-col gap-m" key={`param${i}`}>
                            <Text size="1" weight="bold">{heading}</Text>
                            <div className="flex f-row gap-m">
                                {
                                    options.map(({ element, props }, j) => createElement(element, { ...props, key: `settingsoptions${i}${j}` }))
                                }
                            </div>
                        </div>
                        )}

                    </div>

                    <div className="flex f-col gap-m full-width">
                        <Button>Confirm</Button>
                        <Button color="crimson" onClick={() => send({ action: "RESET" })} variant="outline">Reset</Button>
                    </div>

                </div>
                {<div className="settings-overlay full-width full-height flex f-col gap-m f-center padding-4xl text-center" data-display={!!!active}>
                    <Text size="4">Composer</Text>
                    <Text size="2">Select a component with variants to begin.</Text>
                </div>}
            </div>
        </ComponentContext>);
}