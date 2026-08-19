import { cleaningApi } from '../api/client'
import { WorkLog } from '../components/WorkLog'

export function Cleaning() {
  return (
    <WorkLog
      title="Cleaning"
      blurb="Cleaning log for the boilers — who cleaned what, when, and when it's next due."
      workLabel="What was cleaned"
      api={cleaningApi}
    />
  )
}
