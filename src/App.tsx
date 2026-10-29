import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import './index.css'

export default function App() {
  return (
    <div className="site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="nameplate">
        <div className="container nameplate-bar">
          <Link to="/">Jayanth Chennamaneni</Link>
          <ThemeToggle />
        </div>
      </header>
      <div className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
