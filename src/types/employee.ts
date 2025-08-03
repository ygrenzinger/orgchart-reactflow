export interface Employee {
  id: number;
  parentId: number | null;
  name: string;
  lastName: string;
  position: string | null;
  salary: number;
  department_id: number;
  department_name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface OrganizationChart {
  employees: Employee[];
  departments: Department[];
}
