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
  searchQuery: string;
  searchResults: Set<number>;
  highlightedNodes: Set<number>;
  handleSearch: (query: string) => void;
  clearSearch: () => void;
}

export function OrgChartController({ employees, children }: OrgChartControllerProps) {
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutChangeKey, setLayoutChangeKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Set<number>>(new Set());
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());

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

  // Search functionality
  const searchEmployees = useCallback((employees: Employee[], query: string): Set<number> => {
    if (!query.trim()) return new Set();
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = new Set<number>();
    
    employees.forEach(employee => {
      const fullName = `${employee.name} ${employee.lastName}`.toLowerCase();
      if (fullName.includes(normalizedQuery)) {
        results.add(employee.id);
      }
    });
    
    return results;
  }, []);

  const buildParentHierarchy = useCallback((employeeIds: Set<number>, orgTree: OrgTree): Set<number> => {
    const allHighlighted = new Set<number>();
    
    const findParent = (node: OrgTree, targetId: number): Employee | null => {
      for (const child of node.children) {
        if (child.employee.id === targetId) {
          return node.employee;
        }
        const found = findParent(child, targetId);
        if (found) return found;
      }
      return null;
    };
    
    employeeIds.forEach(employeeId => {
      // Add the employee itself
      allHighlighted.add(employeeId);
      
      // Add all parents up to root
      let currentId = employeeId;
      while (currentId) {
        const parent = findParent(orgTree, currentId);
        if (parent) {
          allHighlighted.add(parent.id);
          currentId = parent.id;
        } else {
          break;
        }
      }
    });
    
    return allHighlighted;
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults(new Set());
      setHighlightedNodes(new Set());
      return;
    }
    
    const results = searchEmployees(employees, query);
    setSearchResults(results);
    
    if (orgTree && results.size > 0) {
      const highlighted = buildParentHierarchy(results, orgTree);
      setHighlightedNodes(highlighted);
    } else {
      setHighlightedNodes(new Set());
    }
  }, [employees, orgTree, searchEmployees, buildParentHierarchy]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults(new Set());
    setHighlightedNodes(new Set());
  }, []);

  // Initialize expanded state when org tree changes
  useEffect(() => {
    if (orgTree && Object.keys(expandedState).length === 0) {
      const initialExpanded = layoutEngine.initializeExpandedState(orgTree);
      setExpandedState(initialExpanded);
    }
  }, [orgTree, expandedState, layoutEngine]);

  // Auto-expand search results
  const searchExpandedState = useMemo(() => {
    if (highlightedNodes.size === 0) return expandedState;
    
    const newExpanded = { ...expandedState };
    highlightedNodes.forEach(nodeId => {
      if (getChildrenCount(nodeId) > 0) {
        newExpanded[nodeId] = true;
      }
    });
    
    return newExpanded;
  }, [expandedState, highlightedNodes, getChildrenCount]);

  // Calculate layout when dependencies change
  useEffect(() => {
    if (!orgTree) return;

    const { nodes: newNodes, edges: newEdges } = layoutEngine.calculateLayout(orgTree, searchExpandedState);
    
    // Update nodes with handlers, children count, and search highlighting
    const nodesWithHandlers = newNodes.map(node => {
      const employeeId = parseInt(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          onToggleExpand: toggleExpand,
          childrenCount: getChildrenCount(employeeId),
          isSearchMatch: searchResults.has(employeeId),
          isSearchParent: highlightedNodes.has(employeeId) && !searchResults.has(employeeId)
        }
      };
    });

    setNodes(nodesWithHandlers);
    setEdges(newEdges);
  }, [orgTree, searchExpandedState, layoutChangeKey, toggleExpand, getChildrenCount, searchResults, highlightedNodes, setNodes, setEdges, layoutEngine]);

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
    searchQuery,
    searchResults,
    highlightedNodes,
    handleSearch,
    clearSearch,
  };

  return <>{children(controllerState)}</>;
}