import { useEffect, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PostArticle from '../components/PostArticle'
import QuantizationVisual from '../components/QuantizationVisual'
import TokenizerVisual from '../components/TokenizerVisual'
import { posts } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

// Post-specific interactive visuals. The decision-models post carries its
// figures inside the content blocks instead.
const visuals: Record<string, { visual: ReactNode; visualAfter: number | 'intro' }> = {
  tokenizer: { visual: <TokenizerVisual />, visualAfter: 'intro' },
  quantization: { visual: <QuantizationVisual />, visualAfter: 1 },
}

export default function PostPage() {
  const { id } = useParams()
  const index = posts.findIndex((post) => post.id === id)
  const post = posts[index]

  usePageMeta(
    post ? post.title : 'Jayanth Chennamaneni',
    post
      ? post.intro
      : 'Jayanth Chennamaneni is a machine learning engineer who experiments with ML systems and learns along the way.',
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!post) return <Navigate to="/" replace />

  // posts is ordered newest → oldest.
  const newer = posts[index - 1]
  const older = posts[index + 1]
  const extra = visuals[post.id]

  return (
    <main id="main-content" tabIndex={-1}>
      <article className="post-page">
        <div className="container">
          <header className="post-meta">
            <span>{post.label}</span>
            {post.date && <span>{post.date}</span>}
          </header>

          <PostArticle post={post} visual={extra?.visual} visualAfter={extra?.visualAfter} />

          <nav className="post-endnav" aria-label="More posts">
            {older ? (
              <Link className="endnav-cell" to={`/post/${older.id}`}>
                <span>← older</span>
                <strong>{older.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link className="endnav-cell is-next" to={`/post/${newer.id}`}>
                <span>newer →</span>
                <strong>{newer.title}</strong>
              </Link>
            )}
          </nav>
        </div>
      </article>
    </main>
  )
}
