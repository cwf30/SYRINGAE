import React, { useState, useEffect, useTransition } from "react";
import { Popup, Button } from "semantic-ui-react";

export function LINBrowser({
  LINpredictions,
  selectedQuery,
  selectedLIN,
  setSelectedLIN,
  setBuildDataRings,
}) {
  let LINbuttons = [
    <Button key={"prediction"} className="LINbrowserlabel">
      view strains with predicted ANI ≥
    </Button>,
  ];

  function handleLINselection(p) {
    setSelectedLIN(p);
  }

  useEffect(() => {
    let highest = "";
    for (const lin in LINpredictions[selectedQuery]["levels"]) {
      const amp = LINpredictions[selectedQuery]["levels"];
      if (amp[lin] != "null") {
        highest = lin;
      }
    }
    setSelectedLIN(highest);
    setBuildDataRings(true);
  }, [selectedQuery, LINpredictions]);

  for (const p in LINpredictions[selectedQuery]["levels"]) {
    const amplicon = LINpredictions[selectedQuery]["levels"];
    //setSelectedLIN(98);
    LINbuttons.push(
      <Button
        key={p}
        disabled={amplicon[p] == "null" ? true : false}
        className={selectedLIN == p ? "LINselected" : "explore"}
        onClick={() => handleLINselection(p)}
      >
        {p}%
      </Button>
    );
  }
  return <Button.Group fluid compact size="medium">{LINbuttons}</Button.Group>;
}
