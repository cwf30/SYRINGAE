import T3SS_IMG from ".././assets/T3SS_ICON.png";
import T3E_IMG from ".././assets/T3E_ICON.png";
import WHOP_IMG from ".././assets/WHOP_ICON.png";

import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import { DropdownQueries } from "./Dropdown";
import { getT3SS, getT3E, getWHOP } from "./VFOC";
import { UploadForm } from "./uploadForm";
import { LINBrowser } from "./LINbrowser";
import * as d3 from "d3";
import {
  Grid,
  Segment,
  Table,
  Tab,
  Accordion,
  Divider,
  Icon,
} from "semantic-ui-react";
import { Tree } from "./tree/Tree";

export function Identify({ metadata, treemeta, setMetadata, setTreeMeta }) {
  let T3SS = getT3SS();
  let T3E = getT3E();
  let WHOP = getWHOP();

  const [selectedQuery, setSelectedQuery] = useState("Upload");
  const [selectedLIN, setSelectedLIN] = useState(false);
  const [highestLIN, setHighestLIN] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [LINpredictions, setLINpredictions] = useState(false);
  const [treeData, setTreeData] = useState("");
  const [keyNodes, setkeyNodes] = useState([
    "GCF_000233795.1",
    "GCF_002966555.1",
  ]);
  const [keyIsolates, setkeyIsolates] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [phylogroupPie, setPhylogroupPie] = useState([]);
  const [speciesPie, setSpeciesPie] = useState([]);
  const [pathovarPie, setPathovarPie] = useState([]);
  const [T3SSBar, setT3SSBar] = useState([]);
  const [T3EBar, setT3EBar] = useState([]);
  const [WHOPBar, setWHOPBar] = useState([]);
  const [buildDataRings, setBuildDataRings] = useState(false);
  const [datarings, setdatarings] = useState([]);

  const [phylogroupColorArray, setphylogroupColorArray] = useState([
    "#A86A6A",
    "#B10C0C",
    "#FFE0B7",
    "#FFB67A",
    "#FF8C3D",
    "#FF6200",
    "#E5DE06",
    "#85D212",
    "#05A16A",
    "#0599A1",
    "#0548A1",
    "#5005A1",
    "#FFB8FB",
    "#A1059B",
    "#A10550",
    "#863C3C",
    "#f4f7f2",
  ]);

  const phylogroupColors = {
    "1a": "#A86A6A",
    "1b": "#B10C0C",
    "2a": "#FFE0B7",
    "2b": "#FFB67A",
    "2c": "#FF8C3D",
    "2d": "#FF6200",
    3: "#E5DE06",
    4: "#85D212",
    5: "#05A16A",
    6: "#0599A1",
    7: "#0548A1",
    9: "#5005A1",
    "10a": "#FFB8FB",
    "10b": "#A1059B",
    11: "#A10550",
    13: "#863C3C",
    unknown: "#f4f7f2",
  };

  useEffect(() => {
    async function loadData() {
      await fetch("/rooted_PSSC_tree.txt")
        .then((r) => r.text())
        .then((text) => {
          setTreeData(text);
        });
    }
    loadData();
  }, []);

  useEffect(() => {
    if (
      !selectedQuery |
      !metadata |
      !LINpredictions |
      !selectedLIN |
      !buildDataRings |
      !highestLIN
    ) {
      return;
    }
    let metaTMP = metadata;
    const isolates = metadata.keys();
    let keys = [];
    isolates.forEach((isolate) => {
      const LINgroup =
        LINpredictions[selectedQuery]["levels"][highestLIN.toString()];
      let currentLINlevel = 80;
      for (let i = 1; i <= LINgroup.length; i++) {
        let currentLIN = "ANI_" + String(currentLINlevel);
        //console.log(currentLIN)
        const subLIN = LINgroup.substring(0, i);
        if (i == 1) {
          metaTMP.get(isolate)["selected"] = 79;
        }
        if (metaTMP.get(isolate)[currentLIN] == subLIN) {
          metaTMP.get(isolate)["selected"]++;
        }
        if (
          (i == LINgroup.length - 1) &
          (metaTMP.get(isolate)[currentLIN] == LINgroup)
        ) {
          keys.push(metaTMP.get(isolate).name);
        }
        currentLINlevel++;
      }
    });
    const d = [
      {
        type: "categorical", // categorical, heatmap, or bar
        feature: "Phylogroup", // any valid column name in CSV file, or property of row object
        height: 15,
        padding: 5,
        color: {
          colorScheme: "Category10",
          range: phylogroupColorArray,
          domain: [
            "1a",
            "1b",
            "2a",
            "2b",
            "2c",
            "2d",
            "3",
            "4",
            "5",
            "6",
            "7",
            "9",
            "10a",
            "10b",
            "11",
            "13",
            "unknown",
          ],
          default: "lightGrey",
        },
        tooltip: {
          content: "assigned Phylogroup: ${Phylogroup}",
          header: "P. ${Species} pv. ${Pathovar}, ${Strain}",
          size: "",
        },
      },
      {
        type: "bar", // categorical, heatmap, or bar
        feature: "selected", // any valid column name in CSV file, or property of row object
        height: { range: [5, 35], domain: [80, highestLIN] },
        padding: 5,
        color: {
          range: ["#f4f7f2", "rgb(68, 48, 9)"],
          domain: [80, highestLIN],
          default: "lightGrey",
        },
        tooltip: {
          content: "predicted ANI: ${selected}%",
          header: "P. ${Species} pv. ${Pathovar}, ${Strain}",
          size: "",
        },
      },
    ];
    setdatarings(d);

    setMetadata(metaTMP);
    setBuildDataRings(false);
    console.log("metadata updated");
  }, [buildDataRings, selectedQuery, selectedLIN, LINpredictions, highestLIN]);

  useEffect(() => {}, [metadata]);

  useEffect(() => {
    if (!selectedQuery | !metadata | !LINpredictions | !selectedLIN) {
      return;
    }
    const isolates = metadata.keys();
    let keys = [];
    isolates.forEach((isolate) => {
      const LIN = "ANI_" + selectedLIN;
      if (
        metadata.get(isolate)[LIN] ==
        LINpredictions[selectedQuery]["levels"][selectedLIN]
      ) {
        keys.push(metadata.get(isolate).name);
      }
    });
    let highest = "";
    for (const lin in LINpredictions[selectedQuery]["levels"]) {
      const amp = LINpredictions[selectedQuery]["levels"];
      if (amp[lin] != "null") {
        highest = lin;
      }
    }
    setHighestLIN(parseInt(highest));
    console.log(keys);
    setkeyNodes(keys);
    setkeyIsolates([...keys]);
  }, [selectedLIN, selectedQuery]);

  function changeQuery(data) {
    setSelectedQuery(data.value);
  }

  function getPhylogroupColor(e) {
    return phylogroupColors[e.id];
  }

  function getSpeciesColor(e) {
    return "#A86A6A";
  }

  useEffect(() => {
    document.title = "Syringae - identify";
  }, []);

  useEffect(() => {
    let renderedTable = keyIsolates.map((i) => {
      return (
        <Table.Row key={metadata.get(i).name}>
          <Table.Cell>{metadata.get(i).name}</Table.Cell>
          <Table.Cell>{metadata.get(i)["Taxonomy check"]}</Table.Cell>
          <Table.Cell>{metadata.get(i).Phylogroup}</Table.Cell>
          <Table.Cell>{metadata.get(i).Species}</Table.Cell>
          <Table.Cell>{metadata.get(i).Pathovar}</Table.Cell>
          <Table.Cell>{metadata.get(i).Strain}</Table.Cell>
        </Table.Row>
      );
    });
    setTableData(renderedTable);
  }, [keyIsolates]);

  useEffect(() => {
    if (LINpredictions) {
      setShowResults(false);
    }
  }, [LINpredictions]);

  useEffect(() => {
    // set phylogenetic and functional plotting data when keyIsolates changes
    let PhylogroupData = {};
    let SpeciesData = {};
    let PathovarData = {};
    let T3SSData = {};
    let T3EData = {};
    let WHOPData = {};
    console.log(keyIsolates);
    keyIsolates.forEach((ID) => {
      let relative = metadata.get(ID);
      if (relative.Phylogroup in PhylogroupData) {
        PhylogroupData[relative.Phylogroup]++;
      } else {
        PhylogroupData[relative.Phylogroup] = 1;
      }
      if (relative.Species in SpeciesData) {
        SpeciesData[relative.Species]++;
      } else {
        SpeciesData[relative.Species] = 1;
      }
      if (relative.Pathovar in PathovarData) {
        PathovarData[relative.Pathovar]++;
      } else {
        PathovarData[relative.Pathovar] = 1;
      }
      T3SS.forEach((gene) => {
        if (!(gene in T3SSData)) {
          T3SSData[gene] = 0;
        }
        if (relative[gene] >= 1) {
          T3SSData[gene]++;
        }
      });
      T3E.forEach((gene) => {
        if (!(gene in T3EData)) {
          T3EData[gene] = 0;
        }
        if (relative[gene] >= 1) {
          T3EData[gene]++;
        }
      });
      WHOP.forEach((gene) => {
        if (!(gene in WHOPData)) {
          WHOPData[gene] = 0;
        }
        if (relative[gene] >= 1) {
          WHOPData[gene]++;
        }
      });
    });

    let PGPie = [];
    let SPPie = [];
    let PVPie = [];
    let T3SSplot = [];
    let T3Eplot = [];
    let WHOPplot = [];
    console.log(PhylogroupData);
    for (const key in PhylogroupData) {
      PGPie.push({
        id: key,
        label: key,
        value: PhylogroupData[key],
        color: "hsl(116, 70%, 50%)",
      });
    }
    for (const key in SpeciesData) {
      SPPie.push({
        id: key,
        label: key,
        value: SpeciesData[key],
      });
    }
    for (const key in PathovarData) {
      PVPie.push({
        id: key,
        label: key,
        value: PathovarData[key],
      });
    }

    for (const key in T3SSData) {
      T3SSplot.push({
        id: key,
        label: key,
        value: ((T3SSData[key] / keyIsolates.length) * 100).toFixed(2),
        color: "hsl(116, 70%, 50%)",
      });
    }
    for (const key in T3EData) {
      T3Eplot.push({
        id: key,
        label: key,
        value: ((T3EData[key] / keyIsolates.length) * 100).toFixed(2),
        color: "hsl(116, 70%, 50%)",
      });
    }
    for (const key in WHOPData) {
      WHOPplot.push({
        id: key,
        label: key,
        value: ((WHOPData[key] / keyIsolates.length) * 100).toFixed(2),
        color: "hsl(116, 70%, 50%)",
      });
    }
    setT3SSBar(T3SSplot);
    setT3EBar(T3Eplot.sort((a, b) => b.value - a.value));
    setWHOPBar(WHOPplot);
    setPathovarPie(PVPie);
    setPhylogroupPie(PGPie);
    console.log(PGPie);
    setSpeciesPie(SPPie);
    //-------- Functional genes
  }, [keyIsolates]);

  const panes = [
    {
      menuItem: "Taxonomic prediction",
      render: () => (
        <Tab.Pane attached={false}>
          {" "}
          <p className="maintitle">
            Identity of strains sharing at least <b>{selectedLIN}%</b> ANI with{" "}
            <b>{selectedQuery}</b>:
          </p>
          <Grid style={{ marginTop: "50px", marginBottom: "-150px" }}>
            <Grid.Column width={4}>
              <div style={{ marginLeft: "20%" }}>
                <p style={{ textAlign: "center", fontSize: "12pt" }}>
                  <b>Phylogroups</b>:
                </p>
                <div style={{ width: "100%", height: "25vh" }}>
                  <ResponsivePie
                    data={phylogroupPie}
                    colors={getPhylogroupColor}
                    arcLabelsTextColor="white"
                    margin={{ top: 20, right: 50, bottom: 40, left: 50 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={1}
                    activeOuterRadiusOffset={8}
                    borderWidth={0}
                    arcLinkLabelsSkipAngle={15}
                    arcLabelsSkipAngle={10}
                  />
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12pt",
                    marginTop: "1vh",
                  }}
                >
                  <b>Species</b>:
                </p>
                <div style={{ width: "100%", height: "25vh" }}>
                  <ResponsivePie
                    data={speciesPie}
                    colors={{ scheme: "spectral" }}
                    arcLabelsTextColor="white"
                    margin={{ top: 20, right: 50, bottom: 30, left: 50 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={1}
                    activeOuterRadiusOffset={8}
                    borderWidth={0}
                    arcLinkLabelsSkipAngle={15}
                    arcLabelsSkipAngle={10}
                  />
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "12pt",
                    marginTop: "1vh",
                  }}
                >
                  <b>Pathovars</b>:
                </p>
                <div style={{ width: "100%", height: "25vh" }}>
                  <ResponsivePie
                    data={pathovarPie}
                    colors={{ scheme: "spectral" }}
                    arcLabelsTextColor="white"
                    margin={{ top: 20, right: 50, bottom: 30, left: 50 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={1}
                    activeOuterRadiusOffset={8}
                    borderWidth={0}
                    arcLinkLabelsSkipAngle={15}
                    arcLabelsSkipAngle={10}
                  />
                </div>
              </div>
            </Grid.Column>
            <Grid.Column width={12}>
              <div style={{ marginLeft: "10%", marginBottom: "6%" }}>
                <Tree
                  newick={treeData}
                  keyNodes={keyNodes}
                  scaled={false}
                  strokeColor="#000"
                  strokeWidth={0.65}
                  width={1}
                  mappingData={treemeta} // can be CSV or structured data: [{name:"",tail:1,dist:0.1},{},...]. MUST CONTAIN "name" COLUMN/OBJECT PROPERTY
                  highlightColor="#000"
                  highlightWidth={1.25}
                  dataRings={datarings}
                />
              </div>
            </Grid.Column>
          </Grid>
          <Divider
            style={{
              marginTop: "60px",
            }}
          />
          <div
            style={{
              width: "auto",
              margin: "30px",
              textAlign: "center",
              fontFamily: "Merriweather",
            }}
          >
            {keyIsolates.length} strains are likely to be related to{" "}
            {selectedQuery} with an average nucleotide identity of at least{" "}
            {selectedLIN}%. <br />
            <b>
              Confidence for prediction ={" "}
              {parseFloat(LINpredictions[selectedQuery]["confidence"]).toFixed(
                3
              )}
            </b>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "50vh" }}>
            <Table celled selectable color="olive" className="text">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>RefSeq Accession</Table.HeaderCell>
                  <Table.HeaderCell>Taxonomic status</Table.HeaderCell>
                  <Table.HeaderCell>Phylogroup</Table.HeaderCell>
                  <Table.HeaderCell>Species</Table.HeaderCell>
                  <Table.HeaderCell>Pathovar</Table.HeaderCell>
                  <Table.HeaderCell>Strain</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>{tableData}</Table.Body>
            </Table>
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Virulence factor prediction",
      render: () => (
        <Tab.Pane attached={false}>
          <Grid>{treemeta && <Grid.Column width={6}></Grid.Column>}</Grid>
          <p className="maintitle">
            Virulence factors carried by strains sharing at least{" "}
            <b>{selectedLIN}%</b> ANI with <b>{selectedQuery}</b>:
          </p>
          <Grid
            verticalAlign="middle"
            style={{
              marginTop: "4rem",
            }}
          >
            <Grid.Column width={3} textAlign="center" marginLeft="100px">
              <img src={T3SS_IMG} alt="Logo" height="120px" margin="auto" />
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12pt",
                  marginTop: "1vh",
                }}
              >
                <b>Canonical type 3 Secretion system</b>
              </p>
            </Grid.Column>
            <Grid.Column width={12}>
              <div
                style={{
                  height: "220px",
                  margin: "auto",
                  marginTop: "-20px",
                  marginBottom: "30px",
                  textAlign: "Center",
                }}
              >
                <p>Percentage of strains carrying canonical T3SS genes:</p>
                <ResponsiveBar
                  data={T3SSBar}
                  keys={["value"]}
                  indexBy="id"
                  margin={{ left: 50, right: -20, top: 10, bottom: 40 }}
                  axisLeft={{ format: (v) => `${v}%` }}
                  padding={0.1}
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  axisBottom={{ tickRotation: -90 }}
                  colors={(e) => {
                    return e.value > 90
                      ? "#779f2d"
                      : e.value > 50
                      ? "#f8bd64"
                      : "#A52F14";
                  }}
                  layers={[
                    "grid",
                    "axes",
                    "bars",
                    "markers",
                    "legends",
                    "annotations",
                  ]}
                  enableLabel={false}
                  enableGridY={true}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  tooltip={(input) => {
                    return (
                      <div className="VFOCtooltip">
                        {input.value}% of strains carry {input.data.id}
                      </div>
                    );
                  }}
                />
              </div>
            </Grid.Column>
          </Grid>
          <Divider />
          <Grid verticalAlign="middle">
            <Grid.Column width={3} textAlign="center" marginLeft="100px">
              <img src={T3E_IMG} alt="Logo" height="120px" margin="auto" />
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12pt",
                  marginTop: "1vh",
                }}
              >
                <b>Type 3 effector proteins</b>
              </p>
            </Grid.Column>
            <Grid.Column width={12}>
              <div
                style={{
                  height: "220px",
                  margin: "auto",
                  marginTop: "30px",
                  marginBottom: "30px",
                  textAlign: "Center",
                }}
              >
                <p>
                  Percentage of strains carrying each type 3 effector protein:
                </p>
                <ResponsiveBar
                  data={T3EBar}
                  keys={["value"]}
                  indexBy="id"
                  margin={{ left: 50, right: -20, top: 10, bottom: 60 }}
                  axisLeft={{ format: (v) => `${v}%` }}
                  padding={0.1}
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={(e) => {
                    return e.value > 90
                      ? "#779f2d"
                      : e.value > 50
                      ? "#f8bd64"
                      : "#A52F14";
                  }}
                  layers={[
                    "grid",
                    "axes",
                    "bars",
                    "markers",
                    "legends",
                    "annotations",
                  ]}
                  axisBottom={{ tickRotation: -90 }}
                  enableLabel={false}
                  enableGridY={true}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  tooltip={(input) => {
                    return (
                      <div className="VFOCtooltip">
                        {input.value}% of strains carry {input.data.id}
                      </div>
                    );
                  }}
                />
              </div>
            </Grid.Column>
          </Grid>
          <Divider />
          <Grid verticalAlign="middle">
            <Grid.Column width={3} textAlign="center" marginLeft="100px">
              <img src={WHOP_IMG} alt="Logo" height="120px" margin="auto" />
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12pt",
                  marginTop: "1vh",
                }}
              >
                <b>WHOP genes</b> <br />
              </p>
            </Grid.Column>
            <Grid.Column width={12}>
              <div
                style={{
                  height: "220px",
                  margin: "auto",
                  marginTop: "30px",
                  marginBottom: "30px",
                  textAlign: "Center",
                }}
              >
                <p>
                  Percentage of strains carrying 'Woody host or{" "}
                  <i>Pseudomonas</i>' genes:
                </p>
                <ResponsiveBar
                  data={WHOPBar}
                  keys={["value"]}
                  indexBy="id"
                  margin={{ left: 50, right: -20, top: 10, bottom: 40 }}
                  axisLeft={{ format: (v) => `${v}%` }}
                  padding={0.1}
                  valueScale={{ type: "linear" }}
                  indexScale={{ type: "band", round: true }}
                  colors={(e) => {
                    return e.value > 90
                      ? "#779f2d"
                      : e.value > 50
                      ? "#f8bd64"
                      : "#A52F14";
                  }}
                  layers={[
                    "grid",
                    "axes",
                    "bars",
                    "markers",
                    "legends",
                    "annotations",
                  ]}
                  enableLabel={false}
                  enableGridY={true}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 1.6]],
                  }}
                  tooltip={(input) => {
                    return (
                      <div className="VFOCtooltip">
                        {input.value}% of strains carry {input.data.id}
                      </div>
                    );
                  }}
                />
              </div>
            </Grid.Column>
          </Grid>{" "}
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <Segment
        basic
        style={{
          width: "auto",
          marginTop: "30px",
        }}
      >
        <Segment color="olive">
          <UploadForm
            setLINpredictions={setLINpredictions}
            setSelectedQuery={setSelectedQuery}
          ></UploadForm>
          {LINpredictions ? (
            <>
              <Divider />
              <DropdownQueries
                changeQuery={changeQuery}
                LINpredictions={LINpredictions}
              ></DropdownQueries>
            </>
          ) : (
            <p></p>
          )}
        </Segment>
        {LINpredictions ? (
          <>
            <div style={{overflowX: "scroll"}}>
              <LINBrowser
                LINpredictions={LINpredictions}
                selectedQuery={selectedQuery}
                selectedLIN={selectedLIN}
                setSelectedLIN={setSelectedLIN}
                setBuildDataRings={setBuildDataRings}
              />
            </div>
            <Tab
              menu={{ secondary: true, pointing: true }}
              panes={panes}
              style={{ marginTop: "2%" }}
            />
          </>
        ) : (
          <></>
        )}
      </Segment>
    </>
  );
}
