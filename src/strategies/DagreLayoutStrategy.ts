import dagre from "dagre";
import { Node, Edge } from "reactflow";
import { LayoutResult, LayoutOrientation } from "../types/layoutStrategy";
import { LAYOUT_CONFIG } from "../layout/LayoutConstants";

export class DagreLayoutStrategy {

  applyLayout(nodes: Node[], edges: Edge[], orientation: LayoutOrientation = 'vertical'): LayoutResult {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure the layout based on orientation
    if (orientation === 'horizontal') {
      dagreGraph.setGraph({
        rankdir: LAYOUT_CONFIG.DAGRE.HORIZONTAL.RANKDIR,
        nodesep: LAYOUT_CONFIG.DAGRE.HORIZONTAL.NODESEP,
        ranksep: LAYOUT_CONFIG.DAGRE.HORIZONTAL.RANKSEP,
        marginx: LAYOUT_CONFIG.MARGINS.X,
        marginy: LAYOUT_CONFIG.MARGINS.Y,
      });
    } else {
      dagreGraph.setGraph({
        rankdir: LAYOUT_CONFIG.DAGRE.VERTICAL.RANKDIR,
        nodesep: LAYOUT_CONFIG.DAGRE.VERTICAL.NODESEP,
        ranksep: LAYOUT_CONFIG.DAGRE.VERTICAL.RANKSEP,
        marginx: LAYOUT_CONFIG.MARGINS.X,
        marginy: LAYOUT_CONFIG.MARGINS.Y,
      });
    }

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: LAYOUT_CONFIG.NODE.WIDTH,
        height: LAYOUT_CONFIG.NODE.HEIGHT,
      });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // Apply the calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - LAYOUT_CONFIG.NODE.WIDTH / 2,
          y: nodeWithPosition.y - LAYOUT_CONFIG.NODE.HEIGHT / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }
}
