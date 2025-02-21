// imports
import "./Settings.scss";
import SettingsOrganise from "./SettingsOrganise";
import SettingsShortcuts from "./SettingsShortcuts";

export default () => {
  return (
    <div className="settings flex f-col full-width">
      <SettingsOrganise />
      <SettingsShortcuts />
    </div>
  );
};
