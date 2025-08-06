import { useState, useCallback } from 'react';
import 'reactflow/dist/style.css';

import { Employee } from '../types/employee';
import { OrgChartController } from '../coordination/OrgChartController';
import { OrgChartRenderer } from '../rendering/OrgChartRenderer';
import './OrgChart.css';

interface OrgChartProps {
  employees: Employee[];
}

export default function OrgChart({ employees }: OrgChartProps) {
  const [fitViewFunction, setFitViewFunction] = useState<(() => void) | null>(null);

  const handleFitViewReady = useCallback((fitView: () => void) => {
    setFitViewFunction(() => fitView);
  }, []);

  return (
    <OrgChartController employees={employees} fitView={fitViewFunction}>
      {(controllerState) => {
        if (!controllerState.orgTree) {
          return <div className="org-chart-error">No organizational data available</div>;
        }

        return (
          <OrgChartRenderer
            nodes={controllerState.nodes}
            edges={controllerState.edges}
            onNodesChange={controllerState.onNodesChange}
            onEdgesChange={controllerState.onEdgesChange}
            layoutEngine={controllerState.layoutEngine}
            onOrientationChange={controllerState.handleOrientationChange}
            searchQuery={controllerState.searchQuery}
            searchResults={controllerState.searchResults}
            onSearch={controllerState.handleSearch}
            onClearSearch={controllerState.clearSearch}
            onExpandAll={controllerState.expandAll}
            onCollapseAll={controllerState.collapseAll}
            onFitViewReady={handleFitViewReady}
          />
        );
      }}
    </OrgChartController>
  );
}