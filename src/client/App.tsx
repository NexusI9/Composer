//styles
import "@styles/index.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/reset.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/variable.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/color.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/flex.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/cursor.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/events.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/size.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/border.scss";
import "/Users/elkhantour/Documents/Websites/Modules/sass-core/modules/padding-margin.scss";

import { Theme } from '@radix-ui/themes';
import Settings from "@layouts/Settings/Settings";
import Preview from "@layouts/Preview/Preview";
import { Resizer } from "@components/Resizer";

export default () => {
    return (<Theme
        appearance="dark"
        accentColor="blue"
        radius="small"
        style={{ background: "#1E1E1E" }}
    >
        <Settings />
        <Resizer />
    </Theme>);
}
