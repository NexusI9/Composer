import { TextField, Text } from "@radix-ui/themes";

interface IInputDropdownItem {
    label: string;
    onConfirm?: (e: string) => void;
    value?: string;
}

export default ({ label, onConfirm, value = undefined }: IInputDropdownItem) => {

    return (
        <div
            className="no-highlight events-none flex f-col gap-xs f-start padding-v-m"
            style={{ height: 'auto' }}
        >
            <Text size="2">{label}</Text>
            <TextField.Root
                className="events-auto"
                placeholder="Separate with space"
                onBlur={e => { if (onConfirm) onConfirm(e.target.value); }}
                defaultValue={value}
            />
        </div>
    )

}