const GROQ_KEY = process.env.GROQ_API_KEY || ''

async function testGroq() {
  const prompt = `Classify this cyber incident and generate the primary MITRE ATT&CK technique and severity:
Incident: Attacker sent an invoice attachment containing malicious macro (VBA) that executed PowerShell to download a Cobalt Strike beacon onto domain controller.
Respond in JSON: {"technique": "...", "techniqueId": "...", "severity": "...", "phase": "..."}`

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
      max_tokens: 500
    })
  })
  const data = await res.json()
  console.log('GROQ INCIDENT TRIAGE TEST:')
  console.log(data.choices?.[0]?.message?.content)
}

testGroq().catch(console.error)
