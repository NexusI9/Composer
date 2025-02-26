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
import { alignMatrixConfig } from "./Configs/AlignMatrix";

interface IParam {
  heading?: string;
  inputs: Array<ISettingsConfigObject>;
}

const gapInputsMap = [
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
];

export default () => {
  const [active, setActive] = useState<ComponentSetNode>();
  const [activeID, setActiveID] = useState<string>();

  const [activeVariants, setActiveVariants] = useState<string[]>([]);
  const [parameters, setParameters] = useState<IParam[]>([]);

  const [resetTrigger, setResetTrigger] = useState<number>(0);

  useEffect(() => {
    setParameters([
      {
        heading: "Column",
        inputs: [
          comboboxConfig({
            value: "column1",
            paramIndex: 0,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
          comboboxConfig({
            value: "column2",
            paramIndex: 1,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            disabled: !!!activeVariants[0],
            direction: "VERTICAL",
          }),
        ],
      },
      {
        heading: "Row",
        inputs: [
          comboboxConfig({
            value: "row1",
            paramIndex: 2,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            direction: "VERTICAL",
          }),
          comboboxConfig({
            value: "row2",
            paramIndex: 3,
            active,
            state: {
              activeVariants,
              setActiveVariants,
            },
            disabled: !!!activeVariants[2],
            direction: "VERTICAL",
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

    if (active) setActiveID(active.id);
  }, [activeVariants, active]);

  useEffect(() => {
    setActiveVariants([]);
  }, [active]);

  return (
    <ComponentContext onChange={(e: any) => setActive(e)}>
      <div className="settings-organise settings-tab padding-xl">
        <div className="settings-wrapper full-width full-height padding-bottom-m flex f-col gap-3xl f-center-h f-between">
          <div className="flex f-col gap-2xl full-width">
            {parameters.map(({ heading, inputs }, i) => (
              <div className="flex f-col gap-m" key={`param${i}`}>
                {heading && (
                  <Text size="1" weight="bold">
                    {heading}
                  </Text>
                )}
                <div className="settings-input-wrapper">
                  {inputs.map((props, j) => (
                    <SettingsOption
                      key={`settingsoptions${i}${j}${activeID}`}
                      {...props}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex f-col gap-m">
              <Text size="1" weight="bold">
                Alignment
              </Text>
              <div
                className="settings-alignment"
                key={`alignmatrix${resetTrigger}`}
                {...(!!!activeVariants.filter((n) => !!n).length && {
                  "data-disabled": "",
                })}
              >
                <div className="settings-gap flex f-col gap-m f-center-v">
                  {gapInputsMap.map((gapInput, i) => (
                    <SettingsOption key={`gapoptions${i}`} {...gapInput} />
                  ))}
                </div>
                {<SettingsOption {...alignMatrixConfig()} />}
              </div>
            </div>
          </div>

          <div className="flex f-col gap-m full-width">
            <Button
              color="crimson"
              onClick={() => {
                send({ action: "RESET" });
                setParameters([]);
                setActiveVariants([]);
                setResetTrigger(performance.now());
              }}
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
