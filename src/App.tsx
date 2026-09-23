import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Algorithms from './pages/Algorithms'
import Thoughts from './pages/Thoughts'
import AI from './pages/AI'
import Footer from './components/Footer'

import './index.css'

const links = [
  { to: '/thoughts', label: 'Thoughts' },
  { to: '/ai', label: 'AI' },
  { to: '/algorithms', label: 'Algorithms' },
]

export default function App() {
  return (
    <div className="site">
      <nav className="nav">
        <div className="nav-inner container">
          <NavLink to="/" className="brand">
            Jayanth Chennamaneni
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
        <Route path="/thoughts" element={<Thoughts />} />
        <Route path="/ai" element={<AI />} />

      </Routes>
      <Footer />
    </div>
  )
}
