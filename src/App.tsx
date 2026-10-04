import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { DailyPractice } from './components/DailyPractice'
import { KidHome } from './components/KidHome'
import { MockTest, MockTestChooser } from './components/MockTest'
import { ParentChildren, ParentLayout, ParentProgress } from './components/ParentArea'
import { PracticeSession } from './components/PracticeSession'
import { ProfilePicker } from './components/ProfilePicker'
import { Settings } from './components/Settings'
import { Worksheet } from './components/Worksheet'
import { useActiveProfile } from './state/profilesStore'
import { ParentGate } from './ui/ParentGate'

// React Router reuses a component when only the URL params change; keying by
// the param (and child) gives each practice type / test mode a fresh session.
function KeyedPractice() {
  const { subtype } = useParams()
  const profile = useActiveProfile()
  return <PracticeSession key={`${profile?.id}-${subtype}`} />
}

function KeyedMockTest() {
  const { mode } = useParams()
  const profile = useActiveProfile()
  return <MockTest key={`${profile?.id}-${mode}`} />
}

function KeyedDaily() {
  const profile = useActiveProfile()
  return <DailyPractice key={profile?.id} />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<KidHome />} />
        <Route path="/who" element={<ProfilePicker />} />
        <Route path="/daily" element={<KeyedDaily />} />
        <Route path="/practice/:domain/:subtype" element={<KeyedPractice />} />
        <Route path="/mock-test" element={<MockTestChooser />} />
        <Route path="/mock-test/:mode" element={<KeyedMockTest />} />
        <Route
          path="/parent"
          element={
            <ParentGate>
              <ParentLayout />
            </ParentGate>
          }
        >
          <Route index element={<Navigate to="progress" replace />} />
          <Route path="progress" element={<ParentProgress />} />
          <Route path="children" element={<ParentChildren />} />
          <Route path="worksheet" element={<Worksheet />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        {/* Old links from before the parent area existed. */}
        <Route path="/progress" element={<Navigate to="/parent/progress" replace />} />
        <Route path="/settings" element={<Navigate to="/parent/settings" replace />} />
        <Route path="/worksheet" element={<Navigate to="/parent/worksheet" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
