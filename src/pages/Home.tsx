import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { aiTopics } from '../data/content'

const latestAddition = aiTopics.find((topic) => topic.id === 'quantization') ?? aiTopics[0]

export default function Home() {
  usePageMeta(
    'Jayanth Chennamaneni',
    'Jayanth Chennamaneni is a machine learning engineer who experiments with ML systems and learns along the way.',
  )

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="matrix-hero">
        <div className="container">
          <div className="hero-layout">
            <div className="hero-main">
              <p className="terminal-path">~/Jayanthchennamaneni</p>
              <h1>Jayanth<br /><span>Chennamaneni</span></h1>
              <p className="hero-role">machine learning engineer</p>
              <p className="hero-tagline">I build, study, and experiment with machine learning systems and software.</p>
              <nav className="hero-terminal" aria-label="Site sections">
                <span className="hero-terminal-prompt" aria-hidden="true">$ ls ./</span>
                <span className="hero-terminal-list">
                  <Link to="/thoughts">thoughts/</Link>
                  <Link to="/ai">ai/</Link>
                  <Link to="/algorithms">algorithms/</Link>
                  <Link to="/tools">tools/</Link>
                </span>
              </nav>
              <div className="latest-addition">
                <span>latest</span>
                <Link to="/ai">
                  {latestAddition.title}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
