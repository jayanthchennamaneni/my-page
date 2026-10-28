import { Fragment, type ReactNode } from 'react'
import type { Post } from '../data/content'
import PostFigure from './PostFigure'

interface PostArticleProps {
  post: Post
  showIntro?: boolean
  visualAfter?: number | 'intro'
  visual?: ReactNode
}

export default function PostArticle({ post, showIntro = true, visualAfter, visual }: PostArticleProps) {
  return (
    <article className="topic-article">
      <h1 className="topic-title">{post.title}</h1>
      {showIntro && <p className="topic-intro">{post.intro}</p>}
      {post.introFigure && <PostFigure id={post.introFigure} />}
      {visualAfter === 'intro' && visual}
      {post.blocks.map((block, index) => (
        <Fragment key={index}>
          <section className="content-block">
            {block.heading && <h2>{block.heading}</h2>}
            {block.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {block.bullets && (
              <ul>
                {block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
            {block.code && <pre aria-label="Code example"><code>{block.code}</code></pre>}
            {block.table && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {block.table.headers.map((header) => <th key={header} scope="col">{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {block.table.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => <td key={cell}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          {typeof visualAfter === 'number' && index === visualAfter && visual}
          {block.figure && <PostFigure id={block.figure} />}
        </Fragment>
      ))}
    </article>
  )
}
