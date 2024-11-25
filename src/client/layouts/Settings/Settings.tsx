import { get, listen, send } from "@client/lib/api";
import { ISettings, LayerType } from "@ctypes/settings";
import { Text } from "@radix-ui/themes";
import { createElement, useEffect, useState } from "react";
import { MixerVerticalIcon } from "@radix-ui/react-icons";
import InputDropdown from "@components/InputDropdown/InputDropdown";
import CheckboxDropdown from "@components/CheckboxDropdown/CheckboxDropdown";

interface IFilter {
    element: (arg: any) => JSX.Element;
    settingKey: keyof ISettings;
    label: string;
}

export default () => {

    const [settings, setSettings] = useState<ISettings>();

    const filterMap: Array<IFilter> = [
        { element: CheckboxDropdown, settingKey: "type", label: "Type" },
        { element: CheckboxDropdown, settingKey: "state", label: "State" },
        { element: InputDropdown, settingKey: "name", label: "Name" }
    ]

    useEffect(() => {
        get({ action: "GET_SETTINGS" }).then(({ payload }) => setSettings(payload));
    }, []);

    listen(({ action, payload }) => {
        switch (action) {
            case "UPDATE_SETTINGS":
                setSettings(payload);
                send({ action: "RELOAD_TREE" });
                break;
        }
    });

    return (<div className="flex f-row gap-2xl f-center-h">

        <div className="flex f-row gap-s f-center color-text-base-400">
            <MixerVerticalIcon />
            <Text size="2">Filter by</Text>
        </div>

        {settings &&
            <div className="flex f-row gap-2xl">
                {filterMap.map(({ element, settingKey, label }, i) => createElement(element, {
                    key: `filter${i}`,
                    content: settings[settingKey],
                    label,
                    settingKey
                }))}
            </div>
        }



    </div>);
}