import { send } from "@client/lib/api";
import ComponentContext from "@components/ComponentContext/ComponentContext";
import { Button, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { comboboxConfig } from "./Configs/Combobox";
import { inputAmountConfig } from "./Configs/InputAmount";
import { ISettingsConfigObject } from "@ctypes/settings";
import SettingsOption from "@components/SettingsOption/SettingsOption";
import { GAP_COLUMN_DEFAULT, GAP_ROW_DEFAULT } from "@lib/constants";

// icons
import GapVerticalIcon from "@icons/gap-v.svg";
import GapHorizontalIcon from "@icons/gap-h.svg";
import SettingsOverlay from "./SettingsOverlay";

interface IParam {
  heading: string;
  inputs: Array<ISettingsConfigObject>;
}

export default () => {
  const [active, setActive] = useState<ComponentSetNode>();
  const [activeVariants, setActiveVariants] = useState<string[]>([]);
  const [parameters, setParameters] = useState<IParam[]>([]);

  useEffect(() => {
    setParameters([
      {
        heading: "Column",
        inputs: [
          comboboxConfig({
            label: "Property 1",
            paramIndex: 0,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
          comboboxConfig({
            label: "Property 2",
            paramIndex: 1,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
        ],
      },
      {
        heading: "Row",
        inputs: [
          comboboxConfig({
            label: "Property 1",
            paramIndex: 2,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
          comboboxConfig({
            label: "Property 2",
            paramIndex: 3,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
        ],
      },
      {
        heading: "Gap",
        inputs: [
          inputAmountConfig({
            direction: "VERTICAL",
            icon: <GapVerticalIcon />,
            defaultValue: GAP_COLUMN_DEFAULT,
            gapType: "COLUMN",
            min: -1000,
            max: 1000,
          }),
          inputAmountConfig({
            direction: "HORIZONTAL",
            icon: <GapHorizontalIcon />,
            defaultValue: GAP_ROW_DEFAULT,
            gapType: "ROW",
            min: -1000,
            max: 1000,
          }),
        ],
      },
    ]);

    //hide dropdown if not active
    document
      .querySelectorAll("*[data-radix-popper-content-wrapper]")
      .forEach(
        (dp) =>
          ((dp as HTMLElement).style.visibility = active
            ? "visible"
            : "hidden"),
      );
      
  }, [activeVariants, active]);

  useEffect(() => {
    setActiveVariants([]);
  }, [active]);

  return (
    <ComponentContext onChange={(e: any) => setActive(e)}>
      <div className="settings-organise padding-xl">
        <div className="settings-wrapper full-width padding-bottom-m full-height flex f-col gap-3xl f-center-h f-between">
          <div className="flex f-col gap-2xl full-width">
            {parameters.map(({ heading, inputs }, i) => (
              <div className="flex f-col gap-m" key={`param${i}`}>
                <Text size="1" weight="bold">
                  {heading}
                </Text>
                <div className="flex f-row gap-m">
                  {inputs.map((props, j) => (
                    <SettingsOption
                      key={`settingsoptions${i}${j}`}
                      {...props}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex f-col gap-m full-width">
            <Button
              color="crimson"
              onClick={() => send({ action: "RESET" })}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </div>
        <SettingsOverlay show={!!!active} />
      </div>
    </ComponentContext>
  );
};
