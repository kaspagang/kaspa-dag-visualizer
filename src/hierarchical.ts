import resolveDefaults from 'graphology-utils/defaults';
import isGraph from 'graphology-utils/is-graph';

var DEFAULTS = {
  "height": "blueScore",
  "yscale": 10.,
  "xscale": 100.,
};

export default function hierarchialLayout(graph, options) {
  if (!isGraph(graph))
  throw new Error(
    'graphology-layout/random: the given graph is not a valid graphology instance.'
  );

  options = resolveDefaults(options, DEFAULTS);

  const acc = graph.reduceNodes((acc, node, attrs) => {
    if (acc[0] === null || attrs[options.height] < acc[0]) {
      acc[0] = attrs[options.height];
    }
    if (!(attrs[options.height] in acc[1])) {
      acc[1][attrs[options.height]] = 0;
    }
    acc[1][attrs[options.height]] = acc[1][attrs[options.height]] + 1;
    return acc;
  }, [null, {}])

  graph.updateEachNodeAttributes( (node, attrs) => {
    attrs["x"] = (acc[1][attrs[options.height]]--)*options.xscale;
    attrs["y"] = (attrs[options.height] - acc[0])*options.yscale;
    return attrs;
  });
}
