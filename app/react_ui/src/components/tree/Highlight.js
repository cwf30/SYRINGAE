import React from "react";
import * as d3 from "d3";
export const Highlight = ({ angle, radii, highlightColor, highlightWidth }) => {
  const c0 = Math.cos(angle);
  const s0 = Math.sin(angle);
  return angle === null ? (
    <g></g>
  ) : (
    <path
      d={"M" +
      radii.start * c0 +
      "," +
      radii.start * s0 +
      "L" +
      radii.end * c0 + 
      "," +
      radii.end * s0 }
      stroke={highlightColor}
      strokeWidth={highlightWidth}
    ></path>
  );
};
