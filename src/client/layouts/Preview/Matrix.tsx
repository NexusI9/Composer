import { useState } from "react";
import { listen } from "@client/lib/api";
import { traverse } from "./Matrix.helper";
import { Text } from "@radix-ui/themes";

export interface IMatrixCell {
    value: string;
    span: number;
}

export interface IMatrix {
    header: IMatrixCell[][];
    body: IMatrixCell[][][];
}

export default () => {

    const [matrix, setMatrix] = useState<IMatrix>();

    listen((msg) => {

        switch (msg.action) {
            case "UPDATE_TABLE":

                /**
                 * 2. Segment the tree into row and columns for HTML firendly output
                 * According on configuration raw data [ s1, undefined, s2, undefined ] we can set which levels are rows and which levels are columns
                 * We know that index 0 and 1 and columns and 2 and 3 are rows
                 * 
                 * Buffer:
                 *      |      COL       |       ROW     |
                 *      [   1   ,   0    |   1   ,   1   ]
                 *          |               |       |
                 * Data:    |               |       |
                 *          |               |       L_____
                 *      [   s1  ]           |             |
                 *           L---------[   s2   ]         |
                 *                          L--------[   s3  ]
                 */

                //reset table
                //this.table = [];
                const { tree, config } = msg.payload;

                const mtx: IMatrix = {
                    header: [],
                    body: []
                };

                traverse({
                    source: mtx,
                    tree,
                    config,
                    depth: config.filter((n: any) => !!n).length
                });

                console.log(mtx);
                setMatrix(mtx);

                break;
        }

    });


    return (<table>
        <thead>
            {matrix?.header.map((tr, i) => <tr key={`tr${i}`}>{tr.map((th, j) => <th key={`th${(j + i) * i + th.value}`} colSpan={th.span}><Text size="1">{th.value}</Text></th>)}</tr>)}

        </thead>

    </table>);

}