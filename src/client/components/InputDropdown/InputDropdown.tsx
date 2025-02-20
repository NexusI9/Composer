import { ILayerNameSettings, ISettings } from '@ctypes/settings';
import { send } from "@client/lib/api";
import { Button, ChevronDownIcon, DropdownMenu } from "@radix-ui/themes";
import InputDropdownItem from './InputDropdown.Item';


interface IInputDropdown {
    label: string;
    content: ILayerNameSettings;
    settingKey: keyof ISettings;
}

export default ({ label, content, settingKey }: IInputDropdown) => {

    return (<DropdownMenu.Root>
        <DropdownMenu.Trigger><Button variant="ghost" color="gray">{label} <ChevronDownIcon /></Button></DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
            {Object.keys(content).map(key => <InputDropdownItem
                label={key}
                key={key}
                value={content[key as keyof typeof content]}
                onConfirm={(value) => {
                    send({
                        action: "UPDATE_SETTINGS",
                        payload: {
                            [settingKey]: { [key]: String(value) }
                        }
                    });
                }}
            />)
            }
        </DropdownMenu.Content>
    </DropdownMenu.Root>)
}
