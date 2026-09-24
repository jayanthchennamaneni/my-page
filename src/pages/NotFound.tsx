import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta('Not found', 'The requested page could not be found.')

  return (
    <main id="main-content" tabIndex={-1} className="matrix-not-found">
      <div className="container">
        <p className="terminal-path">~/404</p>
        <h1>That path is empty.</h1>
        <Link className="terminal-link" to="/">cd ~ <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  )
}
