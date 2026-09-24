import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/thoughts', label: 'Thoughts' },
  { to: '/ai', label: 'AI' },
  { to: '/algorithms', label: 'Algorithms' },
  { to: '/tools', label: 'Tools' },
]

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink className="brand" to="/" aria-label="Jayanth Chennamaneni, home">
          <span className="brand-mark" aria-hidden="true">CJ</span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <div id="primary-navigation" className={`header-navigation${menuOpen ? ' is-open' : ''}`}>
          <nav className="nav-links" aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
