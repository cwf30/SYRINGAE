import { Menu, Container, Dropdown, Icon, Button } from "semantic-ui-react";
import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";

export function LegendMenu({ legends, setLegends, updateViz }) {
  const [activeItem, setActiveItem] = useState(null);
  const [color, setColor] = useState("#000000");
  //get the first legend as the default active legend
  useEffect(() => {
    if (legends && !activeItem) {
      setActiveItem(Object.keys(legends)[0]);
    }
  }, [legends]);

  function handleColorChange(c, activeItem, group) {
    setColor(c.hex);
    let tmpLegends = legends;
    tmpLegends[activeItem][group] = c.hex;
    setLegends(tmpLegends);
  }

  function getLegendMenu() {
    let a = [];
    for (const legend in legends) {
      a.push(
        <Menu.Item
          key={"legend" + a.length}
          as="a"
          active={activeItem == legend}
          onClick={(e, d) => {
            setActiveItem(d.children);
          }}
          style={{ color: "rgb(68, 48, 9)" }}
        >
          {legend}
        </Menu.Item>
      );
    }
    return a;
  }

  function getLegend() {
    let a = [];
    if (activeItem) {
      for (const group in legends[activeItem]) {
        if (group != "type") {
          a.push(
            <Container key={"legend.container" + a.length}>
              <div key={"legend.div" + a.length} style={{ display: "flex" }}>
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    marginLeft: "5%",
                    marginTop: "5%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon
                    name="circle"
                    style={{ color: legends[activeItem][group] }}
                  />
                  <p
                    style={{
                      color: "rgb(68, 48, 9)",
                      flexGrow: 1,
                      textOverflow: "ellipsis",
                    }}
                  >
                    {group}
                  </p>
                </div>

                <Dropdown
                  key={"legend.item" + a.length}
                  as="a"
                  style={{ color: "rgb(68, 48, 9)", flexGrow: 1 }}
                  onClick={function (e) {}}
                  pointing="left"
                  className="link item"
                  text={a.length == 0 ? "Change Color" : ""}
                >
                  <Dropdown.Menu onClick={(e) => e.stopPropagation()}>
                    <SketchPicker
                      color={legends[activeItem][group]}
                      onChange={(c) => handleColorChange(c, activeItem, group)}
                    />
                    <Button
                      className="explore"
                      attached="bottom"
                      onClick={() => {
                        if (updateViz) {console.log(legends); updateViz({ ...legends })};
                      }}
                    >
                      Update all changes
                    </Button>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Container>
          );
        }
      }
      return a;
    }
  }

  return (
    <>
      <Menu vertical style={{ marginLeft: "6%", backgroundColor: "#fff" }}>
        <Menu.Item style={{ color: "rgb(68, 48, 9)" }}>
          <b>Annotation legends:</b>
        </Menu.Item>
        {getLegendMenu()}
      </Menu>
      <Menu vertical style={{ marginLeft: "6%", backgroundColor: "#f4f7f2" }}>
        {getLegend()}
      </Menu>
    </>
  );
}
