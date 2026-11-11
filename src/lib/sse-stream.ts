/**
 * Reads an SSE stream of `{ token: string }` JSON events from a fetch Response
 * and invokes `onToken` incrementally as tokens arrive.
 */
export async function consumeTokenStream(
  response: Response,
  onToken: (accumulated: string) => void
): Promise<string> {
  if (!response.body) {
    throw new Error('Response stream unavailable')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return accumulated
      try {
        const parsed = JSON.parse(payload) as { token?: string }
        if (parsed.token) {
          accumulated += parsed.token
          onToken(accumulated)
        }
      } catch {
        // Ignore partial frames
      }
    }
  }

  return accumulated
}
