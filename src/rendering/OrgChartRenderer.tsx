import { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap, 
  NodeTypes,
  Node,
  Edge,
  NodeChange,
  EdgeChange
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

import EmployeeNode from '../components/EmployeeNode';
import { LayoutEngine } from '../layout/LayoutEngine';
import { LayoutOrientation } from '../types/layoutStrategy';
import '../components/OrgChart.css';

const nodeTypes: NodeTypes = {
  employee: EmployeeNode,
};

interface OrgChartControlsProps {
  layoutEngine: LayoutEngine;
  onOrientationChange: (orientation: LayoutOrientation) => void;
}

function OrgChartControls({ layoutEngine, onOrientationChange }: OrgChartControlsProps) {

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

  const handleOrientationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrientation = event.target.value as LayoutOrientation;
    onOrientationChange(newOrientation);
  }, [onOrientationChange]);

  return (
    <div className="org-chart-controls" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
      <select 
        value={layoutEngine.getCurrentOrientation()}
        onChange={handleOrientationChange}
        title="Select layout orientation"
        style={{ marginRight: '8px', padding: '4px 8px' }}
      >
        {layoutEngine.getAvailableOrientations().map(({ orientation, name }) => (
          <option key={orientation} value={orientation}>
            {name}
          </option>
        ))}
      </select>
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

interface OrgChartRendererProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  layoutEngine: LayoutEngine;
  onOrientationChange: (orientation: LayoutOrientation) => void;
}

export function OrgChartRenderer({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  layoutEngine,
  onOrientationChange
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
        <OrgChartControls 
          layoutEngine={layoutEngine}
          onOrientationChange={onOrientationChange}
        />
      </ReactFlow>
    </div>
  );
}