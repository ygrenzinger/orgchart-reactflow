import 'reactflow/dist/style.css';

import { Employee } from '../types/employee';
import { OrgChartController } from '../coordination/OrgChartController';
import { OrgChartRenderer } from '../rendering/OrgChartRenderer';
import './OrgChart.css';

interface OrgChartProps {
  employees: Employee[];
}

export default function OrgChart({ employees }: OrgChartProps) {
  return (
    <OrgChartController employees={employees}>
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
          />
        );
      }}
    </OrgChartController>
  );
}