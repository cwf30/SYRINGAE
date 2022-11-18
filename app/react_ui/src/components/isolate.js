import React, { useState, useEffect } from "react";
import SearchOptions from "../assets/searchOptions.json";
import {
  Grid,
  Dropdown,
  Button,
  Container,
  Icon,
  Tab,
  List,
  GridColumn,
  Table,
} from "semantic-ui-react";
import Select, { createFilter } from "react-select";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDna, faBacterium, faLeaf } from "@fortawesome/free-solid-svg-icons";

export function Isolate({ setCurrentPage, SearchInput, setSearchInput }) {
  const [input, setInput] = useState(["", ""]);
  const [invalidSearch, setInvalidSearch] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [strainName, setStrainName] = useState(null);
  const [selectedVFOC, setSelectedVFOC] = useState(null);

  useEffect(() => {
    document.title = "Syringae.org";
  }, []);

  useEffect(() => {
    //called only on first render; loads page data
    async function fetchData() {
      const response = await fetch("/api/getIsolateData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ query: SearchInput }),
      });

      response.json().then((data) => {
        console.log(data);
        setPageData(data);
        let species =
          data["Species"] == "missing" ? "sp., " : data["Species"] + " ";
        let pathovar =
          data["Pathovar"] == "missing"
            ? ", "
            : "pv. " + data["Pathovar"] + ", ";
        let strain = data["Strain"];
        let full_name = "Pseudomonas " + species + pathovar + strain;
        setStrainName(full_name);
      });
    }
    fetchData();
  }, [SearchInput]);

  const filterSearch = (inputValue) => {
    let words = inputValue.split(" ");
    let tmp = SearchOptions.filter((i) => {
      return words.every((item) =>
        i.SearchTerms.toLowerCase().includes(item.toLowerCase())
      );
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

  const handleChange = (selection) => {
    if (selection.type === "protein") {
      setInput([selection.value, selection.type]);
    } else {
      setInput([selection.SearchTerms.split(" ")[0], selection.type]);
    }
  };

  useEffect(() => {
    if (invalidSearch) {
      setTimeout(() => {
        setInvalidSearch(false);
      }, 3000);
    }
  }, [invalidSearch]);

  function handleSearchClick(input) {
    if ((input[1] === "protein") | (input[1] === "isolate")) {
      setSearchInput(input[0]);
      setCurrentPage(input[1]);
      setSelectedVFOC(null);
    }
  }

  function getVFOC() {
    if (pageData) {
      let VFOClist = (
        <List link>
          <h3>Type 3 secretion system</h3>
          {Object.entries(pageData["VFOC"]["Type 3 secretion system"]).map(
            (effector) => {
              if (effector[1]["copies"].length > 0) {
                return (
                  <List.Item
                    key={effector[0]}
                    as="a"
                    active={
                      !(selectedVFOC == null) && effector[0] == selectedVFOC[0]
                    }
                    onClick={() => setSelectedVFOC(effector)}
                  >
                    {effector[0]}({effector[1]["copies"].length})
                  </List.Item>
                );
              }
            }
          )}
          {Object.entries(pageData["VFOC"]["Type 3 secretion system"]).map(
            (effector) => {
              if (effector[1]["copies"].length == 0) {
                return (
                  <List.Item key={effector[0]} as="a" disabled>
                    {effector[0]}({effector[1]["copies"].length})
                  </List.Item>
                );
              }
            }
          )}
          <h3>Type 3 effectors</h3>
          {Object.entries(pageData["VFOC"]["Type 3 effectors"]).map(
            (effector) => {
              if (effector[1]["copies"].length > 0) {
                return (
                  <List.Item
                    key={effector[0]}
                    as="a"
                    active={
                      !(selectedVFOC == null) && effector[0] == selectedVFOC[0]
                    }
                    onClick={() => setSelectedVFOC(effector)}
                  >
                    {effector[0]}({effector[1]["copies"].length})
                  </List.Item>
                );
              }
            }
          )}
          {Object.entries(pageData["VFOC"]["Type 3 effectors"]).map(
            (effector) => {
              if (effector[1]["copies"].length == 0) {
                return (
                  <List.Item key={effector[0]} as="a" disabled>
                    {effector[0]}({effector[1]["copies"].length})
                  </List.Item>
                );
              }
            }
          )}
          <h3>WHOP genes</h3>
          {Object.entries(pageData["VFOC"]["WHOP genes"]).map((effector) => {
            if (effector[1]["copies"].length > 0) {
              return (
                <List.Item
                  key={effector[0]}
                  active={
                    !(selectedVFOC == null) && effector[0] == selectedVFOC[0]
                  }
                  as="a"
                  onClick={() => setSelectedVFOC(effector)}
                >
                  {effector[0]}({effector[1]["copies"].length})
                </List.Item>
              );
            }
          })}
          {Object.entries(pageData["VFOC"]["WHOP genes"]).map((effector) => {
            if (effector[1]["copies"].length == 0) {
              return (
                <List.Item key={effector[0]} as="a" disabled>
                  {effector[0]}({effector[1]["copies"].length})
                </List.Item>
              );
            }
          })}
        </List>
      );
      return VFOClist;
    }
    return <></>;
  }

  function getHMMERhits() {
    let HMMERhits = (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>NCBI annotation</Table.HeaderCell>
            <Table.HeaderCell>accession</Table.HeaderCell>
            <Table.HeaderCell>E-value</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {selectedVFOC[1]["copies"].map((hit) => {
            return (
              <Table.Row key={hit["accession"]}>
                <Table.Cell>{hit["annotation"]}</Table.Cell>
                <Table.Cell>{hit["accession"]}</Table.Cell>
                <Table.Cell>{hit["E-value"]}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
    return HMMERhits;
  }

  function getRelatives() {
    let sorted = pageData["relatives"].sort((a, b) => (a.ANI < b.ANI ? 1 : -1));
    let relativeTable = (
      <Table celled fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type strain</Table.HeaderCell>
            <Table.HeaderCell>Species</Table.HeaderCell>
            <Table.HeaderCell>Pathovar</Table.HeaderCell>
            <Table.HeaderCell>Phylogroup</Table.HeaderCell>
            <Table.HeaderCell>Taxonomy check</Table.HeaderCell>
            <Table.HeaderCell>strain</Table.HeaderCell>
            <Table.HeaderCell>accession</Table.HeaderCell>
            <Table.HeaderCell>ANI (%)</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((relative) => {
            return (
              <Table.Row key={relative["accession"]}>
                <Table.Cell>{relative["Type strain"]}</Table.Cell>
                <Table.Cell>{relative["Species"]}</Table.Cell>
                <Table.Cell>{relative["Pathovar"]}</Table.Cell>
                <Table.Cell>{relative["Phylogroup"]}</Table.Cell>
                <Table.Cell>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/assembly/${relative["accession"]}/#/qa`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {relative["Taxonomy check"]}
                  </a>
                </Table.Cell>
                <Table.Cell>{relative["Strain"]}</Table.Cell>
                <Table.Cell>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/data-hub/genome/${relative["accession"]}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {relative["accession"]}
                  </a>
                </Table.Cell>
                <Table.Cell>{parseFloat(relative["ANI"]).toFixed(2)}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
    return relativeTable;
  }

  const styles = {
    textAlign: "left",
    container: (base) => ({
      ...base,
      flex: 1,
      marginLeft: "15px",
    }),
  };

  const panes = [
    {
      menuItem: "strain info",
      render: () => (
        <Tab.Pane attached={false}>
          {pageData ? (
            <div style={{ margin: "15px" }}>
              <b>RefSeq accession: </b>
              <a
                href={`https://www.ncbi.nlm.nih.gov/data-hub/genome/${pageData["name"]}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pageData["name"]}
              </a>
              <br />
              <br />
              <b>Type strain: </b>
              {pageData["Type strain"]}
              <br />
              <br />
              <b>Phylogroup: </b>
              {pageData["Phylogroup"]}
              <br />
              <br />
              <b>Species: </b>
              {pageData["Species"]}
              <br />
              <br />
              <b>Pathovar: </b>
              {pageData["Pathovar"]}
              <br />
              <br />
              <b>Strain: </b>
              {pageData["Strain"]}
              <br />
              <br />
              <b>Taxonomy check: </b>
              <a
                href={`https://www.ncbi.nlm.nih.gov/assembly/${pageData["name"]}/#/qa`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pageData["Taxonomy check"]}
              </a>
              <br />
              <br />
              <hr
                style={{
                  color: "#f2f2f2",
                }}
              />
              <br />
              <b>Geographic location: </b>
              {pageData["Geographic Location"]}
              <br />
              <br />
              <b>Isolation Source: </b>
              {pageData["Isolation Source"]}
              <br />
              <br />
              <b>Submission Date: </b>
              {pageData["Submission Date"]}
              <br />
              <br />
              <b>Submitting Organization: </b>
              {pageData["Submitting Organization"]}
              <br />
              <br />
            </div>
          ) : (
            <></>
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: "virulence factors",
      render: () => (
        <Tab.Pane attached={false}>
          {pageData ? (
            <div style={{ margin: "15px" }}>
              <Grid>
                <Grid.Column width={3}>
                  <div style={{ overflowY: "auto", maxHeight: "65vh" }}>
                    {getVFOC()}
                  </div>
                </Grid.Column>
                <GridColumn width={12}>
                  <h2>
                    {selectedVFOC
                      ? `HMMER hits for ${selectedVFOC[0]}`
                      : "<- Select a virulence-associated gene for more details"}
                  </h2>
                  {selectedVFOC ? getHMMERhits() : <></>}
                </GridColumn>
              </Grid>
            </div>
          ) : (
            <></>
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: "similar strains",
      render: () => (
        <Tab.Pane attached={false}>
          {pageData ? (
            <div style={{ margin: "15px" }}>{getRelatives()}</div>
          ) : (
            <></>
          )}
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <div className="wiki-searchBar">
        <AsyncSelect
          placeholder="Search for isolate or gene..."
          noOptionsMessage={(e) => {
            return e.inputValue.length < 3
              ? "..."
              : "Your search did not match any documents";
          }}
          styles={styles}
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={[]}
          onChange={handleChange}
          onKeyDown={(e, r) => {
            if (e.code === "Enter") {
              handleSearchClick(input);
            }
          }}
          getOptionLabel={(e) => (
            <div style={{ display: "flex", alignItems: "center" }}>
              <FontAwesomeIcon
                icon={
                  e.icon == "faDna"
                    ? faDna
                    : e.icon == "faBacterium"
                    ? faBacterium
                    : faLeaf
                }
                color={e.iconColor}
              />
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
        <Button
          circular
          className="search"
          size="large"
          onClick={(e, r) => {
            handleSearchClick(input);
          }}
        >
          <div style={{ marginLeft: "-15px", marginTop: "-2px" }}>
            <Icon name="search" size="large" />
          </div>
        </Button>
      </div>
      <div className="wiki-title">
        showing results for: {strainName ? strainName : "..."}
      </div>
      <Grid style={{ marginLeft: "0px", marginRight: "0px" }}>
        <Grid.Column>
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </Grid.Column>
      </Grid>
    </>
  );
}
