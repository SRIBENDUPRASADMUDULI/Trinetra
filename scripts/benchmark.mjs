import fs from 'fs'

const GOOGLE_KEY = process.env.GOOGLE_KEY || process.env.GEMINI_API_KEY || ''
const GROQ_KEY = process.env.GROQ_API_KEY || ''

const LEGAL_TEST_CASES = [
  {
    id: 'TC-01',
    type: 'UPI Phishing & Impersonation',
    narrative: 'Victim received SMS claiming electricity power cut. Clicked link, fake portal collected UPI PIN, and Rs 45,000 was debited.',
    expectedLaws: ['318', '66D'],
    category: 'Financial Fraud'
  },
  {
    id: 'TC-02',
    type: 'Ransomware Extortion',
    narrative: 'Hospital PACS imaging server infected with LockBit 3.0. 800GB files encrypted, 1.5 BTC demanded or patient data will be leaked.',
    expectedLaws: ['303', '66', '43'],
    category: 'Extortion / Hacking'
  },
  {
    id: 'TC-03',
    type: 'SIM Swap & Corporate Identity Theft',
    narrative: 'Attacker used forged Aadhaar to clone victim SIM card with telecom provider, intercepted netbanking OTP, and drained Rs 2,50,000.',
    expectedLaws: ['319', '66C', '66D'],
    category: 'Identity Theft'
  },
  {
    id: 'TC-04',
    type: 'Privacy Violation / Cyber Voyeurism',
    narrative: 'Attacker gained unauthorized access to home surveillance camera feed and published intimate photos without consent on Telegram.',
    expectedLaws: ['66E', '67'],
    category: 'Privacy Violation'
  },
  {
    id: 'TC-05',
    type: 'Critical Infrastructure Cyber Attack',
    narrative: 'State electricity load dispatch SCADA network targeted by malware attempting to trip substation breakers and cause grid blackout.',
    expectedLaws: ['66F', '113'],
    category: 'Cyber Terrorism'
  },
]

const URL_TEST_CASES = [
  { url: 'http://sbi-kyc-update-portal.xyz/verify?acc=998827', expectedMalicious: true, label: 'Typosquatted Bank with .xyz' },
  { url: 'http://185.220.101.47:8080/secure/login.php', expectedMalicious: true, label: 'Raw IP Address + Non-standard Port' },
  { url: 'http://incometax-refund-claim.site/pan?ref=92841', expectedMalicious: true, label: 'Fake Govt Tax Refund' },
  { url: 'http://www.google-security-verify.top/auth', expectedMalicious: true, label: 'Spoofed Brand on .top TLD' },
  { url: 'http://xn--pypal-4ve.com/signin', expectedMalicious: true, label: 'Punycode Homoglyph PayPal' },
  { url: 'https://www.onlinesbi.sbi', expectedMalicious: false, label: 'Genuine State Bank of India' },
  { url: 'https://incometax.gov.in', expectedMalicious: false, label: 'Official Income Tax Portal' },
  { url: 'https://cert-in.org.in', expectedMalicious: false, label: 'Official CERT-In Portal' },
  { url: 'https://github.com/thenabbu/cyber-ir-api', expectedMalicious: false, label: 'Legitimate GitHub Repository' },
  { url: 'https://npci.org.in', expectedMalicious: false, label: 'Official NPCI Portal' },
]

function calculateEntropy(str) {
  const freq = {}
  for (const c of str) freq[c] = (freq[c] || 0) + 1
  let e = 0
  for (const cnt of Object.values(freq)) {
    const p = cnt / str.length
    e -= p * Math.log2(p)
  }
  return e
}

function evaluateUrlRisk(url) {
  let score = 0
  const isIp = /^https?:\/\/(\d{1,3}\.){3}\d{1,3}/.test(url)
  const isHighRiskTld = /\.(xyz|top|site|click|online|live|club|pw|loan)\b/i.test(url)
  const hasHomoglyph = url.includes('xn--') || /[\u0400-\u04FF]/.test(url)
  const hasPort = /:\d{4,5}\//.test(url)
  const entropy = calculateEntropy(url)

  if (isIp) score += 35
  if (isHighRiskTld) score += 30
  if (hasHomoglyph) score += 35
  if (hasPort) score += 15
  if (entropy > 4.2) score += 20

  return {
    score: Math.min(100, score),
    isMalicious: score >= 40,
    entropy: entropy.toFixed(2),
  }
}

async function queryGemma4(prompt) {
  const t0 = Date.now()
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${GOOGLE_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
    }),
    signal: AbortSignal.timeout(10000)
  })
  const data = await res.json()
  const latency = Date.now() - t0
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return { content, latency }
}

