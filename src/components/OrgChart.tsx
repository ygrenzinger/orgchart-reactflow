import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Employee } from '../types/employee';
import EmployeeNode from './EmployeeNode';
import { buildOrgTree, getVisibleNodes, ExpandedState, getChildrenCount } from '../utils/orgChartLayout';
import './OrgChart.css';

interface OrgChartProps {
  employees: Employee[];
}

const nodeTypes: NodeTypes = {
  employee: EmployeeNode,
};

export default function OrgChart({ employees }: OrgChartProps) {
  const [expandedState, setExpandedState] = useState<ExpandedState>({});
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const orgTree = useMemo(() => buildOrgTree(employees), [employees]);

  const toggleExpand = useCallback((employeeId: number) => {
    setExpandedState(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  }, []);

  useEffect(() => {
    if (!orgTree) return;

    const { nodes: newNodes, edges: newEdges } = getVisibleNodes(orgTree, expandedState);
    
    // Update nodes with the toggle function and children count
    const nodesWithHandlers = newNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleExpand: toggleExpand,
        childrenCount: getChildrenCount(orgTree, parseInt(node.id))
      }
    }));

    setNodes(nodesWithHandlers);
    setEdges(newEdges);
  }, [orgTree, expandedState, toggleExpand, setNodes, setEdges]);

  // Initial expand state - all nodes collapsed by default
  useEffect(() => {
    if (orgTree && Object.keys(expandedState).length === 0) {
      const initialExpanded: ExpandedState = {};
      
      // Only show CEO node, all others collapsed
      initialExpanded[orgTree.employee.id] = false;
      
      setExpandedState(initialExpanded);
    }
  }, [orgTree, expandedState]);

  if (!orgTree) {
    return <div className="org-chart-error">No organizational data available</div>;
  }

  return (
    <div className="org-chart-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          minZoom: 0.1,
          maxZoom: 2.0,
          includeHiddenNodes: false
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}