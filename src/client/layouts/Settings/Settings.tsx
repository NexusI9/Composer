import "./Settings.scss";
import { send } from "@client/lib/api";
import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Button, Text } from "@radix-ui/themes";
import { createElement, FunctionComponent, useEffect, useState } from "react";
import { comboboxConfig } from "./Configs/Combobox";
import { inputAmountConfig } from "./Configs/InputAmount";

interface IParamItem {
  element: FunctionComponent<Object>;
  props: Object;
}

interface IParam {
  heading: string;
  options: Array<IParamItem>;
}

export default () => {
  const [active, setActive] = useState<ComponentSetNode>();
  const [activeVariants, setActiveVariants] = useState<string[]>([]);
  const [parameters, setParameters] = useState<IParam[]>([]);

  useEffect(() => {
    setParameters([
      {
        heading: "Column",
        options: [
          comboboxConfig("Property 1", 0, active, {
            activeVariants,
            setActiveVariants,
          }),
          comboboxConfig("Property 2", 1, active, {
            activeVariants,
            setActiveVariants,
          }),
        ],
      },
      {
        heading: "Row",
        options: [
          comboboxConfig("Property 1", 2, active, {
            activeVariants,
            setActiveVariants,
          }),
          comboboxConfig("Property 2", 3, active, {
            activeVariants,
            setActiveVariants,
          }),
        ],
      },
      {
        heading: "Gap",
        options: [
          inputAmountConfig("Vertical", -1000, 1000, 1),
          inputAmountConfig("Horizontal", -1000, 1000, 1),
        ],
      },
    ]);
  }, [activeVariants, active]);

  useEffect(() => {
    setActiveVariants([]);
  }, [active]);

  return (
    <ComponentContext onChange={(e: any) => setActive(e)}>
      <div className="settings padding-xl flex full-width">
        <div className="settings-wrapper full-height flex f-col gap-2xl f-center-h f-between">
          <div className="flex f-col gap-2xl full-width">
            {parameters.map(({ heading, options }, i) => (
              <div className="flex f-col gap-m" key={`param${i}`}>
                <Text size="1" weight="bold">
                  {heading}
                </Text>
                <div className="flex f-row gap-m">
                  {options.map(({ element, props }, j) =>
                    createElement(element, {
                      ...props,
                      key: `settingsoptions${i}${j}`,
                    }),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex f-col gap-m full-width">
            <Button>Confirm</Button>
            <Button
              color="crimson"
              onClick={() => send({ action: "RESET" })}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </div>
        {
          <div
            className="settings-overlay full-width full-height flex f-col gap-m f-center padding-4xl text-center"
            data-display={!!!active}
          >
            <Text size="4">Composer</Text>
            <Text size="2">Select a component with variants to begin.</Text>
          </div>
        }
      </div>
    </ComponentContext>
  );
};
