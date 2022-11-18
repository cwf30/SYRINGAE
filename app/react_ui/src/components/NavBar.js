import React from "react";
import DropdownQueries from "./Dropdown";
import syringaeLogo from ".././assets/logo.png";
import {
  Button,
  Radio,
  Modal,
  Header,
  Form,
  TextArea,
  Dimmer,
  Loader,
  Grid,
} from "semantic-ui-react";

export function NavBar({ setCurrentPage, currentPage }) {
  function handleClick(s) {
    setCurrentPage(s);
  }
  let searchClass =
    currentPage === "search" ? "menu_text_selected" : "menu_text";
  let identifyClass =
    currentPage === "identify" ? "menu_text_selected" : "menu_text";
  let exploreClass =
    currentPage === "explore" ? "menu_text_selected" : "menu_text";
  let aboutClass = currentPage === "about" ? "menu_text_selected" : "menu_text";
  return (
    <>
      <div
        style={{
          textAlign: "center",
          marginTop: "10px",
          marginBottom: "-25px",
        }}
      >
        <p className={searchClass} onClick={() => handleClick("search")}>
          SEARCH &emsp;
        </p>
        <p className={identifyClass} onClick={() => handleClick("identify")}>
          IDENTIFY &emsp;
        </p>
        <p className={exploreClass} onClick={() => handleClick("explore")}>
          EXPLORE &emsp;
        </p>
        <p className={aboutClass} onClick={() => handleClick("about")}>
          ABOUT
        </p>
      </div>

      <div style={{ height: "50px", marginLeft: "25px" }}>
        {currentPage === "search" ? (
          <></>
        ) : (
          <img className="corner_logo" src={syringaeLogo} alt="Logo" height="50px" margin="auto" onClick={() => handleClick("search")}/>
        )}
      </div>
    </>
  );
}
