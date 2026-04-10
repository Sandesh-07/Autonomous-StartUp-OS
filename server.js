import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { exec } from 'node:child_process'

const app = express()
const PORT = 3001
const WORKSPACE_ROOT = process.cwd()

app.use(cors())
app.use(express.json())

function toScriptCommand(scriptPath, args = []) {
  const normalizedPath = path.normalize(scriptPath)

  if (path.isAbsolute(normalizedPath)) {
    throw new Error('scriptPath must be relative to the project root')
  }

  const resolvedPath = path.resolve(WORKSPACE_ROOT, normalizedPath)
  const relativeFromRoot = path.relative(WORKSPACE_ROOT, resolvedPath)

  if (relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot)) {
    throw new Error('scriptPath must stay within the project root')
  }

  if (path.extname(resolvedPath).toLowerCase() !== '.py') {
    throw new Error('Only Python scripts are allowed')
  }

  const escapedPath = `"${resolvedPath.replace(/"/g, '\\"')}"`
  const escapedArgs = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ')

  return {
    resolvedPath,
    command: `python ${escapedPath}${escapedArgs ? ` ${escapedArgs}` : ''}`,
  }
}

app.post('/api/execute', (req, res) => {
  const { scriptPath, args = [] } = req.body ?? {}

  if (!scriptPath || typeof scriptPath !== 'string') {
    return res.status(400).json({ error: 'scriptPath is required' })
  }

  if (!Array.isArray(args)) {
    return res.status(400).json({ error: 'args must be an array' })
  }

  let scriptCommand

  try {
    scriptCommand = toScriptCommand(scriptPath, args)
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : String(error),
    })
  }

  exec(
    scriptCommand.command,
    {
      cwd: WORKSPACE_ROOT,
      maxBuffer: 1024 * 1024,
    },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({
          error: stderr?.trim() || error.message,
          scriptPath,
        })
      }

      return res.json({
        scriptPath,
        stdout: stdout.trim(),
      })
    },
  )
})

app.listen(PORT, () => {
  console.log(`API bridge listening on http://localhost:${PORT}`)
})
