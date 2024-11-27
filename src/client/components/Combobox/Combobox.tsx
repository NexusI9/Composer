import { get, IRequest } from '@client/lib/api';
import { Button, ChevronDownIcon, DropdownMenu, Text } from '@radix-ui/themes';
import { createElement, FunctionComponent, useEffect, useState } from 'react';
import "./Combobox.scss";

export interface IComboboxContent {
    element: FunctionComponent<Object>,
    props: any | ((e: string) => Object);
    key: string;
}

export interface IComboboxAsyncContent extends IRequest, IComboboxContent {
    type: 'ASYNC';
    placeholder: string;
    transformer?: (e: any) => string[];
}

export interface IComboboxDefaultContent extends IComboboxContent {
    type: 'DEFAULT';
    items: string[];
}

export interface ICombobox {
    label?: string;
    content: IComboboxDefaultContent | IComboboxAsyncContent;
    onChange: (e: string) => any;
}

export default ({ label, content, onChange }: ICombobox) => {

    const [innerContent, setInnerContent] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    useEffect(() => {

        switch (content.type) {
            case 'ASYNC':
                setInnerContent([content.placeholder]);
                get({ action: content.action }).then(data => setInnerContent(content.transformer ? content.transformer(data) : data.payload));
                break;

            case 'DEFAULT':
            default:
                setInnerContent(content.items);

        }

    }, [content.key]);


    return (<DropdownMenu.Root>
        <div className='combobox-trigger flex f-col gap-s'>
            {label && <Text size="1" >{label}</Text>}
            <DropdownMenu.Trigger>
                <Button className="flex f-row f-between" variant='outline' color='gray'>{innerContent[activeIndex]} <ChevronDownIcon /></Button>
            </DropdownMenu.Trigger>
        </div>

        <DropdownMenu.Content variant='soft'>
            {innerContent.map((value, i) =>
                createElement(content.element, {
                    ...content.props(value),
                    onClick: () => {
                        content.props.onClick && content.props.onClick();
                        onChange(value);
                        setActiveIndex(i);
                    },
                    key: value + i + performance.now(),
                    children: <>{value}</>
                }))}
        </DropdownMenu.Content>
    </DropdownMenu.Root>)
}