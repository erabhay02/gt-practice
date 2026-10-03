import { HashRouter, Route, Routes } from 'react-router-dom'
import { Home } from './components/Home'
import { PracticeSession } from './components/PracticeSession'
import { ProgressDashboard } from './components/ProgressDashboard'
import { MockTest, MockTestChooser } from './components/MockTest'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice/:domain/:subtype" element={<PracticeSession />} />
        <Route path="/mock-test" element={<MockTestChooser />} />
        <Route path="/mock-test/:mode" element={<MockTest />} />
        <Route path="/progress" element={<ProgressDashboard />} />
      </Routes>
    </HashRouter>
  )
}
