import { Fragment, type ReactNode } from 'react'
import type { Topic } from '../data/content'

interface TopicArticleProps {
  topic: Topic
  showTitle?: boolean
  showIntro?: boolean
  visualAfter?: number | 'intro'
  visual?: ReactNode
}

export default function TopicArticle({ topic, showTitle = true, showIntro = true, visualAfter, visual }: TopicArticleProps) {
  return (
    <article className="topic-article">
      {showTitle && <h1 className="topic-title">{topic.title}</h1>}
      {showIntro && <p className="topic-intro">{topic.intro}</p>}
      {visualAfter === 'intro' && visual}
      {topic.blocks.map((block, index) => (
        <Fragment key={block.heading}>
          <section className="content-block">
            {block.heading && <h2>{block.heading}</h2>}
            {block.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {block.bullets && (
              <ul>
                {block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
            {block.code && <pre aria-label="Code example"><code>{block.code}</code></pre>}
          </section>
          {typeof visualAfter === 'number' && index === visualAfter && visual}
        </Fragment>
      ))}
    </article>
  )
}
