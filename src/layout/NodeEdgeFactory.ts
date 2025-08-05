import { Node, Edge, MarkerType } from "reactflow";
import { OrgTree } from "../domain/OrgTreeBuilder";
import { ExpandedState } from "../domain/VisibilityCalculator";

export class NodeEdgeFactory {
  createNodes(visibleNodes: OrgTree[], expandedState: ExpandedState): Node[] {
    return visibleNodes.map((node) => {
      const isExpanded = expandedState[node.employee.id] ?? false;
      const hasChildren = node.children.length > 0;

      return {
        id: node.employee.id.toString(),
        type: "employee",
        position: { x: 0, y: 0 }, // Will be set by layout strategy
        data: {
          employee: node.employee,
          isExpanded,
          hasChildren,
          onToggleExpand: () => {}, // Will be set in the controller
        },
      };
    });
  }

  createEdges(visibleNodes: OrgTree[], expandedState: ExpandedState): Edge[] {
    const edges: Edge[] = [];
    const visibleNodesMap = new Map(
      visibleNodes.map((node) => [node.employee.id, node])
    );

    visibleNodes.forEach((node) => {
      const isExpanded = expandedState[node.employee.id] ?? false;

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

    return edges;
  }
}