import { Node, Edge, MarkerType } from 'reactflow';
import { LayoutStrategy, LayoutResult } from '../types/layoutStrategy';
import { OrgNode, ExpandedState } from '../utils/orgChartLayout';

interface TreeLayout {
  x: number;
  y: number;
  width: number;
}

export class CustomLayoutStrategy implements LayoutStrategy {
  name = 'Custom Tree Layout';

  private readonly NODE_WIDTH = 280;
  private readonly NODE_HEIGHT = 120;
  private readonly HORIZONTAL_SPACING = 60;
  private readonly VERTICAL_SPACING = 100;

  calculateLayout(orgTree: OrgNode, expandedState: ExpandedState): LayoutResult {
    if (!orgTree) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // First, collect all visible nodes (nodes whose parents are expanded)
    const visibleNodesList = this.collectVisibleNodes(orgTree, expandedState);

    // Create a map for quick lookup
    const visibleNodesMap = new Map(visibleNodesList.map(node => [node.employee.id, node]));

    // Calculate layout and position nodes
    const rootLayout = this.calculateLayoutForVisible(orgTree, visibleNodesList, expandedState);
    this.positionVisibleNodes(orgTree, 0, 0, rootLayout, expandedState, visibleNodesMap, nodes, edges);

    return { nodes, edges };
  }

  private collectVisibleNodes(node: OrgNode, expandedState: ExpandedState, isVisible: boolean = true): OrgNode[] {
    const visibleNodes: OrgNode[] = [];
    
    if (isVisible) {
      visibleNodes.push(node);
    }
    
    // Only show children if this node is expanded and visible
    const isExpanded = expandedState[node.employee.id] ?? false;
    if (isVisible && isExpanded) {
      // Only show immediate children (first level)
      node.children.forEach(child => {
        visibleNodes.push(...this.collectVisibleNodes(child, expandedState, true));
      });
    }
    
    return visibleNodes;
  }

  private calculateLayoutForVisible(node: OrgNode, visibleNodes: OrgNode[], expandedState: ExpandedState): TreeLayout {
    const isExpanded = expandedState[node.employee.id] ?? false;
    const hasChildren = node.children.length > 0;
    
    // Only consider immediate children that are visible
    const visibleChildren = node.children.filter(child => 
      visibleNodes.some(vNode => vNode.employee.id === child.employee.id)
    );

    if (!isExpanded || !hasChildren || visibleChildren.length === 0) {
      return { x: 0, y: 0, width: this.NODE_WIDTH };
    }

    // Calculate width needed for visible children only
    const childrenWidth = visibleChildren.length * this.NODE_WIDTH + (visibleChildren.length - 1) * this.HORIZONTAL_SPACING;

    return {
      x: 0,
      y: 0,
      width: Math.max(this.NODE_WIDTH, childrenWidth)
    };
  }

  private positionVisibleNodes(
    node: OrgNode, 
    parentX: number, 
    parentY: number, 
    layout: TreeLayout,
    expandedState: ExpandedState,
    visibleNodesMap: Map<number, OrgNode>,
    nodes: Node[],
    edges: Edge[]
  ) {
    const isExpanded = expandedState[node.employee.id] ?? false;
    const hasChildren = node.children.length > 0;

    // Position this node at the center of its allocated space
    const nodeX = parentX + (layout.width - this.NODE_WIDTH) / 2;
    const nodeY = parentY;

    nodes.push({
      id: node.employee.id.toString(),
      type: 'employee',
      position: { x: nodeX, y: nodeY },
      data: {
        employee: node.employee,
        isExpanded,
        hasChildren,
        onToggleExpand: () => {} // Will be set in the main component
      }
    });

    // Only show immediate children if expanded
    const visibleChildren = node.children.filter(child => 
      visibleNodesMap.has(child.employee.id)
    );

    if (!isExpanded || !hasChildren || visibleChildren.length === 0) {
      return;
    }

    // Calculate positions for visible children
    const childrenWidth = visibleChildren.length * this.NODE_WIDTH + (visibleChildren.length - 1) * this.HORIZONTAL_SPACING;
    let currentX = parentX + (layout.width - childrenWidth) / 2;
    const childY = parentY + this.NODE_HEIGHT + this.VERTICAL_SPACING;

    visibleChildren.forEach((child) => {
      // Create edge
      edges.push({
        id: `${node.employee.id}-${child.employee.id}`,
        source: node.employee.id.toString(),
        target: child.employee.id.toString(),
        type: 'smoothstep',
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94a3b8',
        }
      });

      // Calculate layout for this child
      const childLayout = this.calculateLayoutForVisible(child, Array.from(visibleNodesMap.values()), expandedState);
      
      // Position child
      this.positionVisibleNodes(child, currentX, childY, childLayout, expandedState, visibleNodesMap, nodes, edges);
      
      // Move to next child position
      currentX += Math.max(this.NODE_WIDTH, childLayout.width) + this.HORIZONTAL_SPACING;
    });
  }
}