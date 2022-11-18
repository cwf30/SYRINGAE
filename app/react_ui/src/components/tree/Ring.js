import * as d3 from "d3";
import React, { useState, useEffect } from "react";
import { Datanode } from "./Datanode";
import { categoricalColorGuide, continuousColorGuide } from "./treeUtils";

export const Ring = React.memo(function Ring({
  ring,
  dataMap,
  arcOffset,
  leafNodes,
  setSelected,
  onColorGuideChange
}) {
  const [colorGuide, setColorGuide] = useState(null);
  
  useEffect(() => {
    if (ring && ring.color && dataMap) {
      let tmpguide = {};
      if (ring.type === "categorical") {
        tmpguide[ring.feature] = categoricalColorGuide(ring, dataMap);
      } else if (ring.type === "heatmap" || ring.type === "bar") {
        tmpguide[ring.feature] = continuousColorGuide(ring, dataMap);
      }
      //console.log(tmpguide)
      if (tmpguide[ring.feature]) {
        setColorGuide(tmpguide);
      }
      if (onColorGuideChange) {
        onColorGuideChange(tmpguide);
      }
    }
  }, [ring, dataMap]);


  return (
    <>
      {colorGuide && Object.keys(colorGuide).length > 0 ? (
        <g>
          {leafNodes.map((node) => (
            <g key={node.target.data.name + ring.feature}>
              <Datanode
                key={node.target.data.name + ring.feature}
                node={node}
                ring={ring}
                dataMap={dataMap}
                colorGuide={colorGuide[ring.feature]}
                arcOffset={arcOffset}
                leafNodes={leafNodes}
                setSelected={setSelected}
              />
            </g>
          ))}
        </g>
      ) : (
        <></>
      )}
    </>
  );
});
