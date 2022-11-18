import * as d3 from "d3";
/* These helper functions are taken from https://observablehq.com/@mbostock/sars-cov-2-phylogenetic-tree*/

export function makeCluster(innerRadius) {
  return d3
    .cluster()
    .size([360, innerRadius])
    .separation((a, b) => 1);
}

// Compute the maximum cumulative length of any node in the tree.
export function maxLength(d) {
  return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
}

// Set the radius of each node by recursively summing and scaling the distance from the root.
export function setRadius(d, y0, k) {
  d.radius = (y0 += d.data.length) * k;
  if (d.children) d.children.forEach((d) => setRadius(d, y0, k));
}

export function correctNJtree(d) {
  if (d.data.length < 0) {
    d.data.length = Math.abs(d.data.length);
  }
  if (d.children) d.children.forEach((d) => correctNJtree(d));
}

export function linkVariable(d) {
  return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
}

export function linkConstant(d) {
  return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
}

export function linkExtensionVariable(d, innerRadius) {
  return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
}

export function linkExtensionConstant(d, innerRadius) {
  return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
}

export function linkStep(startAngle, startRadius, endAngle, endRadius) {
  const c0 = Math.cos((startAngle = ((startAngle - 90) / 180) * Math.PI));
  const s0 = Math.sin(startAngle);
  const c1 = Math.cos((endAngle = ((endAngle - 90) / 180) * Math.PI));
  const s1 = Math.sin(endAngle);
  return (
    "M" +
    startRadius * c0 +
    "," +
    startRadius * s0 +
    (endAngle === startAngle
      ? ""
      : "A" +
        startRadius +
        "," +
        startRadius +
        " 0 0 " +
        (endAngle > startAngle ? 1 : 0) +
        " " +
        startRadius * c1 +
        "," +
        startRadius * s1) +
    "L" +
    endRadius * c1 + // X = innerRadius * Math.cos((d.target.x = ((d.target.x - 90) / 180) * Math.PI));
    "," +
    endRadius * s1 // Y = innerRadius * Math.sin(d.target.x)
  );
}

// https://github.com/jasondavies/newick.js
export function parseNewick(a) {
  for (
    var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0;
    t < s.length;
    t++
  ) {
    var n = s[t];
    switch (n) {
      case "(":
        var c = {};
        r.branchset = [c];
        e.push(r);
        r = c;
        break;
      case ",":
        var c = {};
        e[e.length - 1].branchset.push(c);
        r = c;
        break;
      case ")":
        r = e.pop();
        break;
      case ":":
        break;
      default:
        var h = s[t - 1];
        ")" == h || "(" == h || "," == h
          ? (r.name = n)
          : ":" == h && (r.length = parseFloat(n));
    }
  }
  return r;
}

export function getSubTree(parsedNewick, childnodes) {
  //pseudocode:
  //1:find leaf node of first favorite child, get its parent.

  const search = (tree, target) => {
    if (tree.data.name === target) {
      return tree.parent;
    }
    if (tree.children) {
      for (const child of tree.children) {
        const res = search(child, target);

        if (res) {
          return res;
        }
      }
    }
  };
  if (childnodes.length == 0) return parsedNewick;
  var parent = search(parsedNewick, childnodes[0]);
  childnodes.splice(0, 1);

  //2: one by one, search for other favorite children in parent. if all found, return parent as subtree
  //3: if not found, get parent of that node.
  //4: repeat steps 2 and 3 until done.
  var foundChildren = [];
  while (childnodes.length > foundChildren.length) {
    childnodes.forEach(function (child) {
      var found = search(parent, child);

      if (typeof found !== "undefined" && !foundChildren.includes(child)) {
        foundChildren.push(child);
        //const index = childnodes.indexOf(child);
        //total++
        //childnodes.splice(index, 1);
      }
    });
    //childnodes.length > 1
    if (foundChildren.length < childnodes.length) {
      parent = parent.parent;
    }
  }

  //now need to re-root this tree at parent

  //pseudocode: 1) set parent.depth and parent.rootDist to 0, delete 'parent.parent' and 'parent.length'

  parent.depth = 0;
  parent.rootDist = 0;
  delete parent.parent;
  //recursively adjust depth and root distance for each node in tree
  const reRoot = (node) => {
    if (node.children) {
      for (var child of node.children) {
        child.depth = node.depth + 1;
        child.rootDist = node.rootDist + child.data.length;
        var res = reRoot(child);

        if (res) {
          return res;
        }
      }
    }
  };
  reRoot(parent);
  return parent;
}

