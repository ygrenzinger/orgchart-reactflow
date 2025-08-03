import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  NodeTypes,
  useReactFlow
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

import { Employee } from '../types/employee';
import EmployeeNode from './EmployeeNode';
import { buildOrgTree, getVisibleNodes, ExpandedState, getChildrenCount, OrgNode } from '../utils/orgChartLayout';
import './OrgChart.css';

interface OrgChartProps {
  employees: Employee[];
}

const nodeTypes: NodeTypes = {
  employee: EmployeeNode,
};

// Component that uses useReactFlow hook inside ReactFlow context
function OrgChartControls() {
  const { fitView } = useReactFlow();

  const handleFitView = useCallback(() => {
    fitView({ duration: 500, padding: 0.1 });
  }, [fitView]);

  const downloadImage = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (!viewport) {
      console.error('Could not find ReactFlow viewport');
      return;
    }

    toPng(viewport, {
      backgroundColor: '#ffffff',
      width: viewport.offsetWidth,
      height: viewport.offsetHeight,
      style: {
        width: viewport.offsetWidth + 'px',
        height: viewport.offsetHeight + 'px',
      },
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'orgchart.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating image:', error);
      });
  }, []);

  // Listen for expand events and fit view
  useEffect(() => {
    const handleExpandEvent = () => {
      setTimeout(() => {
        fitView({ duration: 500, padding: 0.1 });
      }, 100);
    };
    
    window.addEventListener('orgchart-expand', handleExpandEvent);
    return () => window.removeEventListener('orgchart-expand', handleExpandEvent);
  }, [fitView]);

  return (
    <div className="org-chart-controls" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
      <button 
        className="fit-view-button"
        onClick={handleFitView}
        title="Fit all nodes in view"
        style={{ marginRight: '8px' }}
      >
        📐 Fit View
      </button>
      <button 
        className="download-button"
        onClick={downloadImage}
        title="Download as PNG"
      >
        📷 Export PNG
      </button>
    </div>
  );
}

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
    // Dispatch event for fitView
    window.dispatchEvent(new CustomEvent('orgchart-expand'));
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
      
      // Initialize all nodes as collapsed
      function initializeExpandedState(node: OrgNode) {
        initialExpanded[node.employee.id] = false;
        node.children.forEach(child => initializeExpandedState(child));
      }
      
      initializeExpandedState(orgTree);
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
          minZoom: 0.01,
          maxZoom: 2.0,
          includeHiddenNodes: false
        }}
        minZoom={0.01}
        maxZoom={2.0}
        defaultViewport={{ x: 0, y: 0, zoom: 1.0 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
        <OrgChartControls />
      </ReactFlow>
    </div>
  );
}