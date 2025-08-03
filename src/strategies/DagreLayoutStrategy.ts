import dagre from "dagre";
import { Node, Edge, MarkerType } from "reactflow";
import { LayoutStrategy, LayoutResult } from "../types/layoutStrategy";
import { OrgNode, ExpandedState } from "../utils/orgChartLayout";

export class DagreLayoutStrategy implements LayoutStrategy {
  name = "Dagre Tree Layout";

  private readonly NODE_WIDTH = 280;
  private readonly NODE_HEIGHT = 120;

  calculateLayout(
    orgTree: OrgNode,
    expandedState: ExpandedState
  ): LayoutResult {
    if (!orgTree) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // First, collect all visible nodes (nodes whose parents are expanded)
    const visibleNodesList = this.collectVisibleNodes(orgTree, expandedState);

    // Create nodes and edges
    this.createNodesAndEdges(visibleNodesList, expandedState, nodes, edges);

    // Apply dagre layout
    return this.applyDagreLayout(nodes, edges);
  }

  private collectVisibleNodes(
    node: OrgNode,
    expandedState: ExpandedState,
    isVisible: boolean = true
  ): OrgNode[] {
    const visibleNodes: OrgNode[] = [];

    if (isVisible) {
      visibleNodes.push(node);
    }

    // Only show children if this node is expanded and visible
    const isExpanded = expandedState[node.employee.id] ?? false;
    if (isVisible && isExpanded) {
      node.children.forEach((child) => {
        visibleNodes.push(
          ...this.collectVisibleNodes(child, expandedState, true)
        );
      });
    }

    return visibleNodes;
  }

  private createNodesAndEdges(
    visibleNodes: OrgNode[],
    expandedState: ExpandedState,
    nodes: Node[],
    edges: Edge[]
  ) {
    const visibleNodesMap = new Map(
      visibleNodes.map((node) => [node.employee.id, node])
    );

    visibleNodes.forEach((node) => {
      const isExpanded = expandedState[node.employee.id] ?? false;
      const hasChildren = node.children.length > 0;

      // Create node
      nodes.push({
        id: node.employee.id.toString(),
        type: "employee",
        position: { x: 0, y: 0 }, // Will be set by dagre
        data: {
          employee: node.employee,
          isExpanded,
          hasChildren,
          onToggleExpand: () => {}, // Will be set in the main component
        },
      });

      // Create edges to visible children
      if (isExpanded) {
        node.children.forEach((child) => {
          if (visibleNodesMap.has(child.employee.id)) {
            edges.push({
              id: `${node.employee.id}-${child.employee.id}`,
              source: node.employee.id.toString(),
              target: child.employee.id.toString(),
              type: "smoothstep",
              style: { stroke: "#94a3b8", strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#94a3b8",
              },
            });
          }
        });
      }
    });
  }

  private applyDagreLayout(nodes: Node[], edges: Edge[]): LayoutResult {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure the layout
    dagreGraph.setGraph({
      rankdir: "TB", // Top to Bottom
      nodesep: 60, // Horizontal spacing between nodes
      ranksep: 100, // Vertical spacing between ranks
      marginx: 50, // Margin around the graph
      marginy: 50,
    });

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
