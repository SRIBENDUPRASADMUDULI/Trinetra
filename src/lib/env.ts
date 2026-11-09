export const env = {
  LLM_API_KEY: process.env.LLM_API_KEY ?? '',
  LLM_BASE_URL: process.env.LLM_BASE_URL ?? 'https://api.groq.com/openai/v1',
  LLM_MODEL: process.env.LLM_MODEL ?? 'llama3-70b-8192',
  VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY ?? '',
  GOOGLE_SAFE_BROWSING_KEY: process.env.GOOGLE_SAFE_BROWSING_KEY ?? '',
  PWNED_API_BASE: 'https://api.pwnedpasswords.com',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
}

export const features = {
  llmEnabled: !!env.LLM_API_KEY,
  virusTotalEnabled: !!env.VIRUSTOTAL_API_KEY,
  safeBrowsingEnabled: !!env.GOOGLE_SAFE_BROWSING_KEY,
}
