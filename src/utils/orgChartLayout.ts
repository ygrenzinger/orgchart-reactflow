import { Node, Edge, MarkerType } from 'reactflow';
import { Employee } from '../types/employee';

export interface OrgNode {
  employee: Employee;
  children: OrgNode[];
  level: number;
}

export interface ExpandedState {
  [employeeId: number]: boolean;
}

export function buildOrgTree(employees: Employee[]): OrgNode | null {
  const employeeMap = new Map<number, Employee>();
  const childrenMap = new Map<number, Employee[]>();
  
  employees.forEach(emp => {
    employeeMap.set(emp.id, emp);
    if (emp.parentId !== null) {
      if (!childrenMap.has(emp.parentId)) {
        childrenMap.set(emp.parentId, []);
      }
      childrenMap.get(emp.parentId)!.push(emp);
    }
  });

  const ceo = employees.find(emp => emp.parentId === null);
  if (!ceo) return null;

  function buildNode(employee: Employee, level: number): OrgNode {
    const children = childrenMap.get(employee.id) || [];
    return {
      employee,
      level,
      children: children.map(child => buildNode(child, level + 1))
    };
  }

  return buildNode(ceo, 0);
}

interface TreeLayout {
  x: number;
  y: number;
  width: number;
}

export function getVisibleNodes(
  orgTree: OrgNode | null, 
  expandedState: ExpandedState
): { nodes: Node[], edges: Edge[] } {
  if (!orgTree) return { nodes: [], edges: [] };

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Constants for layout
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 120;
  const HORIZONTAL_SPACING = 60;
  const VERTICAL_SPACING = 100;

  // First, collect all visible nodes (nodes whose parents are expanded)
  function collectVisibleNodes(node: OrgNode, isVisible: boolean = true): OrgNode[] {
    const visibleNodes: OrgNode[] = [];
    
    if (isVisible) {
      visibleNodes.push(node);
    }
    
    // Only show children if this node is expanded and visible
    const isExpanded = expandedState[node.employee.id] ?? false;
    if (isVisible && isExpanded) {
      // Only show immediate children (first level)
      node.children.forEach(child => {
        visibleNodes.push(...collectVisibleNodes(child, true));
      });
    }
    
    return visibleNodes;
  }

  // Calculate layout for visible nodes only
  function calculateLayoutForVisible(node: OrgNode, visibleNodes: OrgNode[]): TreeLayout {
    const isExpanded = expandedState[node.employee.id] ?? false;
    const hasChildren = node.children.length > 0;
    
    // Only consider immediate children that are visible
    const visibleChildren = node.children.filter(child => 
      visibleNodes.some(vNode => vNode.employee.id === child.employee.id)
    );

    if (!isExpanded || !hasChildren || visibleChildren.length === 0) {
      return { x: 0, y: 0, width: NODE_WIDTH };
    }

    // Calculate width needed for visible children only
    const childrenWidth = visibleChildren.length * NODE_WIDTH + (visibleChildren.length - 1) * HORIZONTAL_SPACING;

    return {
      x: 0,
      y: 0,
      width: Math.max(NODE_WIDTH, childrenWidth)
    };
  }

  // Get all visible nodes
  const visibleNodesList = collectVisibleNodes(orgTree);

  // Create a map for quick lookup
  const visibleNodesMap = new Map(visibleNodesList.map(node => [node.employee.id, node]));

  // Position visible nodes
  function positionVisibleNodes(node: OrgNode, parentX: number, parentY: number, layout: TreeLayout) {
    const isExpanded = expandedState[node.employee.id] ?? false;
    const hasChildren = node.children.length > 0;

    // Position this node at the center of its allocated space
    const nodeX = parentX + (layout.width - NODE_WIDTH) / 2;
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
    const childrenWidth = visibleChildren.length * NODE_WIDTH + (visibleChildren.length - 1) * HORIZONTAL_SPACING;
    let currentX = parentX + (layout.width - childrenWidth) / 2;
    const childY = parentY + NODE_HEIGHT + VERTICAL_SPACING;

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
      const childLayout = calculateLayoutForVisible(child, visibleNodesList);
      
      // Position child
      positionVisibleNodes(child, currentX, childY, childLayout);
      
      // Move to next child position
      currentX += Math.max(NODE_WIDTH, childLayout.width) + HORIZONTAL_SPACING;
    });
  }

  // Calculate layout and position nodes
  const rootLayout = calculateLayoutForVisible(orgTree, visibleNodesList);
  positionVisibleNodes(orgTree, 0, 0, rootLayout);

  return { nodes, edges };
}

export function getChildrenCount(orgTree: OrgNode, employeeId: number): number {
  function findNode(node: OrgNode): OrgNode | null {
    if (node.employee.id === employeeId) return node;
    for (const child of node.children) {
      const found = findNode(child);
      if (found) return found;
    }
    return null;
  }

  const node = findNode(orgTree);
  return node ? node.children.length : 0;
}