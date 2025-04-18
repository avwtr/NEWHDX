import { useRole } from "@/contexts/role-context"

const ExperimentView = () => {
  const { role } = useRole()

  return (
    <div>
      <h1>Experiment View</h1>
      <p>User Role: {role}</p>
      {/* Add experiment specific content here */}
    </div>
  )
}

export default ExperimentView
