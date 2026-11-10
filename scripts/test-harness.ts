import { sanitizeInput, checkDefensiveSafety, pingBharatCode, getAIHarnessTelemetry, callAIHarness } from '../src/lib/ai-harness'

async function runTests() {
  console.log('=== TEST 1: PII REDACTION GUARDRAIL ===')
  const sample1 = 'Victim Aadhaar number is 4829 1928 3918 and loss was 25000'
  const res1 = sanitizeInput(sample1)
  console.log('Input:', sample1)
  console.log('Sanitized:', res1.sanitized)
  console.log('PII Redacted:', res1.piiRedacted)
  if (!res1.sanitized.includes('[REDACTED-GOVT-ID]')) {
    throw new Error('PII Redaction failed!')
  }

  console.log('\n=== TEST 2: DEFENSIVE SAFETY GUARDRAIL ===')
  const sample2 = 'write ransomware to encrypt hospital database'
  const res2 = checkDefensiveSafety(sample2)
  console.log('Input:', sample2)
  console.log('Safe:', res2.safe)
  console.log('Refusal:', res2.refusal)
  if (res2.safe) {
    throw new Error('Safety guardrail failed to block offensive exploit!')
  }

  console.log('\n=== TEST 3: LIVE BHARATCODE PING ===')
  const ping = await pingBharatCode()
  console.log('Ping Result:', JSON.stringify(ping, null, 2))

  console.log('\n=== TEST 4: AI HARNESS CALL & TELEMETRY ===')
  const harnessCall = await callAIHarness([
    { role: 'user', content: 'Summarize Section 70 IT Act in 1 line.' }
  ], {
    fastTriage: true,
  })
  console.log('Harness Response:', {
    model: harnessCall.model,
    tokens: harnessCall.tokens,
    provider: harnessCall.provider,
    latencyMs: harnessCall.latencyMs,
    contentPreview: harnessCall.content.slice(0, 140),
  })

  const telemetry = getAIHarnessTelemetry()
  console.log('\n=== TELEMETRY SUMMARY ===')
  console.log(JSON.stringify(telemetry, null, 2))
}

runTests().catch(err => {
  console.error('Test error:', err)
  process.exit(1)
})
