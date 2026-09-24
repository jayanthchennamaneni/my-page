import PageHeader from '../components/PageHeader'
import QuantizationVisual from '../components/QuantizationVisual'
import TokenizerVisual from '../components/TokenizerVisual'
import SplitTopicView from '../components/SplitTopicView'
import TopicArticle from '../components/TopicArticle'
import { aiTopics } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

export default function AI() {
  usePageMeta('AI', 'parts of ai')

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHeader
        path="ai"
        title="AI"
        description="parts of ai"
      />
      <section className="matrix-content-section">
        <div className="container">
          <SplitTopicView
        topics={aiTopics}
        ariaLabel="AI topics"
        renderTopic={(topic) => (
          <TopicArticle
            topic={topic}
            visualAfter={topic.id === 'quantization' ? 1 : 'intro'}
            visual={
              topic.id === 'quantization' ? <QuantizationVisual /> : topic.id === 'tokenizer' ? <TokenizerVisual /> : undefined
            }
          />
        )}
      />
        </div>
      </section>
    </main>
  )
}
