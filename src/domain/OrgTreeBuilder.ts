import { Employee } from '../types/employee';

export interface OrgTree {
  employee: Employee;
  children: OrgTree[];
  level: number;
}

export class OrgTreeBuilder {
  buildHierarchyTree(employees: Employee[]): OrgTree | null {
    const employeeMap = new Map<number, Employee>();
    const childrenMap = new Map<number, Employee[]>();
    
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp);
      if (emp.parentId !== null) {
        if (!childrenMap.has(emp.parentId)) {
          childrenMap.set(emp.parentId, []);
        }
        childrenMap.get(emp.parentId)!.push(emp);
      }
    });

    const ceo = employees.find(emp => emp.parentId === null);
    if (!ceo) return null;

    return this.buildNode(ceo, childrenMap, 0);
  }

  private buildNode(employee: Employee, childrenMap: Map<number, Employee[]>, level: number): OrgTree {
    const children = childrenMap.get(employee.id) || [];
    return {
      employee,
      level,
      children: children.map(child => this.buildNode(child, childrenMap, level + 1))
    };
  }

  getChildrenCount(tree: OrgTree, employeeId: number): number {
    const node = this.findNode(tree, employeeId);
    return node ? node.children.length : 0;
  }

  private findNode(node: OrgTree, employeeId: number): OrgTree | null {
    if (node.employee.id === employeeId) return node;
    for (const child of node.children) {
      const found = this.findNode(child, employeeId);
      if (found) return found;
    }
    return null;
  }
}