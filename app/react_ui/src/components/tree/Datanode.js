import * as d3 from "d3";
import React, { useState, useEffect } from "react";
import { Popup } from "semantic-ui-react";
import {
  parseTooltip,
  fillNumerical,
  fillCategorical,
  getNodeHeight,
} from "./treeUtils";
export const Datanode = React.memo(function Datanode({
  node,
  ring,
  dataMap,
  arcOffset,
  leafNodes,
  setSelected,
  colorGuide,
}) {
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (dataMap && dataMap[node.target.data.name]) {
      let prop = {};
      prop.path = d3
        .arc()
        .innerRadius(ring.radius)
        .outerRadius(
          ring.radius + getNodeHeight(dataMap, ring, node.target.data.name)
        )
        .startAngle((node.target.x * Math.PI) / 180 - arcOffset)
        .endAngle((node.target.x * Math.PI) / 180 + arcOffset)();
      prop.toolContent =
        dataMap[node.target.data.name] && ring.tooltip
          ? parseTooltip(ring.tooltip.content, node, dataMap)
          : "no data";
      prop.toolHeader =
        dataMap[node.target.data.name] && ring.tooltip
          ? parseTooltip(ring.tooltip.header, node, dataMap)
          : "no data";
      prop.fill = colorGuide[dataMap[node.target.data.name][ring.feature]];
      setProperties({...prop});
    }
  }, [node, ring, arcOffset, dataMap, colorGuide]);


  return (
    <Popup
      on="hover"
      hoverable
      onOpen={() =>
        setSelected({
          name: node.target.data.name,
          angle: ((node.target.x - 90) / 180) * Math.PI,
        })
      }
      header={properties.toolHeader}
      content={properties.toolContent}
      basic
      trigger={
        <path
          key={node.target.data.name + leafNodes.indexOf(node) + ring.radius}
          d={properties.path}
          stroke={"none"}
          fill={properties.fill}
          onClick={() => {
            return ring.onClick
              ? ring.onClick(dataMap[node.target.data.name])
              : null;
          }}
        />
      }
    ></Popup>
  );
});
