import resolveDefaults from 'graphology-utils/defaults';
import isGraph from 'graphology-utils/is-graph';

var DEFAULTS = {
  "height": "blueScore",
  "yscale": 1.,
  "xscale": 1.,
  "orderLayers": false
};

function* permute(permutation) {
  var length = permutation.length,
      c = Array(length).fill(0),
      i = 1, k, p;

  yield permutation.slice();
  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      yield permutation.slice();
    } else {
      c[i] = 0;
      ++i;
    }
  }
}


function numCrossings(graph, nodes){
  let crossings = 0;
  for(let i=0; i<nodes.length; i++){
    for(let j=0; j<nodes.length; j++){
      for (let v of graph.inNeighbors(nodes[i])){
        for (let u of graph.inNeighbors(nodes[j])){
          crossings +=  Number(v["x"] > u["x"]);
        }
      }
    }
  }
  return crossings;
}

export default function hierarchialLayout(graph, options) {
  if (!isGraph(graph))
  throw new Error(
    'graphology-layout/random: the given graph is not a valid graphology instance.'
  );

  options = resolveDefaults(options, DEFAULTS);

  const acc = graph.reduceNodes((acc, node, attrs) => {
    // Add node to level
    if (attrs[options.height] !== undefined || attrs[options.height] !== null){
      if (!(attrs[options.height] in acc["levels"])) {
        acc["levels"][attrs[options.height]] = []
      }
      acc["levels"][attrs[options.height]].push(node)
    }
    // Get Minimum
    if (acc["min"] === null || attrs[options.height] < acc["min"]) {
      acc["min"] = attrs[options.height];
    }
    // Get Maximum
    if (acc["max"] === null || attrs[options.height] > acc["max"]) {
      acc["max"] = attrs[options.height];
    }

    // Get width
    if (!(attrs[options.height] in acc["widths"])) {
      acc["widths"][attrs[options.height]] = 0;
    }
    acc["widths"][attrs[options.height]] = acc["widths"][attrs[options.height]] + 1;
    return acc;
  }, { "min": null, "max": null, "widths": {}, "levels": {}})

  if (options.orderLayers) {
    // @ts-ignore
    let hadConflicts = true;
    while (hadConflicts) {
      console.log("Running OrderLayers");
      hadConflicts = false;
      acc["levels"] = Object.fromEntries(
          Object.entries(acc["levels"]).map(([k, level]) => {
            let bestProposal = level;
            let bestCost = numCrossings(graph, bestProposal);
            for (let proposal of permute(level)) {
              let cost = numCrossings(graph, proposal);
                if (cost < bestCost) {
                hadConflicts = true;
                bestCost = cost;
                bestProposal = level;
              }
            }
            return [k, bestProposal];
          })
      );
      console.log("Done!");
    }
  }

  graph.updateEachNodeAttributes( (node, attrs) => {
    attrs["y"] = (attrs[options.height] - acc["min"])*options.yscale;

    let length = acc["levels"][attrs[options.height]].length;
    let idx = acc["levels"][attrs[options.height]].indexOf(node);
    attrs["x"] = (idx - (length+1)/2)*options.xscale;

    return attrs;
  });
}
