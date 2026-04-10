import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

function maybeRepairEncoding(text) {
  if (!text || !/[Ãâ]/.test(text)) {
    return text
  }

  return Buffer.from(text, 'latin1').toString('utf8')
}

function asNumber(value) {
  if (value == null) {
    return 0
  }

  return Number(String(value).replace(/[^\d.-]/g, '')) || 0
}

function cleanMarkdown(value) {
  return String(value || '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .trim()
}

async function readText(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  return maybeRepairEncoding(raw)
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath))
}

function matchValue(text, expression) {
  return text.match(expression)?.[1]?.trim() ?? ''
}

function extractSection(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expression = new RegExp(
    `## ${escaped}\\r?\\n([\\s\\S]*?)(?=\\r?\\n## |\\r?\\n\`\`\`|$)`,
  )
  return text.match(expression)?.[1]?.trim() ?? ''
}

function parseMarkdownTable(section) {
  const lines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))

  if (lines.length < 2) {
    return []
  }

  const headers = lines[0]
    .split('|')
    .map((cell) => cleanMarkdown(cell))
    .filter(Boolean)

  return lines.slice(2).map((line) => {
    const values = line
      .split('|')
      .map((cell) => cleanMarkdown(cell))
      .filter(Boolean)

    return headers.reduce((row, header, index) => {
      const key = header
        .toLowerCase()
        .replace(/[()]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase())
      row[key] = values[index] ?? ''
      return row
    }, {})
  })
}

function parseBulletValue(section, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return matchValue(section, new RegExp(`- ${escaped}:\\s*(.+)$`, 'm'))
}

function parseAgents(text) {
  return {
    company: {
      name: matchValue(text, /^  name:\s*(.+)$/m),
      city: matchValue(text, /^  city:\s*(.+)$/m),
      entityType: matchValue(text, /^  entity_type:\s*(.+)$/m),
      shareCapital: asNumber(matchValue(text, /^  share_capital_eur:\s*(.+)$/m)),
    },
    founder: {
      name: matchValue(text, /^  full_legal_name:\s*(.+)$/m),
      address: matchValue(text, /^  residential_address:\s*(.+)$/m),
      role: matchValue(text, /^  role:\s*(.+)$/m),
    },
    workflow: {
      notaryPacket: matchValue(text, /^  step_3_notary_packet:\s*(.+)$/m),
      eidStatus: matchValue(text, /^  eid_status:\s*(.+)$/m),
      bankAccountReady:
        matchValue(text, /^  bank_account_ready:\s*(.+)$/m) === 'true',
    },
    finance: {
      pillarStatus: matchValue(text, /^finance:\s*$[\s\S]*?^  pillar_status:\s*(.+)$/m),
      currentBalance: asNumber(matchValue(text, /^  current_balance_eur:\s*(.+)$/m)),
      monthlyBurn: asNumber(matchValue(text, /^  monthly_burn_eur:\s*(.+)$/m)),
      runwayMonths: asNumber(matchValue(text, /^  runway_months:\s*(.+)$/m)),
      zeroCashDate: matchValue(text, /^  zero_cash_date:\s*(.+)$/m),
      healthStatus: matchValue(text, /^  health_status:\s*(.+)$/m),
      strategy: matchValue(text, /^  strategy:\s*(.+)$/m),
    },
    talent: {
      hiredCandidate: matchValue(text, /^  hired_candidate:\s*(.+)$/m),
      candidateStatus: matchValue(text, /^  candidate_status:\s*(.+)$/m),
      targetRole: matchValue(text, /^  target_role:\s*(.+)$/m),
    },
    ops: {
      pillarStatus: matchValue(text, /^ops:\s*$[\s\S]*?^  pillar_status:\s*(.+)$/m),
      githubSccStatus: matchValue(text, /^  github_scc_status:\s*(.+)$/m),
    },
    product: {
      pillarStatus: matchValue(text, /^product:\s*$[\s\S]*?^  pillar_status:\s*(.+)$/m),
      autonomyBetaStatus: matchValue(text, /^  autonomy_beta_status:\s*(.+)$/m),
      julyTrancheStatus: matchValue(text, /^  july_tranche_status:\s*(.+)$/m),
    },
  }
}

