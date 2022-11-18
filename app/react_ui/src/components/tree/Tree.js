import React, { useState, useEffect } from "react";
import "./tree.css";
import * as d3 from "d3";
import {
  makeCluster,
  maxLength,
  setRadius,
  linkVariable,
  linkConstant,
  linkExtensionVariable,
  linkExtensionConstant,
  parseNewick,
  getSubTree,
  correctNJtree,
} from "./treeUtils";
import { Datarings } from "./Datarings";

export const Tree = React.memo(
  ({
    newick,
    keyNodes,
    width,
    mappingData,
    dataRings,
    strokeColor,
    strokeWidth,
    highlightColor,
    highlightWidth,
    scaled,
    onLegend,
  }) => {
    const [links, setLinks] = useState([]);
    const [leafNodes, setLeafNodes] = useState([]);
    const [parsed, setParsed] = useState([]);
    const [innerRadius, setinnerRadius] = useState(1000 / 2);
    const [colorGuides, setColorGuides] = useState({});
    const [needGuides, setNeedGuides] = useState(false);

    useEffect(() => {
      setParsed(parseNewick(newick));
    }, [newick]);

    useEffect(() => {
      let tmpcolorGuides = { ...colorGuides };
      const newGuides = Object.keys(colorGuides);
      const DataFeatures = dataRings.map((ring) => ring.feature);
      for (const guide in newGuides) {
        if (!DataFeatures.includes(newGuides[guide])) {
          delete tmpcolorGuides[newGuides[guide]];
        }
      }
      setColorGuides(tmpcolorGuides);
    }, [dataRings]);

    useEffect(() => {
      if (onLegend) {
        const newGuides = Object.keys(colorGuides);
        const DataFeatures = dataRings.map((ring) => ring.feature);
        if (
          newGuides.filter((arr1Item) => !DataFeatures.includes(arr1Item))
            .length == 0 ||
          DataFeatures.filter((arr1Item) => !newGuides.includes(arr1Item))
            .length == 0
        ) {
          onLegend({ ...colorGuides });
        }
      }
    }, [colorGuides]);

    useEffect(() => {
      var root = d3
        .hierarchy(parsed, (d) => d.branchset)
        .sum((d) => (d.branchset ? 0 : 1))
        .sort(
          (a, b) =>
            a.value - b.value || d3.ascending(a.data.length, b.data.length)
        );
      var cluster = makeCluster(innerRadius);
      cluster(root);
      if (keyNodes.length > 0 && root.links().length > 0) {
        root = getSubTree(root, keyNodes);
        cluster(root);
      }
      correctNJtree(root);
      setRadius(root, (root.data.length = 0), innerRadius / maxLength(root));
      let tmpLinks = root.links();
      setLinks(tmpLinks);
      setLeafNodes(tmpLinks.filter((node) => !node.target.children));
    }, [keyNodes, innerRadius, parsed]);
    let tY = 0;
    dataRings.forEach((ring) => {
      const height =
        ring.type == "bar"
          ? ring.height.range
            ? ring.height.range[1]
            : 15
          : ring.height;
      tY += height + 5;
    });
    const ViewBoxDim = 5500 - ( width * 4300);
    const ViewBox =
      "0 0 " + ViewBoxDim.toString() + " " + ViewBoxDim.toString();
    const transformY = innerRadius + tY;
    const transformX = ViewBoxDim / 2;
    const transform =
      `translate(` + transformX.toString() + "," + transformY.toString() + ")";

    return (
      <div id="wrapper" style={{}}>
        <svg viewBox={ViewBox} style= {{maxHeight:"100vh"}}>
          <g transform={transform}>
            {links.map((node) => (
              <g key={links.indexOf(node)}>
                <path
                  d={scaled ? linkVariable(node) : linkConstant(node)}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                <path
                  d={
                    node.target.children
                      ? ""
                      : scaled
                      ? linkExtensionVariable(node, innerRadius)
                      : linkExtensionConstant(node, innerRadius)
                  }
                  fill="none"
                  stroke={strokeColor}
                  strokeOpacity="0.25"
                  strokeWidth={strokeWidth}
                />
              </g>
            ))}
            <Datarings
              dataRings={dataRings}
              mappingData={mappingData}
              leafNodes={leafNodes}
              startingRadius={innerRadius}
              endingRadius={750}
              highlightColor={highlightColor}
              highlightWidth={highlightWidth}
              colorGuides={colorGuides}
              setColorGuides={setColorGuides}
              needGuides={needGuides}
              setNeedGuides={setNeedGuides}
            />
          </g>
        </svg>
      </div>
    );
  }
);

export default React.memo(Tree);
