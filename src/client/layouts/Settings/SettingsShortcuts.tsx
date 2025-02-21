import Chip from "@components/Chip/Chip";
import { Text } from "@radix-ui/themes";
import { Fragment } from "react/jsx-runtime";

interface IShortcut {
  keys: string[];
  description: string;
}

const shortcutsMap: IShortcut[] = [
  { keys: ["alt", "b"], description: "Add dark background behind selection" },
];

export default () => (
  <div className="settings-shortcuts padding-xl flex f-col gap-xl">
    <Text size="1" weight="bold">
      General Shortcuts
    </Text>
    <div className="settings-shortcuts-content">
      {shortcutsMap.map(({ keys, description }) => (
        <div
          key={`${keys.join("")} ${description}`}
          className="flex f-row gap-xl"
        >
          <div className="flex f-row gap-s f-center">
            {keys.map((key, i) => (
              <Fragment key={`${key} ${i} ${description}`}>
                <Chip>
                  <Text size="1" weight="bold">
                    {key}
                  </Text>
                </Chip>
                {i < keys.length - 1 && <Text size="1">+</Text>}
              </Fragment>
            ))}
          </div>
          <Text size="1">{description}</Text>
        </div>
      ))}
    </div>
  </div>
);
