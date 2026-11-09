/**
 * inspect_groq.mjs
 * Quick connectivity test for the configured LLM endpoint (Groq / OpenAI-compatible).
 * Usage: GROQ_API_KEY=<key> node scripts/inspect_groq.mjs
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// ---------------------------------------------------------------------------
// Config — read from environment only, never hardcoded
// ---------------------------------------------------------------------------
const GROQ_KEY = process.env.GROQ_API_KEY || ''
const BASE_URL = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1'
const MODEL    = process.env.LLM_MODEL    || 'llama3-8b-8192'

if (!GROQ_KEY) {
  console.error('[ERROR] GROQ_API_KEY environment variable is not set.')
  console.error('        Set it in .env.local or export it before running this script.')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Test payload — read from CLI arg or use a minimal default
// ---------------------------------------------------------------------------
const userQuery = process.argv[2] || 'Respond with a single sentence confirming the LLM is reachable.'

async function testLLM() {
  console.log(`[INFO] Endpoint : ${BASE_URL}/chat/completions`)
  console.log(`[INFO] Model    : ${MODEL}`)
  console.log(`[INFO] Query    : ${userQuery}\n`)

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: userQuery }],
      temperature: 0.1,
      max_tokens: 256,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`[ERROR] HTTP ${res.status}: ${err}`)
    process.exit(1)
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content ?? '(empty response)'
  console.log('[RESPONSE]')
  console.log(reply)
  console.log(`\n[TOKENS] ${data.usage?.total_tokens ?? 'n/a'} total`)
}

testLLM().catch((err) => {
  console.error('[FATAL]', err.message)
  process.exit(1)
})
