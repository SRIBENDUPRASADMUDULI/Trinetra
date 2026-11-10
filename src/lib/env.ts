export const env = {
  LLM_API_KEY: process.env.LLM_API_KEY ?? process.env.BHARATCODE_API_KEY ?? '',
  LLM_BASE_URL:
    process.env.LLM_BASE_URL ??
    (process.env.BHARATCODE_API_KEY ? 'https://bharatcode.ai/api/model/v1' : 'https://api.groq.com/openai/v1'),
  LLM_MODEL:
    process.env.LLM_MODEL ??
    (process.env.BHARATCODE_API_KEY ? 'qwen-3.8-27b' : 'llama3-70b-8192'),
  BHARATCODE_API_KEY: process.env.BHARATCODE_API_KEY ?? process.env.LLM_API_KEY ?? '',
  BHARATCODE_BASE_URL: process.env.BHARATCODE_BASE_URL ?? 'https://bharatcode.ai/api/model/v1',
  BHARATCODE_MODEL: process.env.BHARATCODE_MODEL ?? 'qwen-3.8-27b',
  VIRUSTOTAL_API_KEY: process.env.VIRUSTOTAL_API_KEY ?? '',
  GOOGLE_SAFE_BROWSING_KEY: process.env.GOOGLE_SAFE_BROWSING_KEY ?? '',
  PWNED_API_BASE: 'https://api.pwnedpasswords.com',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
}

export const features = {
  llmEnabled: !!env.LLM_API_KEY,
  bharatcodeEnabled: !!env.BHARATCODE_API_KEY,
  virusTotalEnabled: !!env.VIRUSTOTAL_API_KEY,
  safeBrowsingEnabled: !!env.GOOGLE_SAFE_BROWSING_KEY,
}
