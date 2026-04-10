import { useMemo, useState } from 'react'

function formatMoney(value) {
  return `EUR ${Number(value || 0).toLocaleString()}`
}

function formatPercent(value) {
  return `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`
}

function parseExecutionOutput(output) {
  if (typeof output !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(output)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

const EXECUTABLE_TASKS = {
  legal: {
    capTableSync: {
      scriptPath: '.agents/skills/legal-ops/scripts/cap_table_sync.py',
      args: [],
    },
  },
  finance: {
    burnBreakdownLoaded: {
      scriptPath: '.agents/skills/finance-ops/scripts/finance_engine.py',
      args: [],
    },
    grantTrancheSurfaced: {
      scriptPath: '.agents/skills/finance-ops/scripts/grant_scavenger.py',
      args: [],
    },
  },
  hiring: {
    personnelDocsCollected: {
      scriptPath: '.agents/skills/ops-ops/scripts/onboarding_sync.py',
      args: [],
    },
    pipelineVisible: {
      scriptPath: '.agents/skills/talent-ops/scripts/talent_vetting.py',
      args: [],
    },
  },
  ops: {
    githubSccSigned: {
      scriptPath: 'backend/gdpr_audit.py',
      args: [],
    },
    complianceAuditPassing: {
      scriptPath: 'backend/gdpr_audit.py',
      args: [],
    },
    seatRecoveryTracked: {
      scriptPath: '.agents/skills/ops-ops/scripts/offboarding_killswitch.py',
      args: [],
    },
  },
  product: {
    milestonesLoaded: {
      scriptPath: 'product/scripts/milestone_check.py',
      args: [],
    },
  },
}

function buildChecklist(legal, finance, hiring, ops, product) {
  return {
    legal: [
      {
        key: 'notaryPacketReady',
        label: 'Notary packet ready',
        done: String(legal.notaryStatus || '').toUpperCase().includes('READY'),
      },
      {
        key: 'eidActive',
        label: 'eID active',
        done: String(legal.eidStatus || '').toUpperCase() === 'ACTIVE',
      },
      {
        key: 'capTableSync',
        label: 'Cap table synced',
        done: Array.isArray(legal.capTable?.shareholders) && legal.capTable.shareholders.length > 0,
      },
      {
        key: 'bankAccountReady',
        label: 'Bank account ready',
        done: Boolean(legal.bankAccountReady),
      },
    ],
    finance: [
      {
        key: 'forecastLive',
        label: 'Forecast live',
        done: Number(finance.runwayMonths || 0) > 0,
      },
      {
        key: 'zeroCashDateTracked',
        label: 'Zero-cash date tracked',
        done: Boolean(finance.zeroCashDate),
      },
      {
        key: 'burnBreakdownLoaded',
        label: 'Burn breakdown loaded',
        done: Array.isArray(finance.burnBreakdown) && finance.burnBreakdown.length > 0,
      },
      {
        key: 'grantTrancheSurfaced',
        label: 'Grant tranche surfaced',
        done: Boolean(finance.julyGrantStatus),
      },
    ],
    hiring: [
      {
        key: 'leadHirePlaced',
        label: 'Lead hire placed',
        done: Boolean(hiring.hiredCandidate),
      },
      {
        key: 'onboardingStatusLive',
        label: 'Onboarding status live',
        done: String(hiring.employeeStatus || '').length > 0,
      },
      {
        key: 'personnelDocsCollected',
        label: 'Personnel docs collected',
        done: !hiring.documents?.some((document) =>
          String(document.status || '').toUpperCase().includes('MISSING'),
        ),
      },
      {
        key: 'pipelineVisible',
        label: 'Profile Match Analysis',
        done: Array.isArray(hiring.candidates) && hiring.candidates.length > 0,
      },
    ],
    ops: [
      {
        key: 'githubSccSigned',
        label: 'GitHub SCC signed',
        done: String(ops.githubSccStatus || '').toUpperCase() === 'SIGNED',
      },
      {
        key: 'inventoryMapped',
        label: 'Inventory mapped',
        done: Array.isArray(ops.inventory) && ops.inventory.length > 0,
      },
      {
        key: 'complianceAuditPassing',
        label: 'Compliance audit passing',
        done: Number(ops.passedTools || 0) >= Number(ops.totalTools || 0),
      },
      {
        key: 'seatRecoveryTracked',
        label: 'Asset & Access Reclamation',
        done: Number(ops.seatsFreed || 0) >= 0,
      },
    ],
    product: [
      {
        key: 'autonomyBetaReady',
        label: 'Autonomy beta ready',
        done: String(product.autonomyBetaStatus || '').toUpperCase() === 'CLAIM_READY',
      },
      {
        key: 'julyTrancheReady',
        label: 'July tranche ready',
        done: String(product.julyGrantStatus || '').toUpperCase() === 'CLAIM_READY',
      },
      {
        key: 'milestonesLoaded',
        label: 'Milestones loaded',
        done: Array.isArray(product.milestones) && product.milestones.length > 0,
      },
      {
        key: 'sourceFilesDetected',
        label: 'Source files detected',
        done: Array.isArray(product.sourceFiles) && product.sourceFiles.length > 0,
      },
    ],
  }
}

function resolveTone(status) {
  const value = String(status || '').toUpperCase()

  if (
    value.includes('CRITICAL') ||
    value.includes('FAIL') ||
    value.includes('BLOCKED') ||
    value.includes('MISSING')
  ) {
    return 'critical'
  }

  if (
    value.includes('READY') ||
    value.includes('ACTIVE') ||
    value.includes('SUCCESS') ||
    value.includes('CLAIM_READY') ||
    value.includes('ONBOARDED')
  ) {
    return 'active'
  }

  return 'booting'
}

function StatCard({ label, value, note }) {
  return (
    <article className="hud-stat">
      <p className="hud-stat__label">{label}</p>
      <p className="hud-stat__value">{value}</p>
      <p className="hud-stat__note">{note}</p>
    </article>
  )
}

function RobotSprite({ code, tone, variant, statusLabel }) {
  return (
    <div
      className={`robot-workstation robot-workstation--${tone} robot-workstation--${variant}`}
      aria-hidden="true"
    >
      <div className="robot-workstation__iso-floor" />
      <div className="robot-workstation__cubicle">
        <div className="robot-workstation__wall robot-workstation__wall--back" />
        <div className="robot-workstation__wall robot-workstation__wall--left" />
        <div className="robot-workstation__wall robot-workstation__wall--right" />
      </div>
      <div className="robot-workstation__desk">
        <div className="robot-workstation__monitor" />
        <div className="robot-workstation__monitor-glow" />
        <div className="robot-workstation__keyboard" />
        <div className="robot-workstation__mug" />
        <div className="robot-workstation__desk-props">
          <span className="robot-workstation__prop robot-workstation__prop--a" />
          <span className="robot-workstation__prop robot-workstation__prop--b" />
          <span className="robot-workstation__prop robot-workstation__prop--c" />
        </div>
      </div>
      <div className="robot-workstation__chair" />
      <div className="robot-workstation__robot">
        <div className="robot-workstation__head">
          <span className="robot-workstation__pixel-eye robot-workstation__pixel-eye--left" />
          <span className="robot-workstation__pixel-eye robot-workstation__pixel-eye--right" />
        </div>
        <div className="robot-workstation__torso">
          <span className="robot-workstation__spine" />
          <span className="robot-workstation__badge">{code}</span>
        </div>
        <div className="robot-workstation__arm robot-workstation__arm--left" />
        <div className="robot-workstation__arm robot-workstation__arm--right" />
        <div className="robot-workstation__leg robot-workstation__leg--left" />
        <div className="robot-workstation__leg robot-workstation__leg--right" />
      </div>
      {statusLabel ? <div className="robot-workstation__status">{statusLabel}</div> : null}
      <div className="robot-workstation__shadow" />
    </div>
  )
}

function ResultStatusBadge({ status }) {
  const normalizedStatus = String(status || 'SUCCESS').toUpperCase()
  let modifier = 'neutral'

  if (normalizedStatus === 'PASS' || normalizedStatus === 'COMPLETE' || normalizedStatus === 'READY' || normalizedStatus === 'SUCCESS') {
    modifier = 'pass'
  } else if (normalizedStatus === 'FAIL' || normalizedStatus === 'ERROR') {
    modifier = 'fail'
  } else if (normalizedStatus === 'PROCESSING') {
    modifier = 'pending'
  }

  return <span className={`agent-audit__status-pill agent-audit__status-pill--${modifier}`}>{normalizedStatus}</span>
}

function formatResultValue(value) {
  if (value == null) {
    return 'None'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return JSON.stringify(value, null, 2)
}

function TaskOutput({ output, isError = false }) {
  const parsed = parseExecutionOutput(output)

  if (!parsed) {
    return (
      <pre className={`agent-audit__result agent-audit__result--plain ${isError ? 'agent-audit__result--error' : ''}`}>
        {output}
      </pre>
    )
  }

  const derivedStatus = parsed.status ? parsed.status : 'SUCCESS'
  const entries = Object.entries(parsed).filter(([key]) => key !== 'status')

  return (
    <div className={`agent-audit__result agent-audit__result--structured ${isError ? 'agent-audit__result--error' : ''}`}>
      <div className="agent-audit__result-header">
        <ResultStatusBadge status={derivedStatus} />
      </div>
      <div className="agent-audit__result-body">
        {entries.map(([key, value]) => {
          const isNested = value && typeof value === 'object'
          const isMatchingSkills = key === 'matching_skills'

          return (
            <div
              key={key}
              className={`agent-audit__result-row ${isMatchingSkills ? 'agent-audit__result-row--positive' : ''}`}
            >
              <span className="agent-audit__result-key">{key.replace(/_/g, ' ')}</span>
              {isNested ? (
                <pre
                  className={`agent-audit__result-value agent-audit__result-value--nested ${isMatchingSkills ? 'agent-audit__result-value--positive' : ''}`}
                >
                  {formatResultValue(value)}
                </pre>
              ) : (
                <span className={`agent-audit__result-value ${isMatchingSkills ? 'agent-audit__result-value--positive' : ''}`}>
                  {formatResultValue(value)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuditChecklist({ title, subtitle, checklist, execution, onTaskExecute, pillarKey }) {
  return (
    <div className="agent-audit">
      <div className="agent-audit__scroll">
        <div>
          <p className="agent-audit__label">Agent Role</p>
          <h3 className="agent-audit__title">{title}</h3>
          <p className="agent-audit__subtitle">{subtitle}</p>
        </div>

        <div className="agent-audit__section">
          <p className="agent-audit__label">Task Checklist</p>
          <ul className="agent-audit__list">
            {checklist.map((item) => (
              <li key={item.key} className="agent-audit__item">
                <button
                  type="button"
                  className={`agent-audit__task ${item.scriptPath ? 'agent-audit__task--executable' : ''}`}
                  onClick={() => {
                    if (!item.scriptPath || !onTaskExecute) {
                      return
                    }

                    onTaskExecute({
                      pillarKey,
                      scriptPath: item.scriptPath,
                      args: item.args ?? [],
                      taskKey: item.key,
                    })
                  }}
                  disabled={!item.scriptPath || execution?.state === 'processing'}
                >
                  <span className="agent-audit__check">{item.done ? '[✓]' : '[ ]'}</span>
                  <span>{item.label}</span>
                  {item.scriptPath ? <span className="agent-audit__cta">Run</span> : null}
                </button>

                {execution?.taskKey === item.key && execution?.state === 'done' ? (
                  <TaskOutput output={execution.output} />
                ) : null}

                {execution?.taskKey === item.key && execution?.state === 'error' ? (
                  <TaskOutput output={execution.error} isError />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function AgentCell({
  id,
  title,
  status,
  subtitle,
  headerMeta,
  code,
  variant,
  role,
  checklist,
  pillarKey,
  execution,
  onTaskExecute,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const tone = resolveTone(status)
  const robotStatusLabel = execution?.state === 'processing' ? 'Processing...' : ''

  return (
    <section className={`agent-cell agent-cell--${tone} ${className}`}>
      <button
        type="button"
        className="agent-cell__wall-menu"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`${id}-audit`}
        aria-label={`${open ? 'Close' : 'Open'} ${title} audit view`}
      >
        ⋮
      </button>

      <header className="agent-cell__header">
        <div>
          <p className="agent-cell__eyebrow">{title}</p>
          <div className="agent-cell__status-row">
            <span className={`agent-cell__badge agent-cell__badge--${tone}`}>{status}</span>
            {headerMeta ? <span className="agent-cell__meta">{headerMeta}</span> : null}
          </div>
        </div>
      </header>

      <div className="agent-cell__scene">
        <RobotSprite code={code} tone={tone} variant={variant} statusLabel={robotStatusLabel} />
      </div>

      <div id={`${id}-audit`} className={`agent-cell__overlay ${open ? 'agent-cell__overlay--open' : ''}`}>
        <div className="agent-cell__bubble">
          <AuditChecklist
            title={role}
            subtitle={subtitle}
            checklist={checklist}
            execution={execution}
            onTaskExecute={onTaskExecute}
            pillarKey={pillarKey}
          />
        </div>
      </div>
    </section>
  )
}

export function CommandStage({
  executionState,
  finance,
  legal,
  hiring,
  onTaskExecute,
  ops,
  product,
  stamina,
  taskCompletionState,
}) {
  const checklistMap = useMemo(() => {
    const checklist = buildChecklist(legal, finance, hiring, ops, product)

    return Object.fromEntries(
      Object.entries(checklist).map(([pillarKey, items]) => [
        pillarKey,
        items.map((item) => ({
          ...item,
          done: Boolean(item.done || taskCompletionState?.[pillarKey]?.[item.key]),
          ...(EXECUTABLE_TASKS[pillarKey]?.[item.key] ?? {}),
        })),
      ]),
    )
  }, [legal, finance, hiring, ops, product, taskCompletionState])

  return (
    <section className="command-hud flex flex-col h-full overflow-hidden">
      <div className="command-hud__top">
        <header className="command-hud__header">
          <div className="brand-bar">
            <div className="brand-bar__side brand-bar__side--left">
              <img src="/fls-logo.png" alt="FLS logo" className="brand-bar__logo brand-bar__logo--fls" />
            </div>
            <p className="brand-bar__caption">• Autonomous Startup OS •</p>
            <div className="brand-bar__side brand-bar__side--right">
              <img
                src="/factory-logo.png"
                alt="Factory Berlin logo"
                className="brand-bar__logo brand-bar__logo--factory"
              />
            </div>
          </div>
        </header>

        <section className="runway-bar" aria-label="Runway stamina bar">
          <div className="runway-bar__topline">
            <div>
              <p className="runway-bar__eyebrow">Runway Stamina</p>
            </div>
            <div className="runway-bar__metrics">
              <span>{formatPercent(stamina.percent)}</span>
              <span>{finance.healthStatus}</span>
            </div>
          </div>
          <div className="runway-bar__track">
            <div className="runway-bar__fill" style={{ width: formatPercent(stamina.percent) }} />
          </div>
        </section>

        <section className="finance-strip" aria-label="CEO finance summary">
          <StatCard
            label="Monthly Burn"
            value={formatMoney(finance.monthlyBurn)}
            note="Current operating burn"
          />
          <StatCard
            label="Runway"
            value={`${stamina.daysLeft} days`}
            note={`${finance.runwayMonths} months projected`}
          />
          <StatCard
            label="Current Balance"
            value={formatMoney(finance.currentBalance)}
            note={`Strategy ${finance.strategy || 'Unknown'}`}
          />
        </section>
      </div>

      <section className="hud-grid flex-1" aria-label="Pillar command matrix">
        <div className="hud-grid__core">
          <div className="agent-slot">
            <AgentCell
              id="legal"
              title="Legal"
              status={legal.notaryStatus || 'BOOTING'}
              headerMeta={`eID ${legal.eidStatus || 'UNKNOWN'}`}
              subtitle="Formation, notary readiness, and cap table control."
              code="L"
              variant="legal"
              role="Chief Legal Officer Robot"
              pillarKey="legal"
              execution={executionState?.legal}
              onTaskExecute={onTaskExecute}
              checklist={checklistMap.legal}
              className="agent-cell--core"
            />
          </div>
          <div className="agent-slot">
            <AgentCell
              id="finance"
              title="Finance"
              status={finance.healthStatus || 'BOOTING'}
              headerMeta={`Zero-Cash ${finance.zeroCashDate || 'Unknown'}`}
              subtitle="Runway control, burn tracking, and tranche visibility."
              code="F"
              variant="finance"
              role="Chief Finance Officer Robot"
              pillarKey="finance"
              execution={executionState?.finance}
              onTaskExecute={onTaskExecute}
              checklist={checklistMap.finance}
              className="agent-cell--core"
            />
          </div>
          <div className="agent-slot">
            <AgentCell
              id="hiring"
              title="Hiring"
              status={hiring.employeeStatus || 'BOOTING'}
              headerMeta={`Alpha ${hiring.hiredCandidate || 'Pending'}`}
              subtitle="Recruiting, onboarding, and personnel file readiness."
              code="H"
              variant="hiring"
              role="Talent Operations Robot"
              pillarKey="hiring"
              execution={executionState?.hiring}
              onTaskExecute={onTaskExecute}
              checklist={checklistMap.hiring}
              className="agent-cell--core"
            />
          </div>
          <div className="agent-slot">
            <AgentCell
              id="product"
              title="Product"
              status={product.overallStatus || product.julyGrantStatus || 'BOOTING'}
              headerMeta={`Grant ${product.julyGrantStatus || 'PENDING'}`}
              subtitle="Autonomy milestones, roadmap execution, and tranche readiness."
              code="P"
              variant="product"
              role="Product and IP Robot"
              pillarKey="product"
              execution={executionState?.product}
              onTaskExecute={onTaskExecute}
              checklist={checklistMap.product}
              className="agent-cell--core"
            />
          </div>
        </div>

        <div className="agent-slot agent-slot--sidebar">
          <AgentCell
            id="ops"
            title="Ops"
            status={ops.overallStatus || 'BOOTING'}
            headerMeta={`SCC ${ops.githubSccStatus || 'UNKNOWN'}`}
            subtitle="Compliance, inventory, access, and kill-switch operations."
            code="O"
            variant="ops"
            role="Operations and GDPR Robot"
            pillarKey="ops"
            execution={executionState?.ops}
            onTaskExecute={onTaskExecute}
            checklist={checklistMap.ops}
            className="agent-cell--sidebar"
          />
        </div>
      </section>
    </section>
  )
}
