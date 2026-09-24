import PageHeader from '../components/PageHeader'
import SplitTopicView from '../components/SplitTopicView'
import { thoughtTopics } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Thoughts() {
  usePageMeta('Thoughts', 'Thoughts I Picked Up Along the Way')

  return (
    <main id="main-content" tabIndex={-1}>
      <PageHeader
        path="thoughts"
        title="Thoughts"
        description="Thoughts I Picked Up Along the Way"
      />
      <section className="matrix-content-section">
        <div className="container">
          <SplitTopicView topics={thoughtTopics} showTitle={false} showIntro={false} />
        </div>
      </section>
    </main>
  )
}