export function parseTooltip(str, node, dataMap) {
  const regexp = /\$\{([^}]+)\}/g;
  var label = str;
  const array = [...str.matchAll(regexp)];
  array.forEach((capture) => {
    label = label.replace(
      capture[0],
      dataMap[node.target.data.name][capture[1]]
    );
  });
  return label;
}

export function fillNumerical(node, dataMap, ring) {
  let defaultColor = "#e0e0e0";

  if (typeof node.target.data.name === "undefined") {
    return defaultColor;
  }
  if (typeof ring.color === "undefined") {
    return defaultColor;
  }

  defaultColor =
    ring.color.default != "undefined" ? ring.color.default : "#e0e0e0";

  if (typeof ring.color.domain != "object") {
    return defaultColor;
  }

  if (
    (typeof ring.color.range != "undefined") &
    (typeof dataMap[node.target.data.name] != "undefined")
  ) {
    return d3.scaleLinear().domain(ring.color.domain).range(ring.color.range)(
      dataMap[node.target.data.name][ring.feature]
    );
  }
  if (typeof ring.color.colorScheme != "undefined") {
    return ColorBy(ring.color.colorScheme, node, dataMap, ring, defaultColor);
  }
  return defaultColor;
}

function dataMissing(ring, dataMap) {
  let defaultColor = "#e0e0e0";

  if (typeof ring.color === "undefined") {
    return defaultColor;
  }

  defaultColor =
    ring.color.default != "undefined" ? ring.color.default : "#e0e0e0";

  if (typeof ring.color.domain != "object") {
    return defaultColor;
  }

  return false;
}

//build categorical color legend based on ring.feature
export function categoricalColorGuide(ring, dataMap) {
  if (ring && ring.color && dataMap) {
    let uniqueValues = [];
    for (const a in dataMap) {
      //check if value is in uniqueValues
      if (!uniqueValues.includes(dataMap[a][ring.feature])) {
        uniqueValues.push(dataMap[a][ring.feature]);
      }
    }
    uniqueValues.sort();
    const range = ring.color.range ? ring.color.range : d3.schemeCategory10;
    const domain = ring.color.domain ? ring.color.domain : uniqueValues;
    let colorScale = d3.scaleOrdinal().domain(domain).range(range);
    let ColorGuide = { type: "catgorical" };
    uniqueValues.forEach((value) => {
      ColorGuide[value] = colorScale(value);
    });
    return ColorGuide;
  }
}

export function continuousColorGuide(ring, dataMap) {
  if (ring && ring.color && dataMap) {
    let uniqueValues = [];
    for (const a in dataMap) {
      //check if value is in uniqueValues
      if (!uniqueValues.includes(dataMap[a][ring.feature])) {
        uniqueValues.push(dataMap[a][ring.feature]);
      }
    }
    if (uniqueValues.length == 0) {
      return false;
    }
    uniqueValues.sort();

    //when all nodes share same value, we need one value in range, not an average of the two. but we
    // also want the value that is closest to the truth (i.e. if the values are zero, we dont want orange, we want white, and vice versa)
    let defaultrange = ["#ffffff", "#f25811"];
    if (uniqueValues.length == 1) {
      var indices = [0,1]
      var closest = indices.reduce(function(prev, curr) {
        return (Math.abs(curr - uniqueValues[0]) < Math.abs(prev - uniqueValues[0]) ? curr : prev);
      });
      defaultrange = [defaultrange[closest],defaultrange[closest]];
    }

    const range = ring.color.range ? ring.color.range : defaultrange;
    //get min of uniqueValues
    let min = uniqueValues[0];
    //get max of uniqueValues
    let max = uniqueValues[uniqueValues.length - 1];
    const domain = ring.color.domain ? ring.color.domain : [min, max];

    let colorScale = d3.scaleLinear().domain(domain).range(range);
    let ColorGuide = { type: "continuous" };
    uniqueValues.forEach((value) => {
      ColorGuide[value] = colorScale(value);
    });
    return ColorGuide;
  }
}

function ColorBy(colorScheme, node, dataMap, ring, defaultColor) {
  try {
    const scaledData = d3.scaleSequential().domain(ring.color.domain)(
      dataMap[node.target.data.name][ring.feature]
    );
    switch (colorScheme) {
      case "Viridis":
        return d3.interpolateViridis(scaledData);
      case "Inferno":
        return d3.interpolateInferno(scaledData);
      case "Magma":
        return d3.interpolateMagma(scaledData);
      case "Plasma":
        return d3.interpolatePlasma(scaledData);
      case "Warm":
        return d3.interpolateWarm(scaledData);
      case "Cool":
        return d3.interpolateCool(scaledData);
      case "CubeHelix":
        return d3.interpolateCubehelixDefault(scaledData);
      case "Turbo":
        return d3.interpolateTurbo(scaledData);
      case "Stoplight":
        return d3.interpolateRdYlGn(scaledData);
    }
  } catch (e) {
    return defaultColor;
  }
}

function CategoricalColorBy(colorScheme, node, dataMap, ring, defaultColor) {
  try {
    var categorical = [
      { name: "schemeAccent", n: 8 },
      { name: "schemeDark2", n: 8 },
      { name: "schemePastel2", n: 8 },
      { name: "schemeSet2", n: 8 },
      { name: "schemeSet1", n: 9 },
      { name: "schemePastel1", n: 9 },
      { name: "schemeCategory10", n: 10 },
      { name: "schemeSet3", n: 12 },
      { name: "schemePaired", n: 12 },
    ];

    if (
      typeof colorScheme === "string" &&
      categorical
        .map((scheme) => scheme.name.substring(6))
        .includes(colorScheme)
    ) {
      const name = `scheme${colorScheme}`;
      var colorScale = d3.scaleOrdinal(d3[name]);
    } else if (Array.isArray(colorScheme)) {
      var colorScale = d3.scaleOrdinal(colorScheme);
    } else {
      return defaultColor;
    }
    if (!ring.color.domain) {
      var allFeatures = uniqueFeatures(dataMap, ring.feature).sort();

      colorScale.domain(allFeatures);
    } else {
      colorScale.domain(ring.color.domain);
      return ring.color.domain.includes(
        dataMap[node.target.data.name][ring.feature]
      )
        ? colorScale(dataMap[node.target.data.name][ring.feature])
        : defaultColor;
    }
    return colorScale(dataMap[node.target.data.name][ring.feature]);
  } catch (e) {
    return defaultColor;
  }
}

function uniqueFeatures(dataMap, feature) {
  const keys = Object.keys(dataMap);
  var features = [];
  keys.forEach((key) => {
    if (!features.includes(dataMap[key][feature])) {
      features.push(dataMap[key][feature]);
    }
  });
  return features;
}

export function getNodeHeight(dataMap, ring, name) {
  var domain = ring.height.domain
    ? ring.height.domain
    : dataMap
    ? d3.extent(Object.values(dataMap), (row) => row[ring.feature])
    : [0, 1];
  var range = ring.height.range ? ring.height.range : [0, 1];
  if (ring.type === "bar") {
    return dataMap[name]
      ? d3.scaleLinear().domain(domain).range(range)(
          dataMap[name][ring.feature]
        )
      : 1;
  } else if (ring.type === "heatmap" || ring.type === "categorical") {
    return dataMap[name] ? ring.height : 1;
  }
}
