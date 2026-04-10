import { useState } from 'react'
import { CommandStage } from './components/CommandStage'
import { useForecastStamina } from './hooks/useForecastStamina'
import { useStartupOS } from './hooks/useStartupOS'

function parseExecutionStatus(output) {
  if (typeof output !== 'string') {
    return ''
  }

  try {
    const parsed = JSON.parse(output)
    return String(parsed?.status || '').toUpperCase()
  } catch {
    return ''
  }
}

function App() {
  const { data, error } = useStartupOS()
  const [executionState, setExecutionState] = useState({})
  const [taskCompletionState, setTaskCompletionState] = useState({})

  const safeData = data ?? {
    legal: {
      notaryStatus: 'BOOTING',
      eidStatus: 'UNKNOWN',
      capTable: { entity: 'CyberBerlin Robotics GmbH', shares: 0, shareholders: [] },
      bankAccountReady: false,
    },
    finance: {
      currentBalance: 0,
      monthlyBurn: 0,
      runwayMonths: 12,
      zeroCashDate: '',
      healthStatus: 'HEALTHY',
      strategy: 'Loading',
      julyGrantStatus: 'PENDING',
    },
    hiring: {
      employeeStatus: 'BOOTING',
      hiredCandidate: '',
      targetRole: '',
      documents: [],
    },
    product: {
      overallStatus: 'BOOTING',
      autonomyBetaStatus: 'PENDING',
      julyGrantStatus: 'PENDING',
    },
    ops: {
      overallStatus: 'BOOTING',
      githubSccStatus: 'DRAFTED',
    },
    quests: [],
  }

  const { legal, finance, hiring, product, ops } = safeData
  const stamina = useForecastStamina(finance)

  async function handleTaskExecute({ pillarKey, scriptPath, args = [], taskKey }) {
    if (!scriptPath) {
      return
    }

    setExecutionState((current) => ({
      ...current,
      [pillarKey]: {
        state: 'processing',
        taskKey,
        output: '',
        error: '',
      },
    }))

    try {
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptPath,
          args,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || `Execution API responded with ${response.status}`)
      }

      const taskStatus = parseExecutionStatus(payload.stdout)

      setExecutionState((current) => {
        const pillarState = current[pillarKey]

        if (pillarState?.taskKey !== taskKey) {
          return current
        }

        return {
          ...current,
          [pillarKey]: {
            state: 'done',
            taskKey,
            output: payload.stdout || 'Completed with no console output.',
            error: '',
          },
        }
      })

      setTaskCompletionState((current) => ({
        ...current,
        [pillarKey]: {
          ...current[pillarKey],
          [taskKey]: taskStatus === 'PASS' || taskStatus === 'SUCCESS',
        },
      }))
    } catch (executionError) {
      setExecutionState((current) => {
        const pillarState = current[pillarKey]

        if (pillarState?.taskKey !== taskKey) {
          return current
        }

        return {
          ...current,
          [pillarKey]: {
            state: 'error',
            taskKey,
            output: '',
            error:
              executionError instanceof Error ? executionError.message : String(executionError),
          },
        }
      })

      setTaskCompletionState((current) => ({
        ...current,
        [pillarKey]: {
          ...current[pillarKey],
          [taskKey]: false,
        },
      }))
    }
  }

  return (
    <main
      className={`hud-shell ${finance.healthStatus === 'CRITICAL' ? 'hud-shell--critical' : ''} h-screen w-screen overflow-hidden flex flex-col bg-yellow-400 text-black font-sans`}
    >
      <div className="hud-backdrop" />
      <div className="hud-container">
        {error ? (
          <section className="hud-banner hud-banner--error">
            <p className="hud-eyebrow">Data Link Fault</p>
            <p>{error}. Safe monitoring state is active while the file bridge recovers.</p>
          </section>
        ) : null}

        <CommandStage
          executionState={executionState}
          finance={finance}
          onTaskExecute={handleTaskExecute}
          legal={legal}
          hiring={hiring}
          ops={ops}
          product={product}
          stamina={stamina}
          taskCompletionState={taskCompletionState}
        />
      </div>
    </main>
  )
}

export default App
