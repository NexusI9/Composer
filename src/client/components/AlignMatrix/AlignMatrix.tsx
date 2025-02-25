import "./AlignMatrix.scss";
import { SegmentedControl } from "@radix-ui/themes";

import JustifyLeftIcon from "@icons/justify-left.svg";
import JustifyRightIcon from "@icons/justify-right.svg";
import JustifyCenterIcon from "@icons/justify-center.svg";

import AlignMatrixPatternIcon from "@icons/align-matrix-pattern.svg";
import { useEffect, useState, createElement } from "react";
import { send } from "@client/lib/api";

const justifyDimensions = {
  x: ["LEFT", "CENTER", "RIGHT"],
  y: ["TOP", "CENTER", "BOTTOM"],
  icons: [JustifyLeftIcon, JustifyCenterIcon, JustifyRightIcon],
};

export default () => {
  const [cursor, setCursor] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {}, [cursor]);

  return (
    <div className="align-matrix">
      <AlignMatrixPatternIcon />
      {justifyDimensions.y.map((y, i) =>
        justifyDimensions.x.map((x, j) => (
          <div
            key={`${x} ${y}`}
            className="align-matrix-cell flex f-center"
            onClick={() => {
              setCursor({ x: j, y: i });
              send({
                action: "UPDATE_VARIANTS_CONFIGURATION",
                payload: {
                  justify: {
                    x: justifyDimensions.x[j],
                    y: justifyDimensions.y[i],
                  },
                },
              });
            }}
            data-active={cursor.x == j && cursor.y == i}
          >
            {createElement(justifyDimensions.icons[j])}
          </div>
        )),
      )}
    </div>
  );
};
