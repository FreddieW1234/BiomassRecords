import { maintenanceApi } from '../api/client'
import { WorkLog } from '../components/WorkLog'

export function Maintenance() {
  return (
    <WorkLog
      title="Maintenance"
      blurb="Maintenance and servicing log — repairs, parts, servicing, and when the next check is due."
      workLabel="What was done"
      api={maintenanceApi}
    />
  )
}
