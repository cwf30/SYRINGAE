import T3SS_IMG from ".././assets/T3SS_IMG.png";
import T3E_IMG from ".././assets/T3E_IMG.png";
import WHOP_IMG from ".././assets/WHOP_IMG.png";

import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { DropdownQueries } from "./Dropdown";
import { UploadForm } from "./uploadForm";
import * as d3 from "d3";
import {
  Grid,
  Segment,
  Input,
  Container,
  Form,
  Button,
  GridColumn,
  Accordion,
  Divider,
  Icon,
  Popup,
} from "semantic-ui-react";
import { Tree } from "./tree/Tree";

export function Identify({
  selectedQuery,
  topHit,
  metadata,
  treemeta,
  queryResults,
  changeQuery,
}) {
  var similarityCutoff = 75;
  let T3SS = [
    "HrpF",
    "HrpG",
    "HrpL",
    "HrpR",
    "HrpS",
    "HrpT",
    "HrpV",
    "HrpZ",
    "SctC",
    "SctD",
    "SctE",
    "SctF",
    "SctI",
    "SctJ",
    "SctK",
    "SctL",
    "SctN",
    "SctO",
    "SctP",
    "SctQa",
    "SctQb",
    "SctR",
    "SctS",
    "SctT",
    "SctU",
    "SctV",
    "SctW",
  ];
  let T3E = [
    "AvrA1",
    "AvrB1",
    "AvrB2",
    "AvrE1",
    "AvrPto1",
    "AvrRpm1",
    "AvrRpt2",
    "HopA1",
    "HopAA1",
    "HopAB1",
    "HopAD1",
    "HopAF1",
    "HopAG1",
    "HopAH1",
    "HopAI1",
    "HopAL1",
    "HopAM1",
    "HopAQ1",
    "HopAR1",
    "HopAS1",
    "HopAT1",
    "HopAT2",
    "HopAT3",
    "HopAT4",
    "HopAT5",
    "HopAT6",
    "HopAU1",
    "HopAW1",
    "HopAX1",
    "HopAZ1",
    "HopB1",
    "HopB2",
    "HopB3",
    "HopB4",
    "HopBA1",
    "HopBC1",
    "HopBD1",
    "HopBE1",
    "HopBF1",
    "HopBG1",
    "HopBH1",
    "HopBI1",
    "HopBJ1",
    "HopBK1",
    "HopBL1",
    "HopBM1",
    "HopBN1",
    "HopBO1",
    "HopBP1",
    "HopBQ1",
    "HopBR1",
    "HopBS1",
    "HopBT1",
    "HopBU1",
    "HopBV1",
    "HopBW1",
    "HopBX1",
    "HopC1",
    "HopD1",
    "HopD2",
    "HopE1",
    "HopF1",
    "HopF3",
    "HopF4",
    "HopG1",
    "HopH1",
    "HopH2",
    "HopK1",
    "HopL1",
    "HopM1",
    "HopN1",
    "HopO1",
    "HopO2",
    "HopQ1",
    "HopR1",
    "HopS2",
    "HopT1",
    "HopU1",
    "HopV1",
    "HopW1",
    "HopX1",
    "HopY1",
    "HopZ1",
    "HopZ2",
    "HopZ4",
    "HopZ5",
    "HopZ6",
  ];
  let WHOP = [
    "antA",
    "antB",
    "antC",
    "catA",
    "catB",
    "catC",
    "dhoA",
    "dhoB",
    "ipoA",
    "ipoB",
    "ipoC",
  ];
  const [barData, setbardata] = useState([{ dist: 40, count: 10 }]);
  const [rangeValue, setRangeValue] = useState(95);
  const [rangeUpdate, setrangeUpdate] = useState(95);
  const [treeData, setTreeData] = useState("");
  const [keyNodes, setkeyNodes] = useState([
    "GCF_000233795.1",
    "GCF_002966555.1",
  ]);
  const [phylogroupPie, setPhylogroupPie] = useState([]);
  const [speciesPie, setSpeciesPie] = useState([]);
  const [pathovarPie, setPathovarPie] = useState([]);
  const [T3SSBar, setT3SSBar] = useState([]);
  const [T3EBar, setT3EBar] = useState([]);
  const [WHOPBar, setWHOPBar] = useState([]);
  const [datarings, setdatarings] = useState([
    {
      type: "categorical", // categorical, heatmap, or bar
      feature: "Species", // any valid column name in CSV file, or property of row object
      height: 15,
      padding: 5,
      color: {
        colorScheme: "Category10",
        default: "lightGrey",
      },
      tooltip: {
        content: "assigned pathovar: ${Pathovar}",
        header: "P. ${Species} pv. ${Pathovar}, ${Strain}",
        size: "",
      },
    },
  ]);

  useEffect(() => {
    document.title = "Syringae - identify";
  }, []);

  useEffect(() => {
    // set ANI histogram data when selectedQuery changes
    if (selectedQuery[0].value != "Upload") {
      var arr = [];
      selectedQuery[0].distances.forEach((ref) => {
        let similarity = 100 - ref.dist * 100;
        if (similarity >= similarityCutoff) {
          arr.push(similarity); //x[Math.floor(similarity).toString()]++;
        }
      });
      var histGenerator = d3
        .bin()
        .thresholds((100 - similarityCutoff) * 2 - 2)
        .domain([similarityCutoff, 100.5]);
      var bins = histGenerator(arr);
      let ls = [];
      bins.forEach((bin, i) => {
        ls.push({
          dist: bin.length > 0 ? Math.min(...bin) : -i,
          count: bin.length,
        });
      });

      setbardata(ls);
    }
  }, [selectedQuery]);

  useEffect(() => {
    // set phylogenetic and functional plotting data when keyNodes changes
    let PhylogroupData = {};
    let SpeciesData = {};
    let PathovarData = {};
    let T3SSData = {};
    let T3EData = {};
    let WHOPData = {};
    keyNodes.forEach((ID) => {
      let relative = metadata.get(ID);
      if (relative.Organism in PhylogroupData) {
        PhylogroupData[relative.Organism]++;
      } else {
        PhylogroupData[relative.Organism] = 1;
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
        value: T3SSData[key] / keyNodes.length,
        color: "hsl(116, 70%, 50%)",
      });
    }
    for (const key in T3EData) {
      T3Eplot.push({
        id: key,
        label: key,
        value: T3EData[key] / keyNodes.length,
        color: "hsl(116, 70%, 50%)",
      });
    }
    for (const key in WHOPData) {
      WHOPplot.push({
        id: key,
        label: key,
        value: WHOPData[key] / keyNodes.length,
        color: "hsl(116, 70%, 50%)",
      });
    }
    setT3SSBar(T3SSplot);
    setT3EBar(T3Eplot);
    setWHOPBar(WHOPplot);
    setPathovarPie(PVPie);
    setPhylogroupPie(PGPie);
    setSpeciesPie(SPPie);
    //-------- Functional genes
  }, [keyNodes]);

  useEffect(() => {
    //let toolHeader = ()=>{`ANI with ${selectedQuery[0].name}: ` + "${" + `${selectedQuery[0].name}` + "}"}
    setdatarings([
      datarings[0] /*,
      {
        type: "bar",
        feature: selectedQuery[0].name,
        height: { domain: [1, 0], range: [35, 35] }, // requires a range, optionally accepts domain, with default domain being extent of data
        padding: 5,
        color: {
          fill: "#e31227", // least priority, overridden by providing domain for heatmap
          domain: [0, 1 - rangeUpdate / 100, 1 - rangeUpdate / 100 + 0.0001, 1],
          //range: ["#8f0806", "#ff5452", "#c7c7c7", "white"],
          range: ["#21232b","#21232b","white"]
        },
        tooltip: {
          content:
            `distance from ${selectedQuery[0].name}: ` +
            "${" +
            `${selectedQuery[0].name}` +
            "}",
          header: "P. ${SPECIES} pv. ${PATHOVAR}, ${STRAIN}",
        },
        onClick: (leafNode) => {
          handleClick(leafNode);
        },
      },
    */,
    ]);
  }, [selectedQuery, rangeUpdate]);

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
    handleKeyNodeUpdate();
  }, [selectedQuery]);

  function handleClick(obj) {
    console.log(obj);
  }
  function CurrentRangeValue(e, { value }) {
    setRangeValue(value);
  }
  function handleKeyNodeUpdate() {
    var nodeNames = [];
    var BiosampleNames = [];
    if (typeof selectedQuery[0].distances !== "undefined") {
      selectedQuery[0].distances.forEach((ref) => {
        let similarity = 100 - ref.dist * 100;
        if (similarity >= rangeValue) {
          nodeNames.push(metadata.get(ref.name.replaceAll("^", "")).name);
          console.log(nodeNames);
        }
      });
      console.log(nodeNames);
      setkeyNodes(nodeNames);
      setrangeUpdate(rangeValue);
    }
  }
  return (
    <>
      <p>THIS NEEDS TO BE DONE STILL. DON'T JUDGE THE UGLINESS.</p>
      <Segment
        style={{ textAlign: "left", margin: "30px", marginBottom: "0px" }}
      >
        <p
          style={{
            textAlign: "left",
            fontSize: "18pt",
            display: "inline-block",
          }}
        >
          <b>Showing Characterization for </b>
        </p>
        <span
          className="right item link grey"
          style={{ marginLeft: "20px", display: "inline-block", width: "50%" }}
        >
          <DropdownQueries
            style={{ textAlign: "left", margin: "30px" }}
            queryResults={queryResults}
            changeQuery={changeQuery}
            selectedQuery={selectedQuery}
            metadata={metadata}
          />
        </span>
        <Divider />
        <p style={{ textAlign: "left", fontSize: "18pt" }}>
          <b>Top Hit:</b>
        </p>
        {metadata && topHit ? (
          <Grid style={{ marginLeft: "20px" }}>
            <Grid.Column width={2}>
              <span className="right item link grey">
                <div style={{ marginBottom: 40 }}>
                  <p style={{ textAlign: "left", fontSize: "12pt" }}>
                    Accession:{" "}
                    <a
                      href={`https://www.ncbi.nlm.nih.gov/biosample/${topHit}`}
                    >
                      {topHit}
                    </a>
                  </p>
                  <p style={{ textAlign: "left", fontSize: "12pt" }}>
                    Phylogroup: <b>{metadata.get(topHit).PG}</b>
                  </p>
                  <p style={{ textAlign: "left", fontSize: "12pt" }}>
                    Species: <b>{metadata.get(topHit).SPECIES}</b>
                  </p>
                  <p style={{ textAlign: "left", fontSize: "12pt" }}>
                    Pathovar: <b>{metadata.get(topHit).PATHOVAR}</b>
                  </p>
                  <p style={{ textAlign: "left", fontSize: "12pt" }}>
                    Strain: <b>{metadata.get(topHit).STRAIN}</b>
                  </p>
                </div>
              </span>
            </Grid.Column>

            <Grid.Column width={12}>
              <div>
                <p style={{ textAlign: "left", fontSize: "12pt" }}>
                  <Popup
                    content="Structural and regulatory genes for the type 3 secretion system"
                    trigger={<Icon name="question circle outline" />}
                  />
                  <b>canonical T3SS</b> (
                  {
                    T3SS.filter((gene) => metadata.get(topHit)[gene] == 1)
                      .length
                  }
                  /{T3SS.length} genes found):{" "}
                  <p
                    style={{
                      textAlign: "left",
                      fontSize: "12pt",
                      color: "black",
                    }}
                  >
                    {T3SS.filter(
                      (gene) => metadata.get(topHit)[gene] == 1
                    ).join(", ")}
                  </p>
                </p>
                <p style={{ textAlign: "left", fontSize: "12pt" }}>
                  <Popup
                    content="Effector protein subfamilies delivered by the Type 3 secretion system"
                    trigger={<Icon name="question circle outline" />}
                  />
                  <b>T3SS effector proteins</b> (
                  {T3E.filter((gene) => metadata.get(topHit)[gene] == 1).length}{" "}
                  found):
                  <br />
                  {T3E.filter((gene) => metadata.get(topHit)[gene] == 1).join(
                    ", "
                  )}
                </p>
                <p style={{ textAlign: "left", fontSize: "12pt" }}>
                  <Popup
                    content="genes present in the 'Woody Host Or Pseudomonas' region associated with fitness in woody tissue"
                    trigger={<Icon name="question circle outline" />}
                  />
                  <b>WHOP region</b> (
                  {
                    WHOP.filter((gene) => metadata.get(topHit)[gene] == 1)
                      .length
                  }
                  /9 genes found):
                  <br />
                  {WHOP.filter((gene) => metadata.get(topHit)[gene] == 1).join(
                    ", "
                  )}
                </p>
              </div>
            </Grid.Column>
          </Grid>
        ) : (
          <></>
        )}
      </Segment>
      <Segment
        basic
        style={{
          width: "auto",
          margin: "30px",
        }}
      >
        <p style={{ textAlign: "left", fontSize: "18pt" }}>
          <b>Adjust average nucleotide identity threshold:</b>
        </p>
        <Container style={{ height: "200px", width: "53%", margin: "auto" }}>
          <ResponsiveBar
            data={barData}
            keys={["count"]}
            indexBy="dist"
            margin={{ left: 30, right: 20, top: 10, bottom: 5 }}
            padding={0.1}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={(d) => {
              var color;
              if (d.indexValue >= rangeValue) {
                color = "#21232b";
              } else {
                color = "#c7c7c7";
              }
              return color;
            }}
            layers={[
              "grid",
              "axes",
              "bars",
              "markers",
              "legends",
              "annotations",
            ]}
            axisBottom={null}
            enableLabel={false}
            enableGridY={true}
            borderColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
          />
          <div
            style={{
              textAlign: "center",
              width: "50%",
              height: "10px",
              margin: "auto",
            }}
          >
            <p>ANI between submitted sequence and known sequences</p>
          </div>
        </Container>
        <Container
          style={{
            textAlign: "center",
            width: "50%",
            margin: "auto",
            marginTop: "10px",
          }}
        >
          <Input
            min={75}
            max={100}
            step={0.5}
            fluid
            onChange={CurrentRangeValue}
            type="range"
            value={rangeValue}
          />

          <Container style={{ textAlign: "center", margin: "10px" }}>
            <Button onClick={handleKeyNodeUpdate} className="explore">
              {"Analyze isolates with ≥ " +
                Number(rangeValue).toFixed(1) +
                "% ANI"}
            </Button>
          </Container>
        </Container>

        <Divider />
        <p style={{ textAlign: "center", fontSize: "24pt" }}>
          <b>
            {keyNodes.length} reference strains found with ANI{" "}
            {"≥ " + rangeUpdate + "%"}{" "}
          </b>
        </p>
        <Divider />
        <p style={{ textAlign: "left", fontSize: "18pt" }}>
          <b>Taxonomic prediction:</b>
        </p>
        <div style={{marginTop:"5px"}}>
        <Tree
          newick={treeData}
          keyNodes={keyNodes}
          scaled={false}
          strokeColor="#000"
          strokeWidth={0.65}
          width={0.85}
          mappingData={treemeta} // can be CSV or structured data: [{name:"",tail:1,dist:0.1},{},...]. MUST CONTAIN "name" COLUMN/OBJECT PROPERTY
          highlightColor="#000"
          highlightWidth={1.25}
          dataRings={datarings}
        /></div>
        <Grid>
          <Grid.Column width={6}>
            <div style={{ marginLeft: "20%" }}>
              <p style={{ textAlign: "center", fontSize: "12pt" }}>
                <b>Phylogroups represented</b> among closest matches:
              </p>
              <div style={{ width: "100%", height: "25vh" }}>
                <ResponsivePie
                  data={phylogroupPie}
                  colors={{ scheme: "spectral" }}
                  arcLabelsTextColor="white"
                  margin={{ top: 20, right: 50, bottom: 40, left: 50 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={1}
                  activeOuterRadiusOffset={8}
                  borderWidth={0}
                  arcLinkLabelsSkipAngle={15}
                  arcLabelsSkipAngle={10}
                  legends={[
                    {
                      anchor: "left",
                      direction: "column",
                      justify: false,
                      translateX: 0,
                      translateY: 0,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemsSpacing: 0,
                      symbolSize: 20,
                      itemDirection: "left-to-right",
                    },
                  ]}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12pt",
                  marginTop: "1vh",
                }}
              >
                <b>Species represented</b> among closest matches:
              </p>
              <div style={{ width: "100%", height: "25vh" }}>
                <ResponsivePie
                  data={speciesPie}
                  colors={{ scheme: "spectral" }}
                  arcLabelsTextColor="white"
                  margin={{ top: 20, right: 50, bottom: 40, left: 50 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={1}
                  activeOuterRadiusOffset={8}
                  borderWidth={0}
                  arcLinkLabelsSkipAngle={15}
                  arcLabelsSkipAngle={10}
                  legends={[
                    {
                      anchor: "left",
                      direction: "column",
                      justify: false,
                      translateX: 0,
                      translateY: 0,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemsSpacing: 0,
                      symbolSize: 20,
                      itemDirection: "left-to-right",
                    },
                  ]}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12pt",
                  marginTop: "1vh",
                }}
              >
                <b>Pathovars represented</b> among closest matches:
              </p>
              <div style={{ width: "100%", height: "25vh" }}>
                <ResponsivePie
                  data={pathovarPie}
                  colors={{ scheme: "spectral" }}
                  arcLabelsTextColor="white"
                  margin={{ top: 20, right: 50, bottom: 40, left: 50 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={1}
                  activeOuterRadiusOffset={8}
                  borderWidth={0}
                  arcLinkLabelsSkipAngle={15}
                  arcLabelsSkipAngle={10}
                  legends={[
                    {
                      anchor: "left",
                      direction: "column",
                      justify: false,
                      translateX: 0,
                      translateY: 0,
                      itemWidth: 100,
                      itemHeight: 20,
                      itemsSpacing: 0,
                      symbolSize: 20,
                      itemDirection: "left-to-right",
                    },
                  ]}
                />
              </div>
            </div>
          </Grid.Column>
          {treemeta && <Grid.Column width={6}></Grid.Column>}
        </Grid>

        <Divider />
        <p style={{ textAlign: "left", fontSize: "18pt" }}>
          <b>Functional Prediction:</b>
        </p>
        <Grid>
          <Grid.Column width={4} textAlign="center" marginLeft="100px">
            <img src={T3SS_IMG} alt="Logo" height="250px" margin="auto" />
            <p
              style={{
                textAlign: "center",
                fontSize: "12pt",
                marginTop: "1vh",
              }}
            >
              <b>Canonical type 3 Secretion system</b> <br />
              carried by close relatives
            </p>
          </Grid.Column>
          <Grid.Column width={12}>
            <div
              style={{
                height: "220px",
                width: "75%",
                margin: "auto",
                marginTop: "50px",
                marginLeft: "0px",
              }}
            >
              <ResponsiveBar
                data={T3SSBar}
                keys={["value"]}
                indexBy="id"
                margin={{ left: 30, right: 0, top: 10, bottom: 40 }}
                padding={0.1}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                axisBottom={{ tickRotation: -90 }}
                colors={"#366c7d"}
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
              />
            </div>
          </Grid.Column>
        </Grid>
        <Divider />
        <Grid>
          <Grid.Column width={4} textAlign="center" marginLeft="100px">
            <img src={T3E_IMG} alt="Logo" height="250px" margin="auto" />
            <p
              style={{
                textAlign: "center",
                fontSize: "12pt",
                marginTop: "1vh",
              }}
            >
              <b>Type 3 effector proteins</b> <br />
              carried by close relatives
            </p>
          </Grid.Column>
          <Grid.Column width={12}>
            <div
              style={{
                height: "220px",
                width: "75%",
                margin: "auto",
                marginTop: "50px",
                marginLeft: "0px",
              }}
            >
              <ResponsiveBar
                data={T3EBar}
                keys={["value"]}
                indexBy="id"
                margin={{ left: 30, right: 0, top: 10, bottom: 60 }}
                padding={0.1}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={"#7d3636"}
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
              />
            </div>
          </Grid.Column>
        </Grid>
        <Divider />
        <Grid>
          <Grid.Column width={4} textAlign="center" marginLeft="100px">
            <img src={WHOP_IMG} alt="Logo" height="250px" margin="auto" />
            <p
              style={{
                textAlign: "center",
                fontSize: "12pt",
                marginTop: "1vh",
              }}
            >
              <b>WHOP genes</b> <br />
              carried by close relatives:
            </p>
          </Grid.Column>
          <Grid.Column width={12}>
            <div
              style={{
                height: "220px",
                width: "75%",
                margin: "auto",
                marginTop: "50px",
                marginLeft: "0px",
              }}
            >
              <ResponsiveBar
                data={WHOPBar}
                keys={["value"]}
                indexBy="id"
                margin={{ left: 30, right: 0, top: 10, bottom: 40 }}
                padding={0.1}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={"#452918"}
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
              />
            </div>
          </Grid.Column>
        </Grid>
      </Segment>
    </>
  );
}
