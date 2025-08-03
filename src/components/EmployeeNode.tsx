import { Handle, Position } from 'reactflow';
import { Employee } from '../types/employee';
import './EmployeeNode.css';

interface EmployeeNodeProps {
  data: {
    employee: Employee;
    isExpanded: boolean;
    hasChildren: boolean;
    childrenCount?: number;
    onToggleExpand: (employeeId: number) => void;
  };
}

export default function EmployeeNode({ data }: EmployeeNodeProps) {
  const { employee, isExpanded, hasChildren, childrenCount = 0, onToggleExpand } = data;
  
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(employee.id);
  };

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getDepartmentColor = (departmentName: string) => {
    const colors: { [key: string]: string } = {
      'Executive': '#ff6b9d',
      'IT': '#4ecdc4',
      'Finance': '#ffe66d',
      'Sales': '#ff8b5a',
      'Purchasing': '#95e1d3',
      'Shipping': '#a8e6cf',
      'Administration': '#dda0dd',
      'Marketing': '#ffb3ba',
      'Human Resources': '#c7ceea',
      'Public Relations': '#ffd93d',
      'Accounting': '#6c5ce7'
    };
    return colors[departmentName] || '#e0e0e0';
  };

  return (
    <div className="employee-node">
      <Handle type="target" position={Position.Top} className="handle" />
      
      <div className="employee-card">
        <div className="employee-header">
          <div 
            className="employee-avatar"
            style={{ backgroundColor: getDepartmentColor(employee.department_name) }}
          >
            {getInitials(employee.name, employee.lastName)}
          </div>
          <div className="employee-id">#{employee.id}</div>
        </div>
        
        <div className="employee-info">
          <h3 className="employee-name">{employee.name}</h3>
          <p className="employee-position">{employee.position || ""}</p>
        </div>
        
        {hasChildren && (
                <Handle type="source" position={Position.Bottom} className="handle">
                  <button 
                    className="expand-button"
                    onClick={handleExpandClick}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    <span className="expand-icon">
                      {isExpanded ? "^" : "v"}{childrenCount > 0 ? childrenCount : ""}
                    </span>
                  </button>
                </Handle>
        )}
      </div>
      
    </div>
  );
}