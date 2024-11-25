import { get, IRequest } from '@client/lib/api';
import { Button, ChevronDownIcon, DropdownMenu, Text } from '@radix-ui/themes';
import { useEffect, useState } from 'react';

export interface IComboboxAsyncContent extends IRequest {
    type: 'ASYNC';
    placeholder: string;
    transformer?: (e: any) => string[];
}

export interface IComboboxDefaultContent {
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

    }, [content]);


    return (<DropdownMenu.Root>
        <div className='combobox-trigger flex f-col gap-s'>
            {label && <Text size="1" >{label}</Text>}
            <DropdownMenu.Trigger>
                <Button className="flex f-row f-between" variant='outline' color='gray'>{innerContent[activeIndex]} <ChevronDownIcon /></Button>
            </DropdownMenu.Trigger>
        </div>

        <DropdownMenu.Content variant='soft'>
            {innerContent.map((item, i) => <Text 
            className='no-user-select cursor-pointer'
            size="1" onClick={() => { 
                onChange(item);
                setActiveIndex(i);
            }} 
            key={item + i + performance.now()}>{item}</Text>)}
        </DropdownMenu.Content>
    </DropdownMenu.Root>)
}