import React, { ReactNode, useEffect, useState } from "react";
import { SigmaContainer, useSigma, useLoadGraph, SearchControl, ControlsContainer, ForceAtlasControl, useSetSettings} from "react-sigma-v2";
import Graph from "graphology";
import circularLayout from "graphology-layout/circular";
import Graphml from "graphology-graphml";
import Sigma from "sigma";

import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';

import "react-sigma-v2/lib/react-sigma-v2.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import { hierarchicalLayout } from "@/hierarchical";
import { collapse } from "@/resolution";

import fs from "fs";
import path from "path";

import glob from "glob";

/*const Loading = () => {
  const [show, setShow] = useState("sm-down");
  const registerEvents = useRegisterEvents();

  registerEvents({
    // @ts-ignore
    cameraUpdated: event => setShow(false),
  });
  // onHide={() => setShow(false)}

  // @ts-ignore
  return <Modal show={show} fullscreen={true}>
    <Spinner animation="border" />
  </Modal>;
}*/

export const TestGraph = (options) => {
  const sigma = useSigma();
  sigma.setSetting("hideEdgesOnMove", true);
  sigma.setSetting("hideLabelsOnMove", true);
  sigma.setSetting("renderLabels", false);

  const loadGraph = useLoadGraph();
  if (options.path === null) {
    //const sigma = useSigma();
    const graph = new Graph();
    graph.addNode("Example", { label: "Example", x: 0, y: 1, color: "#00F", size: 5 });
    graph.addNode("Graph", { label: "Graph", x: 0, y: 0, color: "#FF0", size: 10 });
    graph.addEdge("Example", "Graph", { color: "#CCC", size: 1 });
    loadGraph(graph);
    return null;
  }
  console.log("Loading File: ", options.path);
  fetch(options.path)
    .then((res) => res.text())
    .then((gml) => {
      // Parse GEXF string:
      const graph = collapse(Graphml.parse(Graph, gml), {});
      graph.updateEachNodeAttributes( (node, attrs) => {
        attrs["label"] = node;
        return attrs;
      });
      hierarchicalLayout(graph, options);
      console.log(graph);
      loadGraph(graph);
      console.log("Done loading File: ", options.path);
    });

  return null;
}

export default function App() {
  const [xscale, setXScale] = useState(100.);
  const [yscale, setYScale] = useState(1.);
  const [height, setHeight] = useState("blueScore");
  const [orderLayers, setOrderLayers] = useState(false);
  const [graphFile, setGraphFile] = useState(null);

  // Get file list
  const filesArray = fs.readdirSync(path.join(__dirname, 'data'))
                       .filter((name) => name.endsWith("graphml"));
  // Create navigation dropdown for the file list
  const files = filesArray.map(
      (name, idx) =>
          <NavDropdown.Item onClick={() => setGraphFile("./data/" + name)} key={idx}>{name}</NavDropdown.Item>
  );

  //
  return <div>
  <Navbar variant="dark" bg="dark" expand="lg">
    <Container fluid>
      <Navbar.Brand href="#home">Kaspa DAG Explorer</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-dark" />
      <Navbar.Collapse id="navbar-dark">
        <Nav>
          <NavDropdown id="nav-dropdown-dark" title="Height By" menuVariant="dark">
            <NavDropdown.Item onClick={() => setHeight("blueScore")}>Blue Score</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setHeight("daaScore")}>DAA Score</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setHeight("timeInSeconds")}>Timestamp</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown id="nav-dropdown-dark" title="Graph File"  menuVariant="dark">
            {files}
          </NavDropdown>
          <NavDropdown id="nav-dropdown-dark" title="XScale" menuVariant="dark">
            <NavDropdown.Item onClick={() => setXScale(1.)}>1</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setXScale(10.)}>10</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setXScale(100.)}>100</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setXScale(1000.)}>1000</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown id="nav-dropdown-dark" title="YScale" menuVariant="dark">
            <NavDropdown.Item onClick={() => setYScale(1.)}>1</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setYScale(10.)}>10</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setYScale(100.)}>100</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setYScale(1000.)}>1000</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown id="nav-dropdown-dark" title="OrderLayers" menuVariant="dark">
            <NavDropdown.Item onClick={() => setOrderLayers(true)}>Yes</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setOrderLayers(false)}>No</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  <SigmaContainer style={{ height: "800px", width: "1900px" }}>
  <TestGraph height={height} path={graphFile} xscale={xscale} yscale={yscale} orderLayers={orderLayers}/>
  <ControlsContainer position={"top-left"}>
    <SearchControl />
    {/*<ForceAtlasControl/>*/}
  </ControlsContainer>
  </SigmaContainer>
  </div>;
}
