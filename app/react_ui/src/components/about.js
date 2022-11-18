import { rgb } from "d3";
import React, { useState, useEffect } from "react";
import {
  Grid,
  Segment,
  Table,
  Dropdown,
  Checkbox,
  Form,
  Accordion,
  Icon,
  Button,
} from "semantic-ui-react";
import { Tree } from "./tree/Tree";

export function About({
}) {
  useEffect(() => {
    document.title = "Syringae - about"
 }, []);


  return (
    <p>About!</p>
  );
}
