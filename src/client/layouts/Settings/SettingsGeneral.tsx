import { send } from "@client/lib/api";
import { CallbackMethod } from "@ctypes/api";
import { Text, Button } from "@radix-ui/themes";

const generalCommands: {
  label: string;
  callback: CallbackMethod;
  description: string;
}[] = [
  {
    label: "Add dark background",
    callback: { type: "API", action: "ADD_DARK_BACKGROUND" },
    description: "Add dark background behind current selection",
  },
];

export default () => (
  <div className="settings-shortcuts settings-tab padding-xl flex f-col gap-xl">
    <Text size="1" weight="bold">
      Other Actions
    </Text>
    <div className="settings-shortcuts-content">
      {generalCommands.map(({ label, callback, description }) => (
        <div key={`${label} ${description}`} className="flex f-col gap-m">
          <Button
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
          <Text size="1">{description}</Text>
        </div>
      ))}
    </div>
  </div>
);
