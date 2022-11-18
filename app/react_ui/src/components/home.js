import React, { useState, useEffect } from "react";
import syringaeLogo from ".././assets/logo.png";
//import SARE_logo from ".././assets/SARE_Northeast_CMYK.jpg";
import SARE_logo from ".././assets/SARE_transparent.png";
import SearchOptions from ".././assets/searchOptions.json";
import { Grid, Button, Icon } from "semantic-ui-react";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDna, faBacterium, faLeaf } from "@fortawesome/free-solid-svg-icons";

export function Home({ setCurrentPage, setSearchInput }) {
  const [input, setInput] = useState(["", ""]);
  const [invalidSearch, setInvalidSearch] = useState(false);

  useEffect(() => {
    document.title = "Syringae.org";
  }, []);

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
    if (selection.type === "protein") {setInput([selection.value, selection.type]);}else{
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

  function handleClick(str) {
    setCurrentPage(str);
  }

  function handleSearchClick(input) {
    if ((input[1] === "protein") | (input[1] === "isolate")) {
      setSearchInput(input[0]);
      setCurrentPage(input[1]);
    } 
  }

  const styles = {
    textAlign: "left",
    container: (base) => ({
      ...base,
      flex: 1,
      marginLeft: "75px",
    }),
  };
  return (
    <>
      <Grid className="center-screen">
        <Grid.Column width={8}>
          <img src={syringaeLogo} alt="Logo" height="100rem" margin="auto" />
          <div
            style={{ marginTop: "35px", display: "flex", flexDirection: "row" }}
          >
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
              size="medium"
              onClick={(e,r) => {handleSearchClick(input);}}
            >
              <div style={{ marginLeft: "-15px", marginTop: "-2px" }}>
                <Icon name="search" size="large" />
              </div>
            </Button>
          </div>
          {invalidSearch ? (
            <div
              style={{
                height: "20px",
                color: "rgb(68, 48, 9)",
                fontFamily: "Merriweather",
                fontSize: "0.8rem",
              }}
            >
              Your search did not match any documents{" "}
            </div>
          ) : (
            <div style={{ height: "20px" }}> </div>
          )}
          <Button.Group style={{ marginTop: "20%" }}>
            <Button
              className="identify"
              onClick={() => handleClick("identify")}
            >
              IDENTIFY
            </Button>
            <Button className="explore" onClick={() => handleClick("explore")}>
              EXPLORE
            </Button>
          </Button.Group>
        </Grid.Column>
      </Grid>
      <div className="footer">
        <img
          src={SARE_logo}
          alt="Logo"
          height="75rem"
          margin="10rem"
          style={{ position: "absolute", bottom: 12, left: 12 }}
        />
        <p
          style={{
            display: "inline-block",
            alignSelf: "flex-end",
            paddingLeft: "6.75rem",
            color: "rgb(155, 143, 131)",
          }}
        >
          This website is based upon work supported by the National Institute of
          Food and Agriculture, U.S. Department of Agriculture, through the
          Northeast Sustainable Agriculture Research and Education program under
          subaward number <b>GNE20-232</b>.
        </p>
      </div>
    </>
  );
}
