import { HashRouter, Route, Routes, useParams } from 'react-router-dom'
import { Home } from './components/Home'
import { PracticeSession } from './components/PracticeSession'
import { ProgressDashboard } from './components/ProgressDashboard'
import { MockTest, MockTestChooser } from './components/MockTest'
import { Settings } from './components/Settings'

// React Router reuses a component when only the URL params change; keying by
// the param gives each practice type / test mode a fresh session state.
function KeyedPractice() {
  const { subtype } = useParams()
  return <PracticeSession key={subtype} />
}

function KeyedMockTest() {
  const { mode } = useParams()
  return <MockTest key={mode} />
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice/:domain/:subtype" element={<KeyedPractice />} />
        <Route path="/mock-test" element={<MockTestChooser />} />
        <Route path="/mock-test/:mode" element={<KeyedMockTest />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/progress" element={<ProgressDashboard />} />
      </Routes>
    </HashRouter>
  )
}
