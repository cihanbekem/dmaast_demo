import Dagre from "@dagrejs/dagre";

export function getLayoutedElements(nodes, edges, direction = "TB") {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    nodesep: 40,
    ranksep: 80,
    edgesep: 20,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.data?.width || 280,
      height: node.data?.height || 72,
    });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const np = g.node(node.id);
    const w = node.data?.width || 280;
    const h = node.data?.height || 72;
    return {
      ...node,
      position: { x: np.x - w / 2, y: np.y - h / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}