async function queryGroq120B(prompt) {
  const t0 = Date.now()
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300
    }),
    signal: AbortSignal.timeout(10000)
  })
  const data = await res.json()
  const latency = Date.now() - t0
  const content = data.choices?.[0]?.message?.content || ''
  return { content, latency }
}

async function runBenchmark() {
  console.log('=== STARTING EMPIRICAL BENCHMARK SUITE ===\n')

  // 1. Lexical URL Engine
  console.log('--- 1. Evaluating Lexical / Heuristic URL Engine ---')
  let urlCorrect = 0
  for (const tc of URL_TEST_CASES) {
    const res = evaluateUrlRisk(tc.url)
    const passed = res.isMalicious === tc.expectedMalicious
    if (passed) urlCorrect++
  }
  const urlAcc = (urlCorrect / URL_TEST_CASES.length) * 100
  console.log(`URL Risk Engine Accuracy: ${urlAcc}% (${urlCorrect}/${URL_TEST_CASES.length})\n`)

  // 2. Gemma 4 Legal Accuracy
  console.log('--- 2. Evaluating Gemma 4 (gemma-4-26b-a4b-it) ---')
  let gemmaCorrect = 0
  let gemmaLatencies = []

  for (const tc of LEGAL_TEST_CASES) {
    const prompt = `Indian Cyber Law Analysis. Incident: "${tc.narrative}".
List the exact section numbers of Bharatiya Nyaya Sanhita (BNS) 2023 and Information Technology (IT) Act 2000 that apply. (e.g., BNS 318, IT Act 66D). Output only the section numbers.`
    try {
      const resp = await queryGemma4(prompt)
      gemmaLatencies.push(resp.latency)
      const hits = tc.expectedLaws.filter(l => resp.content.includes(l))
      const pass = hits.length > 0
      if (pass) gemmaCorrect++
      console.log(`[Gemma 4] ${tc.id}: ${resp.latency}ms | Matched: [${hits.join(', ')}] | ${pass ? 'PASS' : 'FAIL'}`)
    } catch (e) {
      console.log(`[Gemma 4] ${tc.id}: Error (${e.message})`)
    }
    await new Promise(r => setTimeout(r, 600))
  }
  const gemmaAcc = (gemmaCorrect / LEGAL_TEST_CASES.length) * 100
  const gemmaAvgLat = Math.round(gemmaLatencies.reduce((a,b)=>a+b,0) / (gemmaLatencies.length || 1))
  console.log(`Gemma 4 Legal Accuracy: ${gemmaAcc}% | Avg Latency: ${gemmaAvgLat}ms\n`)

  // 3. Groq 120B Legal & Triage Accuracy
  console.log('--- 3. Evaluating Groq GPT-OSS 120B (openai/gpt-oss-120b) ---')
  let groqCorrect = 0
  let groqLatencies = []

  for (const tc of LEGAL_TEST_CASES) {
    const prompt = `Indian Cyber Law Analysis. Incident: "${tc.narrative}".
List the exact section numbers of Bharatiya Nyaya Sanhita (BNS) 2023 and Information Technology (IT) Act 2000 that apply. (e.g., BNS 318, IT Act 66D). Output only the section numbers.`
    try {
      const resp = await queryGroq120B(prompt)
      groqLatencies.push(resp.latency)
      const hits = tc.expectedLaws.filter(l => resp.content.includes(l))
      const pass = hits.length > 0
      if (pass) groqCorrect++
      console.log(`[Groq 120B] ${tc.id}: ${resp.latency}ms | Matched: [${hits.join(', ')}] | ${pass ? 'PASS' : 'FAIL'}`)
    } catch (e) {
      console.log(`[Groq 120B] ${tc.id}: Error (${e.message})`)
    }
    await new Promise(r => setTimeout(r, 600))
  }
  const groqAcc = (groqCorrect / LEGAL_TEST_CASES.length) * 100
  const groqAvgLat = Math.round(groqLatencies.reduce((a,b)=>a+b,0) / (groqLatencies.length || 1))
  console.log(`Groq 120B Legal Accuracy: ${groqAcc}% | Avg Latency: ${groqAvgLat}ms\n`)

  // Final Summary Output
  console.log('=== BENCHMARK REPORT COMPLETED ===')
  console.log(JSON.stringify({
    urlEngine: { accuracy: `${urlAcc}%`, latency: '< 1ms', type: 'Heuristic / Shannon Entropy' },
    gemma4_26B: { accuracy: `${gemmaAcc}%`, avgLatency: `${gemmaAvgLat}ms`, provider: 'Google AI Studio', model: 'gemma-4-26b-a4b-it' },
    gptOss_120B: { accuracy: `${groqAcc}%`, avgLatency: `${groqAvgLat}ms`, provider: 'Groq LPU', model: 'openai/gpt-oss-120b' },
  }, null, 2))
}

runBenchmark().catch(console.error)
