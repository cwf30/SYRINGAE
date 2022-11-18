import React, { useState, useEffect } from "react";
import SearchOptions from "../assets/searchOptions.json";
import {
  Grid,
  Dropdown,
  Button,
  Container,
  Icon,
  Tab,
  Table,
} from "semantic-ui-react";
import Select, { createFilter } from "react-select";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDna, faBacterium, faLeaf } from "@fortawesome/free-solid-svg-icons";

export function Gene({ setCurrentPage, SearchInput, setSearchInput }) {
  const [input, setInput] = useState(["", ""]);
  const [invalidSearch, setInvalidSearch] = useState(false);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    document.title = "Syringae.org";
  }, []);

  useEffect(() => {
    //called only on first render; loads page data
    async function fetchData() {
      const response = await fetch("/api/getGeneData", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ query: SearchInput }),
      });

      response.json().then((data) => {
        console.log(data);
        setPageData(data);
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
    }
  }

  function getStrains() {
    let sorted = pageData["strains"].sort((a, b) =>
      a.Phylogroup > b.Phylogroup ? 1 : -1
    );
    let strainTable = (
      <Table celled fixed key={1}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type strain</Table.HeaderCell>
            <Table.HeaderCell>Species</Table.HeaderCell>
            <Table.HeaderCell>Pathovar</Table.HeaderCell>
            <Table.HeaderCell>Phylogroup</Table.HeaderCell>
            <Table.HeaderCell>Taxonomy check</Table.HeaderCell>
            <Table.HeaderCell>strain</Table.HeaderCell>
            <Table.HeaderCell>Genome accession</Table.HeaderCell>
            <Table.HeaderCell>Protein accession</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((strain) => {
            return (
              <Table.Row key={strain["isolateAccession"]}>
                <Table.Cell>{strain["Type strain"]}</Table.Cell>
                <Table.Cell>{strain["Species"]}</Table.Cell>
                <Table.Cell>{strain["Pathovar"]}</Table.Cell>
                <Table.Cell>{strain["Phylogroup"]}</Table.Cell>
                <Table.Cell>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/assembly/${strain["isolateAccession"]}/#/qa`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {strain["Taxonomy check"]}
                  </a>
                </Table.Cell>
                <Table.Cell>{strain["Strain"]}</Table.Cell>
                <Table.Cell>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/data-hub/genome/${strain["accession"]}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {strain["isolateAccession"]}
                  </a>
                </Table.Cell>
                <Table.Cell><a
                    href={`https://www.ncbi.nlm.nih.gov/protein/${strain["proteinAccession"]}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {strain["proteinAccession"]}
                  </a></Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
    return strainTable;
  }

  function getNonRedundantSequences() {
    let sorted = pageData["non_redundant"].sort((a, b) =>
      a.count < b.count ? 1 : -1
    );
    let NRTable = (
      <Table celled fixed key={2} style={{ width: "20%" }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Protein accession</Table.HeaderCell>
            <Table.HeaderCell>Occurrences</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sorted.map((protein) => {
            return (
              <Table.Row key={protein["acc"]}>
                <Table.Cell>
                  <a
                    href={`https://www.ncbi.nlm.nih.gov/protein/${protein["acc"]}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {protein["acc"]}
                  </a>
                </Table.Cell>
                <Table.Cell>{protein["count"]}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
    return NRTable;
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
      menuItem: "strains",
      render: () => (
        <Tab.Pane attached={false}>
          {pageData ? (
            <div style={{ margin: "15px" }}>{getStrains()}</div>
          ) : (
            <></>
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: "non-redundant sequences",
      render: () => (
        <Tab.Pane attached={false}>
          {pageData ? (
            <div style={{ margin: "15px" }}>{getNonRedundantSequences()}</div>
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
      <div className="wiki-title">showing results for: {SearchInput}</div>
      <Grid style={{ marginLeft: "0px", marginRight: "0px" }}>
        <Grid.Column>
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </Grid.Column>
      </Grid>
    </>
  );
}
