import dagre from "dagre";
import { Node, Edge } from "reactflow";
import { LayoutResult, LayoutOrientation } from "../types/layoutStrategy";

export class DagreLayoutStrategy {
  private readonly NODE_WIDTH = 280;
  private readonly NODE_HEIGHT = 120;

  applyLayout(nodes: Node[], edges: Edge[], orientation: LayoutOrientation = 'vertical'): LayoutResult {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure the layout based on orientation
    if (orientation === 'horizontal') {
      dagreGraph.setGraph({
        rankdir: "LR", // Left to Right (horizontal)
        nodesep: 50,   // Horizontal spacing between nodes at same level
        ranksep: 150,  // Spacing between levels (now vertical since we're horizontal)
        marginx: 50,   // Margin around the graph
        marginy: 50,
      });
    } else {
      dagreGraph.setGraph({
        rankdir: "TB", // Top to Bottom (vertical)
        nodesep: 60,   // Horizontal spacing between nodes
        ranksep: 100,  // Vertical spacing between ranks
        marginx: 50,   // Margin around the graph
        marginy: 50,
      });
    }

    // Add nodes to dagre graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: this.NODE_WIDTH,
        height: this.NODE_HEIGHT,
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
          x: nodeWithPosition.x - this.NODE_WIDTH / 2,
          y: nodeWithPosition.y - this.NODE_HEIGHT / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }
}
