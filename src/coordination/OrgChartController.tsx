import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, Node, Edge, NodeChange, EdgeChange } from 'reactflow';
import { Employee } from '../types/employee';
import { LayoutOrientation } from '../types/layoutStrategy';
import { OrgTree, OrgTreeBuilder } from '../domain/OrgTreeBuilder';
import { ExpandedState } from '../domain/VisibilityCalculator';
import { LayoutEngine } from '../layout/LayoutEngine';

export interface OrgChartControllerProps {
  employees: Employee[];
  children: (controllerState: OrgChartControllerState) => React.ReactNode;
}

export interface OrgChartControllerState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  orgTree: OrgTree | null;
  expandedState: ExpandedState;
  layoutEngine: LayoutEngine;
  toggleExpand: (employeeId: number) => void;
  handleOrientationChange: (orientation: LayoutOrientation) => void;
  getChildrenCount: (employeeId: number) => number;
}

export function OrgChartController({ employees, children }: OrgChartControllerProps) {
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutChangeKey, setLayoutChangeKey] = useState(0);

  // Initialize services
  const orgTreeBuilder = useMemo(() => new OrgTreeBuilder(), []);
  const layoutEngine = useMemo(() => new LayoutEngine('vertical'), []);

  // Build org tree
  const orgTree = useMemo(() => orgTreeBuilder.buildHierarchyTree(employees), [employees, orgTreeBuilder]);

  const toggleExpand = useCallback((employeeId: number) => {
    setExpandedState(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  }, []);

  const handleOrientationChange = useCallback((orientation: LayoutOrientation) => {
    layoutEngine.setOrientation(orientation);
    setLayoutChangeKey(prev => prev + 1);
  }, [layoutEngine]);

  const getChildrenCount = useCallback((employeeId: number) => {
    return orgTree ? orgTreeBuilder.getChildrenCount(orgTree, employeeId) : 0;
  }, [orgTree, orgTreeBuilder]);

  // Initialize expanded state when org tree changes
  useEffect(() => {
    if (orgTree && Object.keys(expandedState).length === 0) {
      const initialExpanded = layoutEngine.initializeExpandedState(orgTree);
      setExpandedState(initialExpanded);
    }
  }, [orgTree, expandedState, layoutEngine]);

  // Calculate layout when dependencies change
  useEffect(() => {
    if (!orgTree) return;

    const { nodes: newNodes, edges: newEdges } = layoutEngine.calculateLayout(orgTree, expandedState);
    
    // Update nodes with handlers and children count
    const nodesWithHandlers = newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleExpand: toggleExpand,
        childrenCount: getChildrenCount(parseInt(node.id))
      }
    }));

    setNodes(nodesWithHandlers);
    setEdges(newEdges);
  }, [orgTree, expandedState, layoutChangeKey, toggleExpand, getChildrenCount, setNodes, setEdges, layoutEngine]);

  const controllerState: OrgChartControllerState = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    orgTree,
    expandedState,
    layoutEngine,
    toggleExpand,
    handleOrientationChange,
    getChildrenCount,
  };

  return <>{children(controllerState)}</>;
}