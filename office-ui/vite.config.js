import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { buildStartupOsPayload, executeQuest } from './server/startup-os.js'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(currentDirectory, '..')

function startupOsApi() {
  async function handleStateRequest(request, response, next) {
    if (request.method !== 'GET') {
      next()
      return
    }

    try {
      const payload = await buildStartupOsPayload(workspaceRoot)
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.setHeader('Cache-Control', 'no-store')
      response.end(JSON.stringify(payload))
    } catch (error) {
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json')
      response.setHeader('Cache-Control', 'no-store')
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    }
  }

  async function readBody(request) {
    const chunks = []
    for await (const chunk of request) {
      chunks.push(chunk)
    }

    if (!chunks.length) {
      return {}
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  }

  async function handleQuestExecution(request, response, next) {
    if (request.method !== 'POST') {
      next()
      return
    }

    try {
      const body = await readBody(request)
      const result = await executeQuest(workspaceRoot, body.questId)
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(result))
    } catch (error) {
      response.statusCode = 500
      response.setHeader('Content-Type', 'application/json')
      response.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
      )
    }
  }

  return {
    name: 'startup-os-api',
    configureServer(server) {
      server.middlewares.use('/api/startup-os', handleStateRequest)
      server.middlewares.use('/api/quests/execute', handleQuestExecution)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/startup-os', handleStateRequest)
      server.middlewares.use('/api/quests/execute', handleQuestExecution)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), startupOsApi()],
})
