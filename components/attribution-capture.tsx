'use client'

import { useEffect } from 'react'
import {
  ATTRIBUTION_STORAGE_KEY,
  mergeFirstTouch,
  parseAttribution,
  type Attribution,
} from '@/lib/attribution'

/** Attribution remembered in this browser (first touch), or undefined. Safe without storage. */
export function readAttribution(): Attribution | undefined {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : undefined
  } catch {
    return undefined
  }
}

/**
 * Remembers which piece of content brought the visitor (first touch) and reports the first
 * visit per content once, so the team sees how many people each piece attracts.
 * Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const incoming = parseAttribution(window.location.search)
      if (!incoming) return
      const stored = readAttribution() ?? null
      const merged = mergeFirstTouch(stored, incoming)
      if (merged && merged !== stored) {
        localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(merged))
      }
      if (!incoming.content) return
      const seenKey = `fisiofes_touch_${incoming.channel ?? 'x'}_${incoming.content}`
      if (localStorage.getItem(seenKey)) return
      localStorage.setItem(seenKey, '1')
      void fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          channel: incoming.channel ?? 'directo',
          content: incoming.content,
          path: window.location.pathname,
        }),
        keepalive: true,
      }).catch(() => undefined)
    } catch {
      // Storage can be blocked (private mode): attribution is a convenience, never a blocker.
    }
  }, [])
  return null
}
