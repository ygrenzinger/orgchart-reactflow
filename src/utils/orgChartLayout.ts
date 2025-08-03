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

  // Calculate layout for each node
  function calculateLayout(node: OrgNode): TreeLayout {
    const isExpanded = expandedState[node.employee.id] ?? true;
    const hasChildren = node.children.length > 0;

    if (!isExpanded || !hasChildren) {
      return { x: 0, y: 0, width: NODE_WIDTH };
    }

    // Calculate layout for children first
    const childLayouts = node.children.map(child => calculateLayout(child));
    
    // Calculate total width needed for all children
    const totalChildrenWidth = childLayouts.reduce((sum, layout, index) => {
      return sum + layout.width + (index > 0 ? HORIZONTAL_SPACING : 0);
    }, 0);

    // Return layout with width being the maximum of node width or children width
    return {
      x: 0,
      y: 0,
      width: Math.max(NODE_WIDTH, totalChildrenWidth)
    };
  }

  // Position nodes based on calculated layout
  function positionNodes(node: OrgNode, parentX: number, parentY: number, layout: TreeLayout) {
    const isExpanded = expandedState[node.employee.id] ?? true;
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

    if (!isExpanded || !hasChildren) {
      return;
    }

    // Calculate child positions
    const childLayouts = node.children.map(child => calculateLayout(child));
    const totalChildrenWidth = childLayouts.reduce((sum, layout, index) => {
      return sum + layout.width + (index > 0 ? HORIZONTAL_SPACING : 0);
    }, 0);

    // Start positioning children from the left
    let currentX = parentX + (layout.width - totalChildrenWidth) / 2;
    const childY = parentY + NODE_HEIGHT + VERTICAL_SPACING;

    node.children.forEach((child, index) => {
      const childLayout = childLayouts[index];
      
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

      // Position child
      positionNodes(child, currentX, childY, childLayout);
      
      // Move to next child position
      currentX += childLayout.width + HORIZONTAL_SPACING;
    });
  }

  // Calculate layout starting from root
  const rootLayout = calculateLayout(orgTree);
  
  // Position nodes starting from root
  positionNodes(orgTree, 0, 0, rootLayout);

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