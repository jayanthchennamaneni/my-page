import { useState, type ReactNode } from 'react'
import type { Topic } from '../data/content'
import TopicArticle from './TopicArticle'

interface SplitTopicViewProps {
  topics: Topic[]
  ariaLabel?: string
  showTitle?: boolean
  showIntro?: boolean
  renderTopic?: (topic: Topic) => ReactNode
}

export default function SplitTopicView({
  topics,
  ariaLabel = 'Topics',
  showTitle = true,
  showIntro = true,
  renderTopic,
}: SplitTopicViewProps) {
  const [activeId, setActiveId] = useState(topics[0]?.id ?? '')
  const activeTopic = topics.find((topic) => topic.id === activeId) ?? topics[0]

  return (
    <div className="split-topic-view">
      <nav className="split-topic-list" aria-label={ariaLabel}>
        {topics.map((topic, index) => (
          <button
            className={`split-topic-button${activeTopic?.id === topic.id ? ' is-active' : ''}`}
            key={topic.id}
            type="button"
            onClick={() => setActiveId(topic.id)}
          >
            <span>{(index + 1).toString().padStart(2, '0')}</span>
            <strong>{topic.title}</strong>
          </button>
        ))}
      </nav>
      {activeTopic && (
        <div className="split-topic-content">
          {renderTopic ? renderTopic(activeTopic) : <TopicArticle topic={activeTopic} showTitle={showTitle} showIntro={showIntro} />}
        </div>
      )}
    </div>
  )
}
