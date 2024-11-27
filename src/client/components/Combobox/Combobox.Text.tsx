import { Text } from '@radix-ui/themes';
import './Combobox.Text.scss';

export interface IComboBoxText {
    disabled: boolean;
    children: JSX.Element;
    onClick?: Function;
}


export default ({ children, disabled, onClick }: IComboBoxText) => {

    return (<Text
        className='combobox-text no-user-select cursor-pointer'
        size="1"
        onClick={() => onClick && onClick()}
        data-disabled={disabled}>{children}</Text>);
}