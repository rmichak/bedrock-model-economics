import { useEffect, useReducer } from 'react'
import { decodeScenario, encodeScenario, reducer } from '../lib/scenario'

/** Scenario state mirrored into the query string so any view can be shared as a link. */
export function useScenario() {
  const [s, dispatch] = useReducer(reducer, undefined, () => decodeScenario(window.location.search))

  useEffect(() => {
    // Debounced: Safari throttles rapid replaceState calls while sliders drag.
    const id = window.setTimeout(() => {
      const q = encodeScenario(s)
      const url = window.location.pathname + (q ? '?' + q : '') + window.location.hash
      if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, '', url)
      }
    }, 200)
    return () => window.clearTimeout(id)
  }, [s])

  useEffect(() => {
    const onPop = () => dispatch({ type: 'load', scenario: decodeScenario(window.location.search) })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return [s, dispatch] as const
}
