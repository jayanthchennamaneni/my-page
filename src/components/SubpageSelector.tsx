import { useState, type ReactNode } from 'react'

export interface SubpageItem {
  id: string
  label: string
  content: ReactNode
}

interface SubpageSelectorProps {
  items: SubpageItem[]
}

export default function SubpageSelector({ items }: SubpageSelectorProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const activeItem = items.find((item) => item.id === activeId) ?? items[0]

  return (
    <section className="topic-selector" aria-label="Page contents">
      <nav className="topic-tabs" aria-label="Choose a topic">
        {items.map((item, index) => (
          <span className="topic-tab-wrap" key={item.id}>
            {index > 0 && <span className="topic-dot" aria-hidden="true">·</span>}
            <button
              className={`topic-tab${activeItem?.id === item.id ? ' is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeItem?.id === item.id}
              aria-controls={`topic-panel-${item.id}`}
              onClick={() => setActiveId(item.id)}
            >
              {item.label}
            </button>
          </span>
        ))}
      </nav>
      {activeItem && (
        <div
          className="topic-panel"
          id={`topic-panel-${activeItem.id}`}
          role="tabpanel"
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </section>
  )
}
