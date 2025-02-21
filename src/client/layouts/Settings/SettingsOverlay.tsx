import { Text } from "@radix-ui/themes";

export default ({ show }: { show: boolean }) => (
  <div
    className="settings-overlay full-width full-height flex f-col f-center padding-2xl text-center"
    data-display={show}
  >
    <div className="settings-overlay-dialog padding-xl">
      <Text size="1">Select a Component Set with variants to begin.</Text>
    </div>
  </div>
);
