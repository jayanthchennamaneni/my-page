import { Link } from 'react-router-dom'
import { posts } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Home() {
  usePageMeta(
    'Jayanth Chennamaneni',
    'Jayanth Chennamaneni is a machine learning engineer who experiments with ML systems and learns along the way.',
  )

  return (
    <main id="main-content" tabIndex={-1}>
      <header className="masthead">
        <div className="container">
          <h1>Jayanth<br />Chennamaneni</h1>
          <p className="masthead-role">machine learning engineer</p>
        </div>
      </header>

      <section className="blog-section">
        <div className="container">
          <nav className="blog-index" aria-label="Blog posts">
            {posts.map((post, index) => (
              <Link key={post.id} to={`/post/${post.id}`} className="index-row">
                <span className="index-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="index-main">
                  <strong>{post.title}</strong>
                  <span>{post.intro}</span>
                </span>
                <span className="index-meta">
                  {post.date && <span>{post.date}</span>}
                  <span className="index-arrow" aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  )
}
