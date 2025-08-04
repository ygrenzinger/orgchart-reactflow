import { Node, Edge, MarkerType } from "reactflow";
import { OrgNode, ExpandedState } from "../utils/orgChartLayout";

export class BaseLayoutProcessor {
  private readonly NODE_WIDTH = 280;
  private readonly NODE_HEIGHT = 120;

  collectVisibleNodes(
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

  createNodesAndEdges(
    visibleNodes: OrgNode[],
    expandedState: ExpandedState
  ): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
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
        position: { x: 0, y: 0 }, // Will be set by layout strategy
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

    return { nodes, edges };
  }

  getNodeDimensions() {
    return {
      width: this.NODE_WIDTH,
      height: this.NODE_HEIGHT,
    };
  }
}