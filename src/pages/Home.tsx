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
      <section className="about">
        <div className="container">
          <div className="about-inner">
            <p className="about-text">
              Hallo, I’m Jayanth Chennamaneni (CJ). I train, optimize, and
              deploy ML models in production.
            </p>
            <p className="about-text">
              <strong className="about-bet">My bet: within five years, small
              models will run most production systems.</strong> A small model
              that does one thing well beats a big one that does everything
              okay. I experiment with that idea and learn from the people
              working on it.
            </p>
            <p className="about-text">
              Outside work, I watch football. Like ML, it’s about reading
              the game and getting the small things right.
            </p>
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="container">
          <nav className="blog-index" aria-label="Blog posts">
            {posts.map((post) => (
              <Link key={post.id} to={`/post/${post.id}`} className="index-row">
                <strong className="index-title">{post.title}</strong>
                <span className="index-intro">{post.intro}</span>
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
