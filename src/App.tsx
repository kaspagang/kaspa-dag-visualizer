import React, { ReactNode, useEffect, useState } from "react";
import { SigmaContainer, useSigma, useLoadGraph, SearchControl, ControlsContainer, ForceAtlasControl} from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import Graph from "graphology";
import circularLayout from "graphology-layout/circular";
import Graphml from "graphology-graphml";
import Sigma from "sigma";

import hierarchialLayout from "./hierarchical";
//import erdosRenyi from "graphology-generators/random/erdos-renyi";

export const TestGraph = () => {
  const loadGraph = useLoadGraph();
  fetch("./data/network_start.graphml")
    .then((res) => res.text())
    .then((gml) => {
      // Parse GEXF string:
      const graph = Graphml.parse(Graph, gml);
      graph.updateEachNodeAttributes( (node, attrs) => {
        attrs["label"] = node;
        return attrs;
      });
      hierarchialLayout(graph, {});
      loadGraph(graph);
    });

  return null;
}

export default function App() {


  return <div>
  <SigmaContainer style={{ height: "800px", width: "1900px" }}>
  <TestGraph/>
  <ControlsContainer position={"top-right"}>
    <SearchControl />
    <ForceAtlasControl/>
  </ControlsContainer>
  </SigmaContainer>
  </div>;
}
