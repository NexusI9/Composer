import { get, listen, send } from "@client/lib/api";
import { CallbackMethod } from "@ctypes/api";
import { Text, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface IGeneralCommands {
  label: string;
  callback: CallbackMethod;
  description: string;
  disabled?: boolean;
}

export default () => {
  const [currentSelection, setCurrentSelection] = useState<SceneNode[]>([]);
  const [commands, setCommands] = useState<{ [key: string]: IGeneralCommands }>(
    {
      "dark-background": {
        label: "Add dark background",
        callback: { type: "API", action: "ADD_DARK_BACKGROUND" },
        description: "Add a dark background behind the current selection",
        disabled: !!!currentSelection.length,
      },
    },
  );

  useEffect(() => {
    get({ action: "GET_SELECTION" }).then(({ payload }) =>
      setCurrentSelection(payload),
    );
  }, []);

  useEffect(() => {
    //use an object so instead of regenrating the whole array,
    //we simply update the related key in each use effects
    setCommands({
      ...commands,
      "dark-background": {
        ...commands["dark-background"],
        disabled: !!!currentSelection.length,
      },
    });
  }, [currentSelection.length]);

  listen((msg) => {
    switch (msg.action) {
      case "UPDATE_SELECTION":
        setCurrentSelection(msg.payload);
        break;
    }
  });

  return (
    <div className="settings-shortcuts settings-tab padding-xl flex f-col gap-xl">
      <Text size="1" weight="bold">
        Other Actions
      </Text>
      <div className="settings-shortcuts-content">
        {Object.keys(commands).map((key) => {
          const { label, callback, description, disabled } = commands[key];
          return (
            <div key={`${label} ${description}`} className="flex f-col gap-m">
              <Button
                {...(disabled && { "data-disabled": "" })}
                onClick={() => {
                  switch (callback.type) {
                    case "API":
                      send({ action: callback.action });
                      break;

                    case "FUNCTION":
                      callback.action();
                      break;
                  }
                }}
              >
                {label}
              </Button>
              {description && <Text size="1">{description}</Text>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
