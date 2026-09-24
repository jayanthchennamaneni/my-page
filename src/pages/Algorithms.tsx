import BTreeVisual from '../components/BTreeVisual'
import PageHeader from '../components/PageHeader'
import SplitTopicView from '../components/SplitTopicView'
import TopicArticle from '../components/TopicArticle'
import { algorithmTopics } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Algorithms() {
  usePageMeta('Algorithms', 'Visual notes about data structures and algorithms.')

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHeader
        path="algorithms"
        title="Algorithms"
        description="Data structures and algorithms explained with the data flow kept in view."
      />
      <section className="matrix-content-section">
        <div className="container">
          <SplitTopicView
            topics={algorithmTopics}
            ariaLabel="Algorithm topics"
            renderTopic={(topic) => (
              <TopicArticle
                topic={topic}
                visualAfter="intro"
                visual={<BTreeVisual mode={topic.id === 'b-plus-tree' ? 'b-plus-tree' : 'b-tree'} />}
              />
            )}
          />
        </div>
      </section>
    </main>
  )
}
