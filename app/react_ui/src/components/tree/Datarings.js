import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import { Ring } from "./Ring";
import { Highlight } from "./Highlight";

export const Datarings = React.memo(function Datarings({
  dataRings,
  mappingData,
  leafNodes,
  startingRadius,
  endingRadius,
  highlightColor,
  highlightWidth,
  colorGuides,
  setColorGuides,
  needGuides,
  setNeedGuides,
}) {
  const [rings, setRings] = useState(dataRings);
  const [arcOffset, setArcOffset] = useState(
    ((360 / (leafNodes.length / 2)) * Math.PI) / 180
  );
  const [dataMap, setDataMap] = useState(false);
  const [selected, setSelected] = useState({ name: null, angle: null });
  const [highlightRadii, setHighlightRadii] = useState({
    start: null,
    end: null,
  });
  function handleColorGuideChange(e, i) {
    setColorGuides((guides) => {
      return Object.assign(
        {},
        { ...guides },
        { [Object.keys(e)[0]]: e[Object.keys(e)[0]] }
      );
    });
    
  }

  useEffect(() => {
    setArcOffset(((360 / leafNodes.length / 2) * Math.PI) / 180);
    function filterAndSetData(data) {
      if (data && data.length > 0) {
        const meta = data.filter((specimen) =>
          leafNodes.map((node) => node.target.data.name).includes(specimen.name)
        );
        var mapped = meta.reduce(function (acc, curr) {
          acc[curr.name] = curr;
          return acc;
        }, {});
        setDataMap(mapped);
      }
    }
    if (Array.isArray(mappingData)) {
      filterAndSetData(mappingData);
    } else {
      d3.csv(mappingData).then((data) => {
        filterAndSetData(data);
      });
    }
  }, [leafNodes, mappingData]);

  useEffect(() => {
    var currentRadius = startingRadius;
    dataRings.forEach((ring) => {
      ring.radius = currentRadius + ring.padding;
      currentRadius =
        currentRadius +
        ring.padding +
        (ring.type === "bar"
          ? ring.height.range
            ? ring.height.range[1]
            : 15
          : ring.height);
    });
    setRings(dataRings);
    setHighlightRadii({
      start: startingRadius,
      end: endingRadius,
    });
  }, [dataRings]);

  function handleHover(name) {
    setSelected(name);
  }
  return (
    <g>
      <Highlight
        angle={selected.angle}
        radii={highlightRadii}
        highlightColor={highlightColor}
        highlightWidth={highlightWidth}
      />
      {rings.map((ring, i) => {
        if (["bar", "heatmap", "categorical"].includes(ring.type)) {
          return (
            <g key={"ringGroup-" + ring.feature + i}>
              <Ring
                key={"ring-" + ring.feature + i}
                arcOffset={arcOffset}
                dataMap={dataMap}
                ring={ring}
                leafNodes={leafNodes}
                selected={selected}
                setSelected={handleHover}
                onColorGuideChange={(e) => {
                  handleColorGuideChange(e, i);
                }}
              />
            </g>
          );
        }
      })}
    </g>
  );
});
