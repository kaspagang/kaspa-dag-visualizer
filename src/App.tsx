import React, { ReactNode, useEffect, useState } from "react";
import { SigmaContainer, useSigma, useLoadGraph, SearchControl, ControlsContainer, ForceAtlasControl, useRegisterEvents} from "react-sigma-v2";
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

import hierarchialLayout from "./hierarchical";

import fs from "fs";
import path from "path";

import glob from "glob";

//import erdosRenyi from "graphology-generators/random/erdos-renyi";

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
  const loadGraph = useLoadGraph();
  if (options.path === null) {
    const sigma = useSigma();
    const graph = sigma.getGraph();
    graph.addNode("Jessica", { label: "Jessica", x: 1, y: 1, color: "#FF0", size: 10 });
    graph.addNode("Truman", { label: "Truman", x: 0, y: 0, color: "#00F", size: 5 });
    graph.addEdge("Jessica", "Truman", { color: "#CCC", size: 1 });
    return null;
  }
  console.log("Loading File: ", options.path);
  fetch(options.path)
    .then((res) => res.text())
    .then((gml) => {
      // Parse GEXF string:
      const graph = Graphml.parse(Graph, gml);
      graph.updateEachNodeAttributes( (node, attrs) => {
        attrs["label"] = node;
        return attrs;
      });
      console.log(options);
      hierarchialLayout(graph, {"height": options.height});
      loadGraph(graph);
      console.log("Done all!")
    });

  return null;
}

export default function App() {
  const [height, setHeight] = useState("blueScore");
  const [graphFile, setGraphFile] = useState(null);
  console.log(height);

  const filesArray = fs.readdirSync(path.join(__dirname, 'data'))
                       .filter((name) => name.endsWith("graphml"));
  const files = filesArray.map(
      (name, idx) =>
          <NavDropdown.Item onClick={() => setGraphFile("./data/" + name)} key={idx}>{name}</NavDropdown.Item>
  );
  console.log(files);

  //
  return <div>
  <Navbar variant="dark" bg="dark" expand="lg">
    <Container fluid>
      <Navbar.Brand href="#home">Kaspa DAG Explorer</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-dark" />
      <Navbar.Collapse id="navbar-dark">
        <Nav>
          <NavDropdown id="nav-dropdown-dark" title="Height By" menuVariant="dark"
          >
            <NavDropdown.Item onClick={() => setHeight("blueScore")}>Blue Score</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setHeight("daaScore")}>DAA Score</NavDropdown.Item>
            <NavDropdown.Item onClick={() => setHeight("timeInSeconds")}>Timestamp</NavDropdown.Item>
          </NavDropdown>
          <NavDropdown id="nav-dropdown-dark" title="Graph File"  menuVariant="dark">
            {files}
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
  <SigmaContainer style={{ height: "800px", width: "1900px" }}>
  <TestGraph height={height} path={graphFile}  />
  <ControlsContainer position={"top-left"}>
    <SearchControl />
    {/*<ForceAtlasControl/>*/}
  </ControlsContainer>
  </SigmaContainer>
  </div>;
}
