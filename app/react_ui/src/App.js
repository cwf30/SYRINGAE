import React, { useEffect, useState } from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import { NavBar } from "./components/NavBar";
import { Home } from "./components/home";
import { Isolate } from "./components/isolate";
import { Gene } from "./components/gene";
import { Identify } from "./components/identify";
import { Explore } from "./components/explore";
import { FeedbackForm } from "./components/feedbackForm";
import { About } from "./components/about";
import { Modal, Image, Header, Button } from "semantic-ui-react";
import { map } from "d3-collection";
import { Container } from "@nivo/core";

function App() {
  const [selectedQuery, setSelectedQuery] = useState([
    { value: "Upload", text: "test Amplicons" },
  ]); //selected from already uploaded query sequences

  const [metadata, setMetadata] = useState(false);
  const [treemeta, setTreeMeta] = useState(false);
  const [currentPage, setCurrentPage] = useState("search");
  const [SearchInput, setSearchInput] = useState("");

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    //called only on first render; loads metadata
    async function fetchMetaData() {
      const response = await fetch("/api/metadata");
      response.json().then((json) => {
        setTreeMeta(json.data);
        var mappedData = map(json.data, (d) => d.name);
        setMetadata(mappedData);
      });
    }

    fetchMetaData();
    document.body.style.zoom = "90%";
  }, []);

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  return (
    <div>
      <Container
        className="App"
        style={{ background: "#f4f7f2", height: "150%" }}
      >
        <Modal
          size={"large"}
          onClose={() => setFeedbackOpen(false)}
          onOpen={() => setFeedbackOpen(true)}
          open={feedbackOpen}
          trigger={
            <div
              style={{
                cursor: "pointer",
                height: "40px",
                width: "100%",
                backgroundColor: "#ffa319",
                color: "#242424",
                fontFamily: "sans-serif",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {"Help improve syringae.org...  "}<b> Report issues and bugs here!</b>
            </div>
          }
        >
          <Modal.Header>Submit an issue</Modal.Header>
          <Modal.Content image>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FeedbackForm page={currentPage} />
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={() => setFeedbackOpen(false)}>
              Close form
            </Button>
          </Modal.Actions>
        </Modal>

        <div style={{ marginBottom: "25px" }}>
          <NavBar setCurrentPage={setCurrentPage} currentPage={currentPage} />
        </div>

        {currentPage === "search" ? (
          <Home
            setCurrentPage={setCurrentPage}
            setSearchInput={setSearchInput}
          />
        ) : (
          <></>
        )}
        {currentPage === "isolate" ? (
          <Isolate
            setCurrentPage={setCurrentPage}
            SearchInput={SearchInput}
            setSearchInput={setSearchInput}
          />
        ) : (
          <></>
        )}
        {currentPage === "protein" ? (
          <Gene
            setCurrentPage={setCurrentPage}
            SearchInput={SearchInput}
            setSearchInput={setSearchInput}
          />
        ) : (
          <></>
        )}
        {currentPage === "identify" ? (
          <Identify
            setMetadata={setMetadata}
            metadata={metadata}
            treemeta={treemeta}
          />
        ) : (
          <></>
        )}
        {currentPage === "explore" ? (
          <Explore
            metadata={metadata}
            setMetadata={setMetadata}
            treemeta={treemeta}
          />
        ) : (
          <></>
        )}
        {currentPage === "about" ? <About /> : <></>}
      </Container>
    </div>
  );
}

export default App;
