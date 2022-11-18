import React, { useState, useEffect, useTransition } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import SearchOptions from ".././assets/searchOptions.json";
import {
  Grid,
  Segment,
  Table,
  Menu,
  Checkbox,
  Form,
  Accordion,
  Icon,
  Button,
} from "semantic-ui-react";
import { Tree } from "./tree/Tree";
import { LegendMenu } from "./legendMenu";

export function Explore({ setMetadata, metadata, treemeta }) {
  const [isPending, startTransition] = useTransition({});
  const [activeIndex, setActiveIndex] = useState([0]);
  const [treeData, setTreeData] = useState("");
  const [keyNodes, setkeyNodes] = useState([]);
  const [keyIsolates, setkeyIsolates] = useState([]);
  const [noMatches, setNoMatches] = useState(false);
  const [geneAnnotations, setGeneAnnotations] = useState({
    1: "",
    2: "",
    3: "",
  });
  const [taxaAnnotations, setTaxaAnnotations] = useState({
    Phylogroup: true,
    Species: false,
    Pathovar: false,
    LINlevel: false,
  });
  const [phylogroupOptions, setPhylogroupOptions] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [pathovarOptions, setPathovarOptions] = useState([]);
  const [LINlevelOptions, setLINlevelOptions] = useState([]);
  const [treeFilters, setTreeFilters] = useState({
    Phylogroup: [],
    Pathovar: [],
    Species: [],
  });
  const [tableData, setTableData] = useState([]);
  const [FilterMatches, setFilterMatches] = useState("");
  const [Searching, setSearching] = useState(false);
  const [changingColors, setChangingColors] = useState(false);
  const [legends, setLegends] = useState({});
  const [ringColors, setRingColors] = useState({});
  const [datarings, setdatarings] = useState([
    {
      type: "categorical", // categorical, heatmap, or bar
      feature: "Phylogroup", // any valid column name in CSV file, or property of row object
      height: 15,
      padding: 5,
      color: {
        range: getColorRange("Phylogroup"),
        domain: getColorDomain("Phylogroup"),
        default: "lightGrey",
      },
      tooltip: {
        header: `"Phylogroup": ` + "${Phylogroup}",
        content: "P. ${Species} pv. ${Pathovar}, ${Strain}",
        size: "",
      },
    },
  ]);

  useEffect(() => {
    document.title = "Syringae - explore";
  }, []);

  function getGenesFromFlask() {
    async function fetchData() {
      const response = await fetch("/api/getGeneAnnotations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ query: geneAnnotations, metadata: metadata }),
      });

      response.json().then((data) => {
        //console.log(data)
        const names = metadata.keys();
        let tmpMeta = metadata;
        for (const name in names) {
          for (const result in data[names[name]]) {
            tmpMeta.get(names[name])[result] = data[names[name]][result];
          }
        }
        setMetadata(tmpMeta);
        setFilterMatches("building new tree...");
        //buildDataRings();
      });
    }
    fetchData();
  }

  const filterSearch = (inputValue) => {
    let words = inputValue.split(" ");
    let tmp = SearchOptions.filter((i) => {
      return words.every((item) => {
        return (
          (i.type == "protein") &
          i.SearchTerms.toLowerCase().includes(item.toLowerCase())
        );
      });
    });
    return tmp.length > 200
      ? [{ label: "Too many results to load. Be more specific", icon: "uh-oh" }]
      : tmp;
  };

  const loadOptions = (inputValue, callback) => {
    if (inputValue.length < 3) {
      callback([]);
    } else {
      callback(filterSearch(inputValue));
    }
  };

  /*useEffect(() => {
    if (Searching) {
      setTimeout(() => {
        setSearching(false);
      }, 3000);
    }
  }, []);*/

  handleClick = (e, titleProps) => {
    let newActive;
    const addIndex = activeIndex.includes(titleProps.index) ? false : true;
    if (addIndex) {
      newActive = activeIndex.concat([titleProps.index]);
      setActiveIndex(newActive);
    } else {
      newActive = activeIndex.filter((active) => active != titleProps.index);
      setActiveIndex(newActive);
    }
  };

  useEffect(() => {
    //setdatarings([datarings[0]]);
  }, []);

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

  function handleClick(obj) {
    console.log(obj);
  }

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

  function getColorRange(t) {
    if (t == "Phylogroup") {
      return [
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
      ];
    } else {
      return [
        "#000000",
        "#FFFF00",
        "#1CE6FF",
        "#FF34FF",
        "#FF4A46",
        "#008941",
        "#006FA6",
        "#A30059",
        "#FFDBE5",
        "#7A4900",
        "#0000A6",
        "#63FFAC",
        "#B79762",
        "#004D43",
        "#8FB0FF",
        "#997D87",
        "#5A0007",
        "#809693",
        "#FEFFE6",
        "#1B4400",
        "#4FC601",
        "#3B5DFF",
        "#4A3B53",
        "#FF2F80",
        "#61615A",
        "#BA0900",
        "#6B7900",
        "#00C2A0",
        "#FFAA92",
        "#FF90C9",
        "#B903AA",
        "#D16100",
        "#DDEFFF",
        "#000035",
        "#7B4F4B",
        "#A1C299",
        "#300018",
        "#0AA6D8",
        "#013349",
        "#00846F",
        "#372101",
        "#FFB500",
        "#C2FFED",
        "#A079BF",
        "#CC0744",
        "#C0B9B2",
        "#C2FF99",
        "#001E09",
        "#00489C",
        "#6F0062",
        "#0CBD66",
        "#EEC3FF",
        "#456D75",
        "#B77B68",
        "#7A87A1",
        "#788D66",
        "#885578",
        "#FAD09F",
        "#FF8A9A",
        "#D157A0",
        "#BEC459",
        "#456648",
        "#0086ED",
        "#886F4C",
        "#34362D",
        "#B4A8BD",
        "#00A6AA",
        "#452C2C",
        "#636375",
        "#A3C8C9",
        "#FF913F",
        "#938A81",
        "#575329",
        "#00FECF",
        "#B05B6F",
        "#8CD0FF",
        "#3B9700",
        "#04F757",
        "#C8A1A1",
        "#1E6E00",
        "#7900D7",
        "#A77500",
        "#6367A9",
        "#A05837",
        "#6B002C",
        "#772600",
        "#D790FF",
        "#9B9700",
        "#549E79",
        "#FFF69F",
        "#201625",
        "#72418F",
        "#BC23FF",
        "#99ADC0",
        "#3A2465",
        "#922329",
        "#5B4534",
        "#FDE8DC",
        "#404E55",
        "#0089A3",
        "#CB7E98",
        "#A4E804",
        "#324E72",
        "#6A3A4C",
      ];
    }
  }

  function getColorDomain(t) {
    if (t == "Phylogroup") {
      return [
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
      ];
    } else if (t == "Species") {
      return [
        "amygdali",
        "asturiensis",
        "avellanae",
        "cannabina",
        "caricapapayae",
        "caspiana",
        "cichorii",
        "coronafaciens",
        "fuscovaginae",
        "missing",
        "savastanoi",
        "syringae",
        "viridiflava",
      ];
    } else if (t == "Pathovar") {
      return [
        "aceris",
        "actinidiae",
        "actinidifoliorum",
        "aesculi",
        "alisalensis",
        "antirrhini",
        "apii",
        "aptata",
        "atrofaciens",
        "avii",
        "berberidis",
        "broussonetiae",
        "castaneae",
        "cerasicola",
        "cilantro",
        "coriandricola",
        "coronafaciens",
        "delphinii",
        "dysoxyli",
        "eriobotryae",
        "fraxini",
        "garcae",
        "glycinea",
        "helianthi",
        "hibisci",
        "lachrymans",
        "lapsa",
        "maculicola",
        "mellea",
        "missing",
        "mori",
        "morsprunorum",
        "myricae",
        "nerii",
        "oryzae",
        "papulans",
        "persicae",
        "phaseolicola",
        "pisi",
        "porri",
        "primulae",
        "retacarpa",
        "ribicola",
        "savastanoi",
        "sesami",
        "syringae",
        "tabaci",
        "tagetis",
        "theae",
        "tomato",
        "ulmi",
        "viburni",
        "zizaniae",
      ];
    }
  }

  function handleClick_ApplyChanges() {
    let initialLegendColors = { ...ringColors };
    if (geneAnnotations["1"] != "" && !(geneAnnotations["1"] in ringColors)) {
      initialLegendColors[geneAnnotations["1"]] = {
        domain: [0, 1],
        range: ["#f4f7f2", "#065994"],
      };
      //initialLegendColors[geneAnnotations["1"]] = {0:"#fff",1:"#065994"}
    }
    if (geneAnnotations["2"] != "" && !(geneAnnotations["2"] in ringColors)) {
      initialLegendColors[geneAnnotations["2"]] = {
        domain: [0, 1],
        range: ["#f4f7f2", "#0e7334"],
      };
      //initialLegendColors[geneAnnotations["2"]] = {0:"#fff",1:"#0e7334"}
    }
    if (geneAnnotations["3"] != "" && !(geneAnnotations["3"] in ringColors)) {
      initialLegendColors[geneAnnotations["3"]] = {
        domain: [0, 1],
        range: ["#f4f7f2", "#c46014"],
      };
      //initialLegendColors[geneAnnotations["3"]] = {0:"#fff",1:"#c46014"}
    }
    setRingColors(initialLegendColors);
    //handleColorChange(initialLegendColors)

    setFilterMatches("Searching...");
    setSearching(true);
    startTransition(() => {
      getGenesFromFlask();

      let fullList = [];
      let pathovarList = [];
      let speciesList = [];
      let phylogroupList = [];
      const isolates = metadata.keys();
      isolates.forEach((isolate) => {
        fullList.push(metadata.get(isolate).name);
        if (
          (treeFilters["Pathovar"].length == 0) |
          treeFilters["Pathovar"].includes(metadata.get(isolate)["Pathovar"])
        ) {
          pathovarList.push(metadata.get(isolate).name);
        }
        if (
          (treeFilters["Species"].length == 0) |
          treeFilters["Species"].includes(metadata.get(isolate)["Species"])
        ) {
          speciesList.push(metadata.get(isolate).name);
        }

        if (
          (treeFilters["Phylogroup"].length == 0) |
          treeFilters["Phylogroup"].includes(
            metadata.get(isolate)["Phylogroup"]
          )
        ) {
          phylogroupList.push(metadata.get(isolate).name);
        }
      });
      const tmpkeyNodes = fullList.filter((n) => {
        return (
          pathovarList.includes(n) &&
          speciesList.includes(n) &&
          phylogroupList.includes(n)
        );
      });

      if (tmpkeyNodes.length > 0 && tmpkeyNodes.length < fullList.length) {
        setkeyNodes([...tmpkeyNodes]);
        setkeyIsolates([...tmpkeyNodes]);
        setFilterMatches("finding most recent common ancestor");
        setNoMatches(false);
      } else if (tmpkeyNodes.length == fullList.length) {
        setkeyNodes([]);
        setkeyIsolates(fullList);
        setNoMatches(false);
      } else {
        setNoMatches(true);
        setFilterMatches("no matches found for this combination of filters");
      }
    });
  }

  function buildDataRings() {
    let taxa = [];
    if (taxaAnnotations.Phylogroup) taxa.push("Phylogroup");
    if (taxaAnnotations.Species) taxa.push("Species");
    if (taxaAnnotations.Pathovar) taxa.push("Pathovar");
    if (taxaAnnotations.LINlevel) taxa.push(taxaAnnotations.LINlevel);
    let genes = [];
    if (geneAnnotations["1"] != "") genes.push(geneAnnotations["1"]);
    if (geneAnnotations["2"] != "") genes.push(geneAnnotations["2"]);
    if (geneAnnotations["3"] != "") genes.push(geneAnnotations["3"]);

    let newRings = [];
    taxa.forEach((t) => {
      newRings.push({
        type: "categorical", // categorical, heatmap, or bar
        feature: t, // any valid column name in CSV file, or property of row object
        height: 15,
        padding: 5,
        color: {
          range:
            ringColors && ringColors[t]
              ? ringColors[t].range
              : getColorRange(t),
          domain:
            ringColors && ringColors[t]
              ? ringColors[t].domain
              : getColorDomain(t),
          default: "lightGrey",
        },
        tooltip: {
          header: `${t}: ` + "${" + `${t}` + "}",
          content: "P. ${Species} pv. ${Pathovar}, ${Strain}",
          size: "",
        },
      });
    });
    console.log(ringColors)
    genes.forEach((g) => {
      newRings.push({
        type: "heatmap", // categorical, heatmap, or bar
        feature: g, // any valid column name in CSV file, or property of row object
        height: 15,
        padding: 5,
        color:
          ringColors && ringColors[g]
            ? {
                range: ringColors[g].range,
                domain: ringColors[g].domain,
              }
            : {
                default: "lightGrey",
              },
        tooltip: {
          header: `${g}: ` + "${" + `${g}` + "}",
          content: "P. ${Species} pv. ${Pathovar}, ${Strain}",
          size: "",
        },
      });
    });
    setFilterMatches("building new tree...");
    console.log(newRings)
    setdatarings(newRings);
    setChangingColors(false);
  }

  useEffect(() => {
    console.log("building rings")
    buildDataRings();
  }, [ringColors]);

  function handleColorChange(newLegend) {
    setChangingColors(true);
    startTransition(() => {
      let newColors = {};
      for (const feature in newLegend) {
        let newDomain = [];
        let newRange = [];
        for (const d in newLegend[feature]) {
          if (d != "type") {
            newDomain.push(d);
            newRange.push(newLegend[feature][d]);
          }
        }
        if (newRange.length == 1) {
          newRange.push(newRange[0]);
        }
        newColors[feature] = { domain: newDomain, range: newRange };
      }
      setRingColors(newColors);
    });
  }

  const handlePhylogroupChange = (selection) => {
    let tmpFilters = treeFilters;
    tmpFilters["Phylogroup"] = [];
    selection.forEach((n) => {
      tmpFilters["Phylogroup"].push(n.label);
    });
    setTreeFilters(tmpFilters);
    setFilterMatches("");
  };
  const handleSpeciesChange = (selection) => {
    let tmpFilters = treeFilters;
    tmpFilters["Species"] = [];
    selection.forEach((n) => {
      tmpFilters["Species"].push(n.label);
    });
    setTreeFilters(tmpFilters);
    setFilterMatches("");
  };
  const handlePathovarChange = (selection) => {
    let tmpFilters = treeFilters;
    tmpFilters["Pathovar"] = [];
    selection.forEach((n) => {
      tmpFilters["Pathovar"].push(n.label);
    });
    setTreeFilters(tmpFilters);
    setFilterMatches("");
  };

  const handleGeneChange = (selection, e) => {
    let tmpGenes = geneAnnotations;
    if (selection == null) {
      tmpGenes[e.name] = "";
    } else tmpGenes[e.name] = selection.value;
    setGeneAnnotations(tmpGenes);
    setFilterMatches("");
  };

  function annotate(e, things) {
    let tmpTAXA = taxaAnnotations;
    tmpTAXA[things.id] = things.checked;
    setTaxaAnnotations(tmpTAXA);
    setFilterMatches("");
  }

  const annotateLIN = (selection) => {
    let tmpTAXA = taxaAnnotations;
    if (selection == null) {
      tmpTAXA["LINlevel"] = "";
    } else tmpTAXA["LINlevel"] = selection.value;
    setTaxaAnnotations(tmpTAXA);
    setFilterMatches("");
  };

  const LINOptions = () => {
    const columns = metadata.get(metadata.keys()[0]);
    const opts = [];
    for (const col in columns) {
      if (col.slice(0, 4) == "ANI_") {
        opts.push({ label: col.slice(4) + "% ANI", value: col });
      }
    }
    setLINlevelOptions(opts);
  };
  function buildOptions(Metadata_column) {
    let opt = [];
    for (const isolate in metadata) {
      if (!opt.includes(metadata[isolate][Metadata_column])) {
        opt.push(metadata[isolate][Metadata_column]);
      }
    }
    opt = opt.sort();
    let options = [];
    opt.forEach((p) => {
      options.push({ label: p, value: p });
    });
    switch (Metadata_column) {
      case "Phylogroup":
        setPhylogroupOptions(options);
        break;
      case "Species":
        setSpeciesOptions(options);
        break;
      case "Pathovar":
        setPathovarOptions(options);
        break;
    }
  }

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
      marginLeft: "10px",
    }),
  };

  return (
    <>
      <Segment
        color="olive"
        style={{ textAlign: "left", marginLeft: "20px", marginRight: "20px" }}
      >
        <Accordion>
          <Accordion.Title
            active={activeIndex.includes(0)}
            index={0}
            onClick={handleClick}
            className="subheading"
          >
            <Icon name="dropdown" />
            <b>Options</b>
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(0)}>
            <Form>
              <Grid
                style={{
                  textAlign: "left",
                  marginLeft: "40px",
                }}
              >
                <Grid.Column width={4}>
                  <p className="heading">
                    <b>Filter genomes:</b>
                  </p>
                  <p
                    className="text"
                    style={{
                      textAlign: "left",
                      marginLeft: "10px",
                    }}
                  >
                    By phylogroup
                  </p>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder="Choose phylogroups to focus on"
                    styles={styles}
                    cacheOptions
                    options={phylogroupOptions}
                    onFocus={() => {
                      buildOptions("Phylogroup");
                    }}
                    onChange={handlePhylogroupChange}
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
                  />

                  <p
                    className="text"
                    style={{
                      textAlign: "left",
                      marginLeft: "10px",
                      marginTop: "10px",
                    }}
                  >
                    By species
                  </p>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder="Choose species to focus on"
                    styles={styles}
                    cacheOptions
                    options={speciesOptions}
                    onFocus={() => {
                      buildOptions("Species");
                    }}
                    onChange={handleSpeciesChange}
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
                  />
                  <p
                    className="text"
                    style={{
                      textAlign: "left",
                      marginLeft: "10px",
                      marginTop: "10px",
                    }}
                  >
                    By pathovar
                  </p>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    placeholder="Choose pathovars to focus on"
                    styles={styles}
                    cacheOptions
                    options={pathovarOptions}
                    onFocus={() => {
                      buildOptions("Pathovar");
                    }}
                    onChange={handlePathovarChange}
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
                  />
                </Grid.Column>
                <Grid.Column
                  width={4}
                  style={{ textAlign: "left", marginLeft: "75px" }}
                >
                  <p
                    className="heading"
                    style={{
                      marginBottom: "40px",
                    }}
                  >
                    <b>Gene annotations:</b>
                  </p>
                  <AsyncSelect
                    name={"1"}
                    isClearable
                    placeholder="search for gene to annotate"
                    noOptionsMessage={(e) => {
                      return e.inputValue.length < 3
                        ? "..."
                        : "Your search did not match any documents";
                    }}
                    styles={styles}
                    style={{ marginTop: "20px" }}
                    cacheOptions
                    loadOptions={loadOptions}
                    defaultOptions={[]}
                    onChange={handleGeneChange}
                    getOptionLabel={(e) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ marginLeft: 5 }}>{e.label}</span>
                      </div>
                    )}
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
                  />
                  <div style={{ marginTop: "20px" }}>
                    <AsyncSelect
                      name={"2"}
                      isClearable
                      placeholder="search for gene to annotate"
                      noOptionsMessage={(e) => {
                        return e.inputValue.length < 3
                          ? "..."
                          : "Your search did not match any documents";
                      }}
                      styles={styles}
                      cacheOptions
                      loadOptions={loadOptions}
                      defaultOptions={[]}
                      onChange={handleGeneChange}
                      getOptionLabel={(e) => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginLeft: 5 }}>{e.label}</span>
                        </div>
                      )}
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
                    />
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <AsyncSelect
                      name={"3"}
                      isClearable
                      placeholder="search for gene to annotate"
                      noOptionsMessage={(e) => {
                        return e.inputValue.length < 3
                          ? "..."
                          : "Your search did not match any documents";
                      }}
                      styles={styles}
                      cacheOptions
                      loadOptions={loadOptions}
                      defaultOptions={[]}
                      onChange={handleGeneChange}
                      getOptionLabel={(e) => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ marginLeft: 5 }}>{e.label}</span>
                        </div>
                      )}
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
                    />
                  </div>
                </Grid.Column>
                <Grid.Column
                  width={6}
                  style={{ textAlign: "left", marginLeft: "75px" }}
                >
                  <p
                    className="heading"
                    style={{
                      marginBottom: "40px",
                    }}
                  >
                    <b>Taxonomic annotations:</b>
                  </p>
                  <Checkbox
                    defaultChecked
                    className="text"
                    id="Phylogroup"
                    label="Phylogroup"
                    onChange={annotate}
                    style={{
                      textAlign: "left",
                      margin: "25px",
                      marginTop: "5px",
                    }}
                  />
                  <Checkbox
                    className="text"
                    id="Species"
                    label="Species"
                    onChange={annotate}
                    style={{
                      textAlign: "left",
                      margin: "25px",
                      marginTop: "5px",
                    }}
                  />
                  <Checkbox
                    className="text"
                    id="Pathovar"
                    label="Pathovar"
                    onChange={annotate}
                    style={{
                      textAlign: "left",
                      margin: "25px",
                      marginTop: "5px",
                    }}
                  />
                  <p
                    className="text"
                    style={{
                      margin: "25px",
                      marginTop: "5px",
                      marginBottom: "5px",
                    }}
                  >
                    LIN clusters (Average nucleotide identity)
                  </p>
                  <Select
                    closeMenuOnSelect={true}
                    placeholder="Select ANI clustering to annotate"
                    styles={styles}
                    isClearable
                    cacheOptions
                    options={LINlevelOptions}
                    onFocus={() => {
                      LINOptions();
                    }}
                    onChange={annotateLIN}
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
                  />
                </Grid.Column>
              </Grid>
              <Button
                size="medium"
                className="explore"
                loading={Searching}
                style={{
                  textAlign: "center",
                  marginLeft: "65px",
                  marginTop: "10px",
                }}
                onClick={handleClick_ApplyChanges}
              >
                Apply changes
              </Button>
              <div
                style={{
                  textAlign: "left",
                  marginTop: "5px",
                  marginLeft: "65px",
                  height: "30px",
                  fontFamily: "Roboto",
                  color: "rgb(68, 48, 9)",
                }}
              >
                {FilterMatches}
              </div>
            </Form>
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex.includes(1)}
            index={1}
            className="subheading"
            onClick={handleClick}
          >
            <Icon name="dropdown" />
            <b>Genomes matching filters</b>
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex.includes(1)}
            style={{ overflow: "auto", maxHeight: "50vh" }}
          >
            {keyIsolates.length == 0 ? <p>No filters applied.</p> : 
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
            </Table>}
          </Accordion.Content>
        </Accordion>
      </Segment>

      <Grid style={{ marginTop: "75px" }}>
        {metadata && (
          <>
            <Grid.Column width={4}>
              <LegendMenu
                legends={legends}
                dataRings={datarings}
                setLegends={setLegends}
                updateViz={handleColorChange}
              />
            </Grid.Column>
            <Grid.Column width={10} textAlign="center">
              <Tree
                newick={treeData}
                keyNodes={keyNodes}
                scaled={false}
                width={0.98}
                strokeColor="rgb(68, 48, 9)"
                strokeWidth={0.65}
                mappingData={treemeta} // can be CSV or structured data: [{name:"",tail:1,dist:0.1},{},...]. MUST CONTAIN "name" COLUMN/OBJECT PROPERTY
                highlightColor="#000"
                highlightWidth={1.25}
                dataRings={datarings}
                onLegend={(r) => {
                  setLegends(r);
                  setFilterMatches(
                    noMatches
                      ? "no strains found for this combination of filters"
                      : "Tree updated!"
                  );
                  setSearching(false);
                }}
              />
            </Grid.Column>
          </>
        )}
      </Grid>
    </>
  );
}
