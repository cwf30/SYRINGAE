import React, { useState, useEffect } from "react";
import Select from "react-select";

export function DropdownQueries({ LINpredictions, changeQuery }) {
  const styles = {
    textAlign: "left",
    singleValue: (base) => ({
      ...base,
      wordBreak: "break-word",
      whiteSpace: "normal",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: "fit-content",
    }),
    container: (base) => ({
      ...base,
      flex: 1,
    }),
  };

  const searchOptions = Object.keys(LINpredictions).map((k) => {
    return { label: k, value: k };
  });

  return (
    <span style={{ width: "700px" }}>
      <p>View characterization for:</p>
      <Select
        styles={styles}
        placeholder="Select amplicon"
        selection
        options={searchOptions}
        defaultValue={searchOptions[0]}
        onChange={(data) => {
          changeQuery(data);
        }}
        theme={(theme) => ({
          ...theme,
          borderRadius: 5,
          colors: {
            ...theme.colors,
            text: "orangered",
            primary25: "#ddecc1",
            primary: "#779F2D",
          },
        })}
      ></Select>
    </span>
  );
}
