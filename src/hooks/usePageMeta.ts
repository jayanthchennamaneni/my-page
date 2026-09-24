import { useEffect } from 'react'

const SITE_NAME = 'Jayanth Chennamaneni'

function setMeta(selector: string, content: string) {
  const tag = document.querySelector<HTMLMetaElement>(selector)
  if (tag) tag.content = content
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', description)
    setMeta('meta[name="twitter:title"]', title)
    setMeta('meta[name="twitter:description"]', description)
  }, [description, title])
}
