import { ITreeConfig } from "@server/lib/VariantOrganiser";
import { IMatrix } from "./Matrix";
import { ComponentCache } from "@server/lib/ComponentCache";

interface ITraverse extends ITreeConfig {
    source: IMatrix;
    depth: number;
    level?: number;
    cursor?: number;
}

export function traverse({ source, config, tree, depth, level = 0, cursor = 0 }: ITraverse) {
    /**
     * Convert the tree structure into a flatten array in which each level is orderer by ROWS, meaning that the rows actually 
     * holds the data. Such approach will simplify the HTML table creation since the rows contain columns <tr><td>{data}</td></tr>
     */

    while (!config[cursor] && cursor <= config.length) cursor++;
    const rowCol = cursor <= 1 ? "col" : "row";
    const layout = (config[0] || config[1]) && (!config[2] || !config[3]) ? "COLUMN_LAYOUT"
        : (!config[0] || !config[1]) && (config[2] || config[3]) ? "ROW_LAYOUT"
            : "CROSS_LAYOUT";

    let pass = 0;
    for (const key in tree) {
        let innerCursor = cursor;
        let innerLevel = level;
        const lastLevel = !(innerLevel < depth - 1);

        console.log(rowCol, key, level);
        //Set table heading value
        if (rowCol == "col") {
            //Simply appends the column names in the table, rows will hold the actual value (i.e. components)

            //Add blank first case if has row
            if (!source.header[level] && layout != "COLUMN_LAYOUT") source.header[level] = [{
                value: "",
                span: lastLevel ? 1 : Object.keys(tree[key as keyof typeof tree]).length,
            }];

            source.header[level] = [...(source.header[level] || []), {
                value: key,
                span: lastLevel ? 1 : Object.keys(tree[key as keyof typeof tree]).length,
            }];

        } else {
            //Prepend row body value
            /*source.body[level] = [...(source.body[level] || []), {
                value: key,
                span: lastLevel ? 1 : Object.keys(tree[key as keyof typeof tree]).length,
                type: "ROW"
            }];*/

        }

        if (lastLevel) {

            const comps = tree[key as keyof typeof tree] as ComponentCache[];
            switch (layout) {

                case "COLUMN_LAYOUT":
                    comps.forEach((item) => {
                        source.body[source.body.length] = [{
                            value: item.name,
                            span: lastLevel ? 1 : Object.keys(tree[key as keyof typeof tree]).length,
                        }];
                    });
                    break;


                case "ROW_LAYOUT":
                case "CROSS_LAYOUT":
                default:

                    break;

            }

            //console.log(tree[key as keyof typeof tree]);
        }
        console.log({ innerLevel, depth, cursor, pass }, rowCol, key);

        if (depth > 1 && !lastLevel) {
            //Dig deeper and add a row
            innerLevel++;
            innerCursor++;
            traverse({
                source,
                config,
                tree: tree[key as keyof typeof tree],
                depth,
                level: innerLevel,
                cursor: innerCursor
            });
        }

        pass++;

    }

}