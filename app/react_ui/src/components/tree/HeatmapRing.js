import * as d3 from "d3";
import { Popup } from "semantic-ui-react";
import { parseTooltip, fillNode } from "./treeUtils";
export const HeatmapRing = ({
  ring,
  dataMap,
  arcOffset,
  leafNodes,
  selected,
  setSelected,
}) => {
  function fill(node) {
    return node.target.data.name && node.target.data.name === selected
      ? ring.highlightColor
        ? ring.highlightColor
        : "#e0e0e0"
      : dataMap && Object.keys(dataMap).length > 0
      ? ring.gradient
        ? d3
            .scaleLinear()
            .domain(ring.gradient.domain)
            .range(ring.gradient.range)(
            dataMap[node.target.data.name][ring.feature]
          )
        : ring.color
        ? ring.color
        : "#e0e0e0"
      : "#e0e0e0";
  }
  return (
    <g>
      {leafNodes.map((node) => (
        <Popup
          on="hover"
          onOpen={() => setSelected(node.target.data.name)}
          header={
            dataMap[node.target.data.name] && ring.tooltip
              ? parseTooltip(ring.tooltip.header, node, dataMap)
              : "no data"
          }
          content={
            dataMap[node.target.data.name] && ring.tooltip
              ? parseTooltip(ring.tooltip.content, node, dataMap)
              : "no data"
          }
          basic
          trigger={
            <path
              key={node.target.data.name + leafNodes.indexOf(node)}
              d={d3
                .arc()
                .innerRadius(ring.radius)
                .outerRadius(ring.radius + ring.height)
                .startAngle((node.target.x * Math.PI) / 180 - arcOffset)
                .endAngle((node.target.x * Math.PI) / 180 + arcOffset)()}
              stroke={"none"}
              fill={fillNode(node, dataMap, ring, selected)}
              onClick={() => {
                return ring.onClick
                  ? ring.onClick(dataMap[node.target.data.name])
                  : null;
              }}
            />
          }
        ></Popup>
      ))}
    </g>
  );
};
