import { Link, Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Home from './pages/Home'
import PostPage from './pages/PostPage'
import './index.css'

export default function App() {
  return (
    <div className="site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="nameplate">
        <div className="container">
          <Link to="/">Jayanth Chennamaneni</Link>
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
