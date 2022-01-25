import resolveDefaults from 'graphology-utils/defaults';
import subgraph from 'graphology-operators/subgraph';
import Graph from "graphology";
import isGraph from "graphology-utils/is-graph";
import {connectedComponents, forEachConnectedComponent} from 'graphology-components';

const DEFAULTS = {
    "height": "blueScore",
    "groupHeight": 3600,
};

export function collapse(graph, options) {
    if (!isGraph(graph))
        throw new Error(
            'graphology-layout/random: the given graph is not a valid graphology instance.'
        );

    options = resolveDefaults(options, DEFAULTS);
    console.log(options)

    let nodesGroups = graph.reduceNodes((acc, node, attrs) => {
        if (options.height in attrs) {
            const group = Math.round(attrs[options.height] / options.groupHeight);
            if (!(group in acc["groups"])) acc["groups"][group] = [];
            acc["groups"][group].push(node);
            //acc["mapping"][node] = group;
        }
        return acc;
    }, {"groups": {}});

    let collapsedNodes = [];
    let nodeToCollapsed = {};
    for (let group of Object.keys(nodesGroups["groups"])){
        const nodes = nodesGroups["groups"][group];
        const sgraph = subgraph(graph, nodes);
                connectedComponents(sgraph).forEach((component, index) => {
            const collapsedNode = "" + group + "_" + index;
            component.forEach((node) => nodeToCollapsed[node] = collapsedNode);
            let attrs = {"nodes": component};
            attrs[options.height]= group;
            collapsedNodes.push([collapsedNode, attrs])
            index++;
        });
    }

    let collapsedEdges =  Object.values(graph.reduceEdges( (acc : Set<[string, string]>, edge, atts, source, target, sourceAttrs, targetAttrs, undirected) => {
        if (source in nodeToCollapsed && target in nodeToCollapsed) {
            const collapsedSource = nodeToCollapsed[source];
            const collapsedTarget = nodeToCollapsed[target]
            if (collapsedSource != collapsedTarget) acc[collapsedSource + "_" + collapsedTarget] = [collapsedSource, collapsedTarget];
        }
        return acc;
    }, {}));
    console.log(collapsedEdges);

    let collapsedGraph = new Graph();
    for (let [collapsedNode, attr] of collapsedNodes){
        collapsedGraph.addNode(collapsedNode, attr);
    }
    // @ts-ignore
    for (let [collapsedSource, collapsedTarget] of collapsedEdges) {
        collapsedGraph.addDirectedEdge(collapsedSource, collapsedTarget);
    }
    return collapsedGraph;
}