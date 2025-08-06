import { useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap, 
  NodeTypes,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import EmployeeNode from '../components/EmployeeNode';
import SearchBar from '../components/SearchBar';
import OrgChartControls from '../components/OrgChartControls';
import { LayoutEngine } from '../layout/LayoutEngine';
import { LayoutOrientation } from '../types/layoutStrategy';
import '../components/OrgChart.css';

const nodeTypes: NodeTypes = {
  employee: EmployeeNode,
};

interface OrgChartRendererProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  layoutEngine: LayoutEngine;
  onOrientationChange: (orientation: LayoutOrientation) => void;
  searchQuery: string;
  searchResults: Set<number>;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onFitViewReady?: (fitView: () => void) => void;
}

// Internal component that uses useReactFlow hook
function ReactFlowWrapper({ onFitViewReady }: { onFitViewReady?: (fitView: () => void) => void }) {
  const { fitView } = useReactFlow();

  // Pass fitView function to parent when component mounts
  useEffect(() => {
    if (onFitViewReady) {
      onFitViewReady(fitView);
    }
  }, [fitView, onFitViewReady]);

  return null;
}

export function OrgChartRenderer({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  layoutEngine,
  onOrientationChange,
  searchQuery,
  searchResults,
  onSearch,
  onClearSearch,
  onExpandAll,
  onCollapseAll,
  onFitViewReady
}: OrgChartRendererProps) {
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
        <MiniMap />
        <ReactFlowWrapper onFitViewReady={onFitViewReady} />
        <OrgChartControls 
          layoutEngine={layoutEngine}
          onOrientationChange={onOrientationChange}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
        />
        <SearchBar
          searchQuery={searchQuery}
          resultsCount={searchResults.size}
          onSearch={onSearch}
          onClear={onClearSearch}
        />
      </ReactFlow>
    </div>
  );
}