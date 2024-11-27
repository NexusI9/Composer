import "./Settings.scss";
import { IRequest, listen } from "@client/lib/api";
import Combobox from "@components/Combobox/Combobox";
import ComboboxText from "@components/Combobox/Combobox.Text";
import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Button, Text } from "@radix-ui/themes";
import { Children, createElement, FunctionComponent, useEffect, useState } from "react";

interface IParamItem {
    element: FunctionComponent<Object>;
    props: Object;
}

interface IParam {
    heading: string;
    options: Array<IParamItem>;
}


export default () => {

    const [active, setActive] = useState(false);
    const [activeVariants, setActiveVariants] = useState<string[]>([]);
    const [parameters, setParameters] = useState<IParam[]>([]);

    const handleOnComboboxChange = ({ index, value }: { index: number, value: string }) => {
        
        const temp = activeVariants;
        temp[index] = value;
        /*const variantIndex = temp.indexOf(value);
        
        if (variantIndex < 0) temp.push(value);
        else temp.splice(variantIndex, 1);*/

        setActiveVariants([...temp]);

    };

    useEffect(() => {

        const comboboxOptions = (label: string, paramIndex: number) => ({
            element: Combobox as FunctionComponent,
            props: {
                label,
                content: {
                    key: active, //append a key so Combobox only reload when this key changes instead of the whole content
                    type: "ASYNC",
                    placeholder: "Loading...",
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
                onChange: (e: string) => handleOnComboboxChange({ index: paramIndex, value: String(e) })
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
        <ComponentContext onChange={(e: any) => setActive(e?.id)}>
            <div className="settings color-bg-base-900 padding-xl flex f-end" data-active={!!active}>
                <div className="settings-wrapper full-height flex f-col gap-2xl f-center-h f-between">
                    <div className="flex f-col gap-2xl">
                        {parameters.map(({ heading, options }, i) => <div className="flex f-col gap-m" key={`param${i}`}>
                            <Text size="1" weight="bold">{heading}</Text>
                            <div className="flex f-row gap-m">
                                {
                                    options.map(({ element, props }, j) => createElement(element, { ...props, key: `settingsoptions${i + j}` }))
                                }
                            </div>
                        </div>
                        )}

                    </div>

                    <Button className="full-width">Organize</Button>
                </div>
            </div>
        </ComponentContext>);
}