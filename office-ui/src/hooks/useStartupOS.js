import { startTransition, useCallback, useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 15000
const EMPTY_FINANCE_RETRY_MS = 800

export function useStartupOS() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshedAt, setRefreshedAt] = useState('never')

  const load = useCallback(async ({ bypassCache = false } = {}) => {
    try {
      const url = bypassCache ? `/api/startup-os?ts=${Date.now()}` : '/api/startup-os'
      const response = await fetch(url, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Startup OS API responded with ${response.status}`)
      }

      const payload = await response.json()

      if (
        !bypassCache &&
        Number(payload?.finance?.currentBalance || 0) === 0 &&
        Number(payload?.finance?.monthlyBurn || 0) === 0
      ) {
        window.setTimeout(() => {
          load({ bypassCache: true }).catch(() => {})
        }, EMPTY_FINANCE_RETRY_MS)
      }

      startTransition(() => {
        setData(payload)
        setError('')
        setLoading(false)
        setRefreshedAt(
          new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).format(new Date()),
        )
      })
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError))
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let disposed = false

    async function safeLoad() {
      try {
        await load()

        if (disposed) {
          return
        }
      } catch (loadError) {
        if (disposed) {
          return
        }
      }
    }

    safeLoad()
    const intervalId = window.setInterval(safeLoad, POLL_INTERVAL_MS)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [load])

  return { data, loading, error, refreshedAt, reload: load }
}
