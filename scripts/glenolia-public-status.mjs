#!/usr/bin/env node
// Five read-only requests to an explicit public allowlist; never submits a form.
const origin = 'https://theglenolia.com.au'
const paths = ['/', '/teachers/', '/progress/', '/robots.txt', '/api/v1/content.json']
const results = []
for (const pathname of paths) {
  const started = Date.now()
  try {
    const response = await fetch(origin + pathname, { redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'GlenoliaOwnerReadOnlyCheck/1.0' } })
    const text = await response.text()
    const row = { pathname, status: response.status, contentType: response.headers.get('content-type'), bytes: Buffer.byteLength(text), durationMs: Date.now() - started }
    if (pathname.endsWith('.json') && response.ok) {
      const feed = JSON.parse(text)
      row.schemaVersion = feed.schemaVersion
      row.updatedAt = feed.updatedAt
      row.canonicalOriginMatches = feed.canonicalOrigin === origin
    }
    row.ok = response.status === 200 && row.bytes > 0
    results.push(row)
  } catch { results.push({ pathname, ok: false, error: 'Request failed or timed out; inspect connectivity before retrying.' }) }
}
console.log(JSON.stringify({ type: 'observed-public-http-check', checkedAt: new Date().toISOString(), method: 'GET', formSubmissions: 0, modelCalls: 0, results }, null, 2))
if (results.some(result => !result.ok)) process.exitCode = 1
