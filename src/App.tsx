import OrgChart from './components/OrgChart'
import { Employee } from './types/employee'
import mockEmployees from './data/mockPayfitEmployee.json'
import './App.css'

function App() {
  const employees: Employee[] = mockEmployees

  return (
    <div className="app">
      <header className="app-header">
        <h1>Organizational Chart</h1>
      </header>
      <main className="app-main">
        <OrgChart employees={employees} />
      </main>
    </div>
  )
}

export default App