import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Algorithms from './pages/Algorithms'
import ML from './pages/ML'
import AI from './pages/AI'
import Tools from './pages/Tools'
import './index.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/algorithms', label: 'Algorithms' },
  { to: '/ml', label: 'ML' },
  { to: '/ai', label: 'AI' },
  { to: '/tools', label: 'Tools' },
]

export default function App() {
  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <NavLink to="/" className="brand">
            my&nbsp;site
          </NavLink>
          <div className="nav-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/algorithms" element={<Algorithms />} />
        <Route path="/ml" element={<ML />} />
        <Route path="/ai" element={<AI />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </>
  )
}
