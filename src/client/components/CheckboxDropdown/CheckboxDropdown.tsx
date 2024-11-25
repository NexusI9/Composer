import { ISettings } from '@ctypes/settings';
import { send } from "@client/lib/api";
import { Button, Checkbox, ChevronDownIcon, DropdownMenu } from "@radix-ui/themes";
import NumberTag from '@components/NumberTag/NumberTag';


interface ICheckboxDropdown {
    label: string;
    content: ISettings["state" | "type"];
    settingKey: keyof ISettings;
}

export default ({ label, content, settingKey }: ICheckboxDropdown) => {


    return (<DropdownMenu.Root>
        <DropdownMenu.Trigger><Button variant="ghost" color="gray">{label} <ChevronDownIcon /></Button></DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
            {content.map(item =>
                <label
                    key={item.key + item.label + item.active}
                    onClick={e => {
                        e.preventDefault()
                        send({
                            action: "UPDATE_SETTINGS",
                            payload: {
                                [settingKey]: { ...item, active: !item.active }
                            }
                        });
                    }}
                    className="cursor-pointer flex f-row f-between gap-xl f-center-h padding-v-s"
                    htmlFor={item.key}>
                    <span className='no-user-select flex f-row gap-m f-center-h'>
                        <Checkbox id={item.key} defaultChecked={item.active} />
                        {item.label}
                    </span>
                    <NumberTag text={String(item.amount)}/>
                </label>

            )}
        </DropdownMenu.Content>
    </DropdownMenu.Root>)
}