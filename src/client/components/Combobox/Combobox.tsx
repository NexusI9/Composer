import { get, IRequest } from "@client/lib/api";
import { Button, ChevronDownIcon, DropdownMenu } from "@radix-ui/themes";
import { createElement, FunctionComponent, useEffect, useState } from "react";
import "./Combobox.scss";

export interface IComboboxContent {
  element: FunctionComponent<Object>;
  props: any | ((e: string) => Object);
  key: string;
}

export interface IComboboxAsyncContent extends IRequest, IComboboxContent {
  type: "ASYNC";
  placeholder: string;
  transformer?: (e: any) => string[];
}

export interface IComboboxDefaultContent extends IComboboxContent {
  type: "DEFAULT";
  items: string[];
}

export interface ICombobox {
  content: IComboboxDefaultContent | IComboboxAsyncContent;
  onChange: (v: string, i: number) => any;
  disabled?: boolean;
  value?: string;
}

export default ({ content, onChange, disabled, value }: ICombobox) => {
  const [innerContent, setInnerContent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const comboboxValue = value;

  useEffect(() => {
    if (disabled) setActiveIndex(0);
  }, [disabled]);

  useEffect(() => {
    switch (content.type) {
      case "ASYNC":
        setInnerContent([content.placeholder]);
        get({ action: content.action }).then((data) =>
          setInnerContent(
            content.transformer ? content.transformer(data) : data.payload,
          ),
        );
        break;

      case "DEFAULT":
      default:
        setInnerContent(content.items);
    }
  }, [content.key]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          className="flex f-row f-between"
          variant="outline"
          color="gray"
          {...(!!disabled && { "data-disabled": "" })}
        >
          {innerContent[activeIndex]} <ChevronDownIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content variant="soft">
        {innerContent.map((value, i) =>
          createElement(content.element, {
            ...content.props(value),
            onClick: () => {
              content.props.onClick && content.props.onClick();
              onChange(value, i);
              setActiveIndex(i);
            },
            key: value + i + comboboxValue,
            children: <>{value}</>,
          }),
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
