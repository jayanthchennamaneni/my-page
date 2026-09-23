import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Algorithms from './pages/Algorithms'
import ML from './pages/ML'
import AI from './pages/AI'
import Tools from './pages/Tools'

export default function App() {
  return (
    <div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/algorithms">Algorithms</NavLink>
        <NavLink to="/ml">ML</NavLink>
        <NavLink to="/ai">AI</NavLink>
        <NavLink to="/tools">Tools</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/algorithms" element={<Algorithms />} />
        <Route path="/ml" element={<ML />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </div>
  )
}
