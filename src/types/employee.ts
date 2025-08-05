export interface Employee {
  id: number;
  parentId: number | null;
  name: string;
  lastName: string;
  position: string | null;
  department_id: number;
  department_name: string;
}
