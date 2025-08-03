import fs from 'fs';

// Read the PayFit data
const payfitData = JSON.parse(fs.readFileSync('./src/data/payfit.json', 'utf8'));

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

// Helper function to generate random salary based on job title
const generateSalary = (jobName) => {
  if (!jobName) {
    return Math.floor(Math.random() * (80000 - 40000 + 1)) + 40000;
  }
  
  const salaryRanges = {
    'CEO': [150000, 250000],
    'CTO': [130000, 200000],
    'VP': [120000, 180000],
    'Director': [100000, 150000],
    'Manager': [80000, 120000],
    'Senior': [70000, 100000],
    'Lead': [75000, 110000],
    'Engineer': [60000, 90000],
    'Developer': [55000, 85000],
    'Analyst': [50000, 75000],
    'Specialist': [45000, 70000],
    'Coordinator': [40000, 60000],
    'Assistant': [35000, 50000],
    'Intern': [25000, 40000]
  };
  
  // Find matching salary range based on job title keywords
  for (const [keyword, range] of Object.entries(salaryRanges)) {
    if (jobName.toLowerCase().includes(keyword.toLowerCase())) {
      const [min, max] = range;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  
  // Default salary range
  return Math.floor(Math.random() * (80000 - 40000 + 1)) + 40000;
};

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

// Transform collaborators to employees
const employees = [];
Object.values(company.collaborators.byId).forEach(collaborator => {
  const employee = {
    id: uuidToNumericId(collaborator.id),
    parentId: collaborator.managerId ? uuidToNumericId(collaborator.managerId) : null,
    name: collaborator.firstName,
    lastName: collaborator.lastName,
    position: collaborator.jobName,
    salary: generateSalary(collaborator.jobName),
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