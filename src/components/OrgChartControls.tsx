import { useCallback } from 'react';
import { toPng } from 'html-to-image';

import { LayoutEngine } from '../layout/LayoutEngine';
import { LayoutOrientation } from '../types/layoutStrategy';

interface OrgChartControlsProps {
  layoutEngine: LayoutEngine;
  onOrientationChange: (orientation: LayoutOrientation) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export default function OrgChartControls({ layoutEngine, onOrientationChange, onExpandAll, onCollapseAll }: OrgChartControlsProps) {

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
        onClick={onExpandAll}
        title="Expand all nodes"
        style={{ marginRight: '8px', padding: '4px 8px' }}
      >
        ➕ Expand All
      </button>
      <button 
        onClick={onCollapseAll}
        title="Collapse all nodes"
        style={{ marginRight: '8px', padding: '4px 8px' }}
      >
        ➖ Collapse All
      </button>
      <button 
        className="download-button"
        onClick={downloadImage}
        title="Download as PNG"
        style={{ padding: '4px 8px' }}
      >
        📷 Export PNG
      </button>
    </div>
  );
}