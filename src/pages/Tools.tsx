import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { toolTopics } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

const toolGroups = [
  {
    id: 'deployment',
    label: 'Deployment',
    topicIds: ['coolify', 'docker'],
  },
  {
    id: 'ai-models',
    label: 'AI models',
    topicIds: ['hugging-face', 'pytorch'],
  },
  {
    id: 'data',
    label: 'Data',
    topicIds: ['chromadb', 'sqlite'],
  },
  {
    id: 'realtime',
    label: 'Realtime',
    topicIds: ['livekit'],
  },
  {
    id: 'automation',
    label: 'Automation',
    topicIds: ['n8n'],
  },
  {
    id: 'ai-tools',
    label: 'AI tools',
    topicIds: ['pi', 'opencode', 'openrouter'],
  },
]

export default function Tools() {
  const [selectedId, setSelectedId] = useState<string | null>('coolify')
  const selectedTool = toolTopics.find((tool) => tool.id === selectedId)

  usePageMeta('Tools', 'The engineering stack I use and experiment with.')

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHeader
        path="tools"
        title="Tools"
        description="The engineering stack I use and experiment with."
      />
      <section className="matrix-content-section">
        <div className="container">
          {selectedTool && (
            <p className="tools-selection">
              <strong>{selectedTool.title}</strong>
              <span>{selectedTool.intro}</span>
            </p>
          )}
          <div className="tools-field" aria-label="Tools I use">
            {toolGroups.map((group) => (
              <div
                className={`tools-cluster tools-cluster-${group.id}`}
                key={group.id}
                role="group"
                aria-label={group.label}
              >
                {group.topicIds.map((topicId) => {
                  const tool = toolTopics.find((item) => item.id === topicId)
                  if (!tool) return null
                  return (
                    <button
                      className={`tool-float${selectedId === tool.id ? ' is-selected' : ''}`}
                      key={tool.id}
                      type="button"
                      onClick={() => setSelectedId(tool.id)}
                    >
                      {tool.title}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