function parseForecast(text) {
  const cashSection = extractSection(text, 'Cash Position')
  const burnSection = extractSection(text, 'Burn Breakdown')
  const scenarioSection = extractSection(text, 'Scenario Planning')
  const capitalSection = extractSection(text, 'Capital Influx Plan')

  return {
    currentBalance: asNumber(parseBulletValue(cashSection, 'Starting balance')),
    monthlyBurn: asNumber(parseBulletValue(cashSection, 'Monthly burn')),
    runwayMonths:
      Number(parseBulletValue(cashSection, 'Runway').replace(/[^\d.]/g, '')) || 0,
    zeroCashDate: parseBulletValue(cashSection, 'Zero cash date'),
    healthStatus: parseBulletValue(cashSection, 'Health status'),
    burnBreakdown: parseMarkdownTable(burnSection),
    scenarios: parseMarkdownTable(scenarioSection),
    julyGrantStatus: parseBulletValue(capitalSection, 'July Grant status'),
  }
}

function firstNumber(...values) {
  for (const value of values) {
    if (Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return 0
}

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function parseToolStack(text) {
  const scoreSection = extractSection(text, 'Compliance Score')
  const passedToolsRaw = parseBulletValue(scoreSection, 'Passed tools')
  const [passedRaw = '0', totalRaw = '0'] = passedToolsRaw.split('/')

  return {
    stack: parseMarkdownTable(extractSection(text, 'Current Stack')).map((row) => ({
      tool: row.tool,
      dpa: row.dpa,
      residency: row.residency,
      auditStatus: row.auditStatus,
      evidence: row.evidence,
      notes: row.notes,
    })),
    passedTools: asNumber(passedRaw),
    totalTools: asNumber(totalRaw),
    warningTools: parseBulletValue(scoreSection, 'Tools with warning state'),
    seatsFreed: asNumber(
      parseBulletValue(
        extractSection(text, 'Seat Recovery'),
        'GitHub seats freed by offboarding dry run',
      ),
    ),
  }
}

function parseInventory(text) {
  return parseMarkdownTable(text).map((row) => ({
    assetId: row.assetId,
    assetType: row.assetType,
    assignedTo: row.assignedTo,
    assignmentStatus: row.assignmentStatus,
    notes: row.notes,
  }))
}

function parseRoadmap(text) {
  return parseMarkdownTable(extractSection(text, 'Milestones Linked to Funding')).map(
    (row) => ({
      name: row.milestone,
      targetWindow: row.targetWindow,
      fundingLink: row.fundingLink,
      outcome: row.outcome,
    }),
  )
}

function parsePersonnelFile(text) {
  return parseMarkdownTable(extractSection(text, 'Big Three Onboarding Documents')).map(
    (row) => ({
      name: row.document,
      status: row.status,
      notes: row.notes,
    }),
  )
}

function withCandidateStatus(candidate, hiredCandidate, employeeStatus, hiringRows) {
  const hiringRow = hiringRows.find((row) => row.candidate === candidate.name)
  const recommendation = hiringRow?.recommendation || 'REVIEW'

  let status = 'PIPELINE'
  if (candidate.name === hiredCandidate) {
    status = employeeStatus
  } else if (recommendation.toUpperCase().includes('REJECT')) {
    status = 'REJECTED'
  }

  return {
    ...candidate,
    matchScore: hiringRow?.matchScore || '0%',
    recommendation,
    status,
  }
}

function buildQuestBoard(payload) {
  const missingHiringDocs = payload.hiring.documents.filter((document) =>
    String(document.status).toUpperCase().includes('MISSING'),
  )
  const quests = []

  if (payload.ops.githubSccStatus !== 'SIGNED') {
    quests.push({
      id: 'sign-github-scc',
      pillar: 'Ops',
      priority: 'High',
      title: 'Sign the GitHub SCC',
      summary:
        'GitHub is still running under a drafted SCC package. Founder approval is needed before the compliance warning can fully settle.',
      actionLabel: 'Execute',
      executionType: 'manual',
      detailPath: 'legal/GDPR/SCC_GitHub_Transfer.md',
    })
  }

  if (payload.legal.notaryStatus === 'READY' && payload.legal.eidStatus === 'ACTIVE') {
    quests.push({
      id: 'approve-notary-booking',
      pillar: 'Legal',
      priority: 'High',
      title: 'Approve Notary Booking',
      summary:
        'The formation packet is ready and your eID is active. The only thing left here is a founder approval to book the online notary slot.',
      actionLabel: 'Execute',
      executionType: 'manual',
      detailPath: 'legal/EXECUTION_CHECKLIST.md',
      detailUrl: 'https://online.notar.de/',
    })
  }

  quests.push({
    id: 'sync-cap-table',
    pillar: 'Legal / Finance',
    priority: 'Medium',
    title: 'Sync Cap Table',
    summary:
      'Re-run the founder equity sync so the legal ownership record stays aligned with bookkeeping.',
    actionLabel: 'Execute',
    executionType: 'script',
  })

  if (payload.product.julyGrantStatus === 'CLAIM_READY') {
    quests.push({
      id: 'claim-july-grant',
      pillar: 'Product / Finance',
      priority: 'High',
      title: 'Claim July Grant Tranche',
      summary:
        'Autonomy Beta evidence is present, so the tranche trigger can be verified and surfaced for the Finance pillar.',
      actionLabel: 'Execute',
      executionType: 'script',
    })
  }

  quests.push({
    id: 'rerun-compliance-audit',
    pillar: 'Ops',
    priority: 'Medium',
    title: 'Re-run Compliance Audit',
    summary:
      'Refresh the DPA and residency audit to confirm the current stack still passes after the latest changes.',
    actionLabel: 'Execute',
    executionType: 'script',
  })

  if (payload.hiring.employeeStatus === 'ONBOARDED_SUCCESS' || missingHiringDocs.length > 0) {
    quests.push({
      id: 'verify-alpha-onboarding',
      pillar: 'Hiring / Ops',
      priority: missingHiringDocs.length > 0 ? 'High' : 'Medium',
      title: 'Verify Alpha Onboarding',
      summary:
        missingHiringDocs.length > 0
          ? `Alpha still has ${missingHiringDocs.length} onboarding document gap(s), so re-check provisioning and keep the follow-up path visible.`
          : 'Alpha is onboarded; rerun the automation to verify the hardware and access map stayed intact.',
      actionLabel: 'Execute',
      executionType: 'script',
    })
  }

  return quests
}

async function runPythonScript(workspaceRoot, relativeScriptPath) {
  let processResult

  try {
    processResult = await execFileAsync('python', [relativeScriptPath], {
      cwd: workspaceRoot,
    })
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      processResult = await execFileAsync('py', ['-3', relativeScriptPath], {
        cwd: workspaceRoot,
      })
    } else {
      throw error
    }
  }

  const { stdout, stderr } = processResult

  const output = `${stdout || ''}${stderr || ''}`.trim()

  try {
    return {
      kind: 'json',
      output: JSON.parse(output),
      raw: output,
    }
  } catch {
    return {
      kind: 'text',
      output,
      raw: output,
    }
  }
}

export async function executeQuest(workspaceRoot, questId) {
  const manualActions = {
    'sign-github-scc': {
      type: 'manual',
      message:
        'Review the SCC draft, finalize the founder sign-off, and retain the signed version in the DPA vault.',
      detailPath: 'legal/GDPR/SCC_GitHub_Transfer.md',
    },
    'approve-notary-booking': {
      type: 'manual',
      message:
        'Open the execution packet, confirm the notary choice, and proceed to the online booking flow.',
      detailPath: 'legal/EXECUTION_CHECKLIST.md',
      detailUrl: 'https://online.notar.de/',
    },
  }

  if (manualActions[questId]) {
    return {
      questId,
      status: 'MANUAL_ACTION_REQUIRED',
      ...manualActions[questId],
    }
  }

  const scriptMap = {
    'sync-cap-table': '.agents/skills/legal-ops/scripts/cap_table_sync.py',
    'claim-july-grant': 'product/scripts/milestone_check.py',
    'rerun-compliance-audit': '.agents/skills/ops-ops/scripts/compliance_audit.py',
    'verify-alpha-onboarding': '.agents/skills/ops-ops/scripts/onboarding_sync.py',
  }

  const scriptPath = scriptMap[questId]

  if (!scriptPath) {
    throw new Error(`Unknown quest id: ${questId}`)
  }

  const result = await runPythonScript(workspaceRoot, scriptPath)

  return {
    questId,
    status: 'EXECUTED',
    type: 'script',
    scriptPath,
    result,
  }
}

export async function buildStartupOsPayload(workspaceRoot) {
  const [
    agentsText,
    forecastText,
    inventoryText,
    toolStackText,
    hiringStatsText,
    roadmapText,
    capTable,
    alphaCandidate,
    betaCandidate,
    personnelText,
    sourceFiles,
  ] = await Promise.all([
    readText(path.join(workspaceRoot, 'agents.md')),
    readText(path.join(workspaceRoot, 'finance', 'FORECAST.md')),
    readText(path.join(workspaceRoot, 'ops', 'INVENTORY.md')),
    readText(path.join(workspaceRoot, 'ops', 'TOOL_STACK.md')),
    readText(path.join(workspaceRoot, 'people', 'HIRING_STATS.md')),
    readText(path.join(workspaceRoot, 'product', 'ROADMAP.md')),
    readJson(path.join(workspaceRoot, 'legal', 'CAP_TABLE.json')),
    readJson(path.join(workspaceRoot, 'people', 'candidates', 'Candidate_Alpha.json')),
    readJson(path.join(workspaceRoot, 'people', 'candidates', 'Candidate_Beta.json')),
    readText(
      path.join(workspaceRoot, 'people', 'employees', 'Candidate_Alpha', 'DIGITAL_FILE.md'),
    ),
    fs.readdir(path.join(workspaceRoot, 'src', 'autonomy_core')),
  ])

  const agents = parseAgents(agentsText)
  const forecast = parseForecast(forecastText)
  const hiringRows = parseMarkdownTable(extractSection(hiringStatsText, 'Candidate Breakdown')).map(
    (row) => ({
      candidate: row.candidate,
      location: row.location,
      matchScore: row.matchScore,
      missingSkills: row.missingSkills,
      recommendation: row.recommendation,
    }),
  )
  const toolStack = parseToolStack(toolStackText)

  const payload = {
    company: agents.company,
    founder: agents.founder,
    legal: {
      notaryStatus: agents.workflow.notaryPacket,
      eidStatus: agents.workflow.eidStatus,
      capTable,
      bankAccountReady: agents.workflow.bankAccountReady,
    },
    finance: {
      ...forecast,
      currentBalance: firstNumber(forecast.currentBalance, agents.finance.currentBalance),
      monthlyBurn: firstNumber(forecast.monthlyBurn, agents.finance.monthlyBurn),
      runwayMonths: firstNumber(forecast.runwayMonths, agents.finance.runwayMonths),
      zeroCashDate: firstText(forecast.zeroCashDate, agents.finance.zeroCashDate),
      healthStatus: firstText(forecast.healthStatus, agents.finance.healthStatus),
      strategy: firstText(agents.finance.strategy, forecast.strategy),
    },
    hiring: {
      employeeStatus: agents.talent.candidateStatus,
      hiredCandidate: agents.talent.hiredCandidate,
      targetRole: agents.talent.targetRole,
      candidates: [
        withCandidateStatus(
          alphaCandidate,
          agents.talent.hiredCandidate,
          agents.talent.candidateStatus,
          hiringRows,
        ),
        withCandidateStatus(
          betaCandidate,
          agents.talent.hiredCandidate,
          agents.talent.candidateStatus,
          hiringRows,
        ),
      ],
      documents: parsePersonnelFile(personnelText),
    },
    product: {
      overallStatus: agents.product.pillarStatus,
      autonomyBetaStatus: agents.product.autonomyBetaStatus,
      julyGrantStatus: agents.product.julyTrancheStatus || forecast.julyGrantStatus,
      milestones: parseRoadmap(roadmapText).slice(0, 4),
      sourceFiles: sourceFiles.filter((file) => file.endsWith('.py')),
    },
    ops: {
      overallStatus: agents.ops.pillarStatus,
      githubSccStatus: agents.ops.githubSccStatus,
      inventory: parseInventory(inventoryText),
      ...toolStack,
    },
  }

  return {
    ...payload,
    quests: buildQuestBoard(payload),
  }
}
