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

import { Theme, Button } from '@radix-ui/themes';
import Settings from "@layouts/Settings/Settings";
import Preview from "@layouts/Preview/Preview";
import { send } from "./lib/api";
import { useState } from "react";
import { getActivePageAmount } from "./lib/utilities";
import TreeReloader from "@components/TreeReloader/TreeReloader";


export default () => {

    const [pageAmount, setPageAmout] = useState(0);

    return (<Theme
        appearance="dark"
        accentColor="blue"
        style={{ background: "#1E1E1E" }}
    >
        <div className="flex f-col gap-l padding-l full-height">
            <Settings />
            <Preview />
            <TreeReloader onReload={(tree) => setPageAmout(getActivePageAmount(tree))}>
                <Button {...(!!!pageAmount && { disabled: true })} onClick={() => send({ action: "EXPORT_TREE" })}>Export Sitemap</Button>
            </TreeReloader>
        </div>

    </Theme>);
}