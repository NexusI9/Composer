import { Text } from "@radix-ui/themes";

export default ({ show }: { show: boolean }) => (
  <div
    className="settings-overlay full-width full-height flex f-col gap-m f-center padding-4xl text-center"
    data-display={show}
  >
    <Text size="2">Select a component with variants to begin.</Text>
  </div>
);
