import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { configStatus, readConfig, runtimeEnv, SETTINGS } from './glenolia.mjs'

test('blank provider configuration fails closed without printing values', () => {
  const result = configStatus({ SECRET_KEY: 'x'.repeat(64) })
  assert.equal(result.configured, false)
  assert.deepEqual(result.missing, ['LLM_API_KEY', 'LLM_BASE_URL', 'LLM_MODEL_NAME', 'ZEP_API_KEY'])
})
test('unrelated inherited credentials and exposure settings do not reach the local app', () => {
  const result = runtimeEnv({}, { HOME: '/tmp/test-home', PATH: '/bin', LLM_API_KEY: 'unrelated-private-value', AWS_SECRET_ACCESS_KEY: 'unrelated', FLASK_HOST: '0.0.0.0', FLASK_DEBUG: 'True' })
  assert.equal(result.LLM_API_KEY, undefined)
  assert.equal(result.AWS_SECRET_ACCESS_KEY, undefined)
  assert.equal(result.FLASK_HOST, '127.0.0.1')
  assert.equal(result.FLASK_DEBUG, 'False')
  assert.equal(result.VITE_API_BASE_URL, '/')
  assert.equal(SETTINGS.frontendPort, 3300)
  assert.equal(SETTINGS.backendPort, 5501)
})
test('provider endpoint cannot contain URL credentials or a remote plaintext address', () => {
  for (const url of ['https://name:password@example.com/v1', 'https://example.com/v1?key=secret', 'http://example.com/v1']) {
    assert.ok(configStatus({ LLM_BASE_URL: url, SECRET_KEY: 'x'.repeat(64) }).issues.length > 0)
  }
  assert.equal(configStatus({ LLM_BASE_URL: 'http://127.0.0.1:8080/v1', SECRET_KEY: 'x'.repeat(64) }).issues.length, 0)
})
test('local configuration requires a regular owner-only file and preserves quoted values', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mirofish-config-test-'))
  try {
    const file = path.join(dir, 'private.env')
    fs.writeFileSync(file, "LLM_MODEL_NAME='example model'\nLLM_API_KEY=not-a-real-test-key # comment\n", { mode: 0o600 })
    assert.equal(readConfig(file).LLM_MODEL_NAME, 'example model')
    fs.chmodSync(file, 0o644)
    assert.throws(() => readConfig(file), /owner-only/)
    fs.chmodSync(file, 0o600)
    fs.symlinkSync(file, path.join(dir, 'link.env'))
    assert.throws(() => readConfig(path.join(dir, 'link.env')), /regular local file/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})
