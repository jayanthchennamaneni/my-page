import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import SiteHeader from './components/SiteHeader'
import AI from './pages/AI'
import Algorithms from './pages/Algorithms'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Thoughts from './pages/Thoughts'
import Tools from './pages/Tools'
import './index.css'

export default function App() {
  return (
    <div className="site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ScrollToTop />
      <SiteHeader />
      <div className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/thoughts" element={<Thoughts />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/algorithms" element={<Algorithms />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
