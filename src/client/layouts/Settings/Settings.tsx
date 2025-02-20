// imports
import "./Settings.scss";
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
  }, [activeVariants, active]);

  useEffect(() => {
    setActiveVariants([]);
  }, [active]);

  return (
    <ComponentContext onChange={(e: any) => setActive(e)}>
      <div className="settings padding-xl flex full-width">
        <div className="settings-wrapper full-height flex f-col gap-2xl f-center-h f-between">
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
