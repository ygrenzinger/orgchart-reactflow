import fs from 'fs';

// Read the PayFit data
const payfitData = JSON.parse(fs.readFileSync('./src/data/original-payfit.json', 'utf8'));

// Get the company data (assuming there's only one company)
const companyId = Object.keys(payfitData)[0];
const company = payfitData[companyId];

// Helper function to generate numeric IDs from UUIDs
const uuidToNumericId = (() => {
  const idMap = new Map();
  let counter = 1;
  
  return (uuid) => {
    if (!uuid) return null;
    if (!idMap.has(uuid)) {
      idMap.set(uuid, counter++);
    }
    return idMap.get(uuid);
  };
})();


// Create department mapping
const departmentMap = new Map();
Object.values(company.departments.byId).forEach(dept => {
  departmentMap.set(dept.departmentId, {
    id: uuidToNumericId(dept.departmentId),
    name: dept.departmentName
  });
});

// Add a default department for employees without department
const defaultDeptId = 'default-dept';
departmentMap.set(defaultDeptId, {
  id: uuidToNumericId(defaultDeptId),
  name: 'General'
});

// Transform collaborators to employees (filter out those without parent and no children)
const employees = [];

// First pass: identify collaborators with children
const collaboratorsWithChildren = new Set();
Object.values(company.collaborators.byId).forEach(collaborator => {
  if (collaborator.managerId) {
    collaboratorsWithChildren.add(collaborator.managerId);
  }
});

Object.values(company.collaborators.byId).forEach(collaborator => {
  // Filter out collaborators without parent and no children
  const hasParent = collaborator.managerId !== null && collaborator.managerId !== undefined;
  const hasChildren = collaboratorsWithChildren.has(collaborator.id);
  
  if (!hasParent && !hasChildren) {
    return; // Skip this collaborator
  }
  
  const employee = {
    id: uuidToNumericId(collaborator.id),
    parentId: collaborator.managerId ? uuidToNumericId(collaborator.managerId) : null,
    name: collaborator.firstName,
    lastName: collaborator.lastName,
    position: collaborator.jobName,
    department_id: collaborator.teamId ? 
      (departmentMap.has(collaborator.teamId) ? departmentMap.get(collaborator.teamId).id : departmentMap.get(defaultDeptId).id) :
      departmentMap.get(defaultDeptId).id,
    department_name: collaborator.teamId ? 
      (departmentMap.has(collaborator.teamId) ? departmentMap.get(collaborator.teamId).name : departmentMap.get(defaultDeptId).name) :
      departmentMap.get(defaultDeptId).name
  };
  
  employees.push(employee);
});

// Handle teams as departments if no direct department mapping exists
Object.values(company.teams.byId).forEach(team => {
  if (!departmentMap.has(team.teamId)) {
    departmentMap.set(team.teamId, {
      id: uuidToNumericId(team.teamId),
      name: team.teamName
    });
  }
});

// Update employees with correct department info based on teams
employees.forEach(employee => {
  const originalCollaborator = Object.values(company.collaborators.byId).find(
    collab => uuidToNumericId(collab.id) === employee.id
  );
  
  if (originalCollaborator && originalCollaborator.teamId && departmentMap.has(originalCollaborator.teamId)) {
    const dept = departmentMap.get(originalCollaborator.teamId);
    employee.department_id = dept.id;
    employee.department_name = dept.name;
  }
});

// Write the transformed data
fs.writeFileSync('./src/data/mockPayfitEmployee.json', JSON.stringify(employees, null, 2));

console.log(`Transformed ${employees.length} employees`);
console.log(`Created ${departmentMap.size} departments`);
console.log('Data written to ./src/data/mockPayfitEmployee.json');