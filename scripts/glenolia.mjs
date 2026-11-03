#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import net from 'node:net'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PRIVATE_ENV = path.join(ROOT, 'private.env')
export const SETTINGS = Object.freeze({ host: '127.0.0.1', frontendPort: 3300, backendPort: 5501, debug: false })
const REQUIRED = ['LLM_API_KEY', 'LLM_BASE_URL', 'LLM_MODEL_NAME', 'ZEP_API_KEY']

export function readConfig(file = PRIVATE_ENV) {
  if (!fs.existsSync(file)) return {}
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('private.env must be a regular local file.')
  if ((stat.mode & 0o077) !== 0) throw new Error('private.env must have owner-only permissions (chmod 600 private.env).')
  const result = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    else value = value.replace(/\s+#.*$/, '').trim()
    result[match[1]] = value
  }
  return result
}

export function configStatus(config) {
  const missing = REQUIRED.filter(key => !config[key] || /^(your[_ -]|replace|example|todo|<)/i.test(config[key]))
  const issues = []
  if (config.LLM_BASE_URL) {
    try {
      const url = new URL(config.LLM_BASE_URL)
      if (url.username || url.password || url.search || url.hash) issues.push('LLM_BASE_URL must not contain credentials, query strings or fragments.')
      if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname))) issues.push('Use HTTPS for a remote model endpoint.')
    } catch { issues.push('LLM_BASE_URL is not a valid endpoint URL.') }
  }
  if (!config.SECRET_KEY || config.SECRET_KEY.length < 32) issues.push('Generate a private SECRET_KEY with the init command.')
  if (config.ZEP_API_URL) issues.push('This upstream release requires Zep Cloud, not ZEP_API_URL.')
  return { configured: missing.length === 0 && issues.length === 0, missing, issues }
}

export function runtimeEnv(config = {}, parent = process.env) {
  const env = {}
  // Do not reuse API keys or cloud credentials inherited from another project.
  for (const key of ['HOME', 'PATH', 'TMPDIR', 'TEMP', 'TMP', 'LANG', 'LC_ALL', 'SYSTEMROOT']) if (parent[key]) env[key] = parent[key]
  for (const key of ['LLM_API_KEY', 'LLM_BASE_URL', 'LLM_MODEL_NAME', 'ZEP_API_KEY', 'SECRET_KEY', 'OASIS_DEFAULT_MAX_ROUNDS', 'REPORT_AGENT_MAX_TOOL_CALLS', 'REPORT_AGENT_MAX_REFLECTION_ROUNDS']) if (config[key]) env[key] = config[key]
  env.MIROFISH_ENV_FILE = PRIVATE_ENV
  env.FLASK_HOST = SETTINGS.host
  env.FLASK_PORT = String(SETTINGS.backendPort)
  env.FLASK_DEBUG = 'False'
  env.VITE_API_BASE_URL = '/'
  env.VITE_DEFAULT_LOCALE = 'en'
  return env
}

export function inspectRuntime(root = ROOT) {
  const python = path.join(root, 'backend', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python')
  const vite = path.join(root, 'frontend', 'node_modules', 'vite', 'bin', 'vite.js')
  const [major, minor] = process.versions.node.split('.').map(Number)
  const nodeSupported = major > 22 || (major === 22 && minor >= 12) || (major === 20 && minor >= 19)
  const checks = { node: process.versions.node, nodeSupported, pythonInstalled: fs.existsSync(python), frontendInstalled: fs.existsSync(vite) }
  if (checks.pythonInstalled) {
    const result = spawnSync(python, ['-c', 'import sys, flask, flask_cors, openai, zep_cloud; print(sys.version.split()[0])'], { encoding: 'utf8', env: runtimeEnv({}), timeout: 30000 })
    checks.pythonImports = result.status === 0
    checks.pythonVersion = result.status === 0 ? result.stdout.trim() : 'import check failed; inspect the isolated environment'
  }
  return { checks, python, vite }
}

async function portFree(port) {
  return await new Promise(resolve => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.listen(port, SETTINGS.host, () => server.close(() => resolve(true)))
  })
}

export function initConfig() {
  if (fs.existsSync(PRIVATE_ENV)) return false
  const template = fs.readFileSync(path.join(ROOT, 'glenolia.env.example'), 'utf8')
  fs.writeFileSync(PRIVATE_ENV, template.replace(/^SECRET_KEY=$/m, `SECRET_KEY=${crypto.randomBytes(32).toString('hex')}`), { mode: 0o600, flag: 'wx' })
  return true
}

export async function main(args = process.argv.slice(2)) {
  const command = args[0] || 'preflight'
  if (command === 'init') {
    console.log(initConfig() ? 'Created private.env with blank provider keys and owner-only permissions. Edit it locally; never paste keys in chat.' : 'private.env already exists and was preserved.')
    return 0
  }
  const config = readConfig()
  const status = configStatus(config)
  const { checks, python, vite } = inspectRuntime()
  if (command === 'preflight') {
    console.log(JSON.stringify({ mode: 'local-only', settings: SETTINGS, runtime: checks, providerConfiguration: status, externalCallsMade: false, simulationRun: false }, null, 2))
    return status.configured && checks.nodeSupported && checks.pythonImports && checks.frontendInstalled ? 0 : 2
  }
  if (!['start', 'frontend'].includes(command)) throw new Error('Use init, preflight, frontend or start.')
  if (!checks.nodeSupported || !checks.frontendInstalled || !checks.pythonImports) throw new Error('Use a supported Node version and install the locked dependencies first; see README_GLENOLIA.md.')
  if (command === 'start' && !status.configured) {
    console.log('Configuration is incomplete. Run preflight. The backend was not started and no provider call was made.')
    return 2
  }
  for (const port of command === 'start' ? [3300, 5501] : [3300]) if (!await portFree(port)) throw new Error(`Loopback port ${port} is already in use; no existing process was stopped.`)
  const env = runtimeEnv(config)
  const children = []
  let stopping = false
  const stop = () => { if (stopping) return; stopping = true; for (const child of children) child.kill('SIGTERM') }
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, stop)
  if (command === 'start') children.push(spawn(python, [path.join(ROOT, 'scripts/glenolia-backend.py')], { cwd: ROOT, env, stdio: 'inherit' }))
  children.push(spawn(process.execPath, [vite, '--config', 'vite.glenolia.config.js'], { cwd: path.join(ROOT, 'frontend'), env, stdio: 'inherit' }))
  console.log('MiroFish local frontend: http://127.0.0.1:3300/ (English default).')
  console.log(command === 'frontend' ? 'Frontend preview only: no backend, model or Zep service is running.' : 'Backend: http://127.0.0.1:5501/. Starting the app does not approve a simulation budget.')
  await new Promise(resolve => {
    let remaining = children.length
    for (const child of children) {
      child.once('error', () => { stop(); resolve() })
      child.once('exit', () => { remaining--; stop(); if (!remaining) resolve() })
    }
  })
  return 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code }).catch(error => { console.error(error.message); process.exitCode = 1 })
}
