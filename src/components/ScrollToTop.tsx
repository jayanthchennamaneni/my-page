import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)

    if (!firstRender.current) {
      document.getElementById('main-content')?.focus({ preventScroll: true })
    }

    firstRender.current = false
  }, [pathname])

  return null
}
