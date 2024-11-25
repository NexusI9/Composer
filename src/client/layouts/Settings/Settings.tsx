import "./Settings.scss";
import { IRequest, listen } from "@client/lib/api";
import Combobox from "@components/Combobox/Combobox";
import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Button, Text } from "@radix-ui/themes";
import { createElement, FunctionComponent, useState } from "react";

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

    const handleOnComboboxChange = ({ index, value }: { index: number, value: string }) => {
        console.log({ index, value });
    };

    const comboboxOptions = (label: string, paramIndex: number) => ({
        element: Combobox as FunctionComponent,
        props: {
            label,
            content: {
                type: "ASYNC",
                placeholder: "Loading...",
                action: "GET_ACTIVE_COMPONENT_VARIANTS_KEY",
                transformer: (e: IRequest) => { e.payload.unshift("None"); return e.payload; } //Add empty initial value
            },
            onChange: (e: string) => handleOnComboboxChange({ index: paramIndex, value: String(e) })
        }
    });

    const paramMap: Array<IParam> = [
        {
            heading: "Column",
            options: [
                comboboxOptions('Property 1', 1),
                comboboxOptions('Property 2', 2),
            ]
        },
        {
            heading: "Row",
            options: [
                comboboxOptions('Property 1', 3),
                comboboxOptions('Property 2', 4),
            ]
        }
    ];


    return (
        <ComponentContext onChange={(e: any) => setActive(!!e)}>
            <div className="settings color-bg-base-900 padding-xl flex f-end" data-active={active}>
                <div className="settings-wrapper full-height flex f-col gap-2xl f-center-h f-between">
                    <div className="flex f-col gap-2xl">
                        {paramMap.map(({ heading, options }, i) => <div className="flex f-col gap-m" key={`param${i}`}>
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