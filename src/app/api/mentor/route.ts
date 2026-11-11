import { NextResponse } from 'next/server'
import { callLLM, streamLLM, SYSTEM_PROMPTS } from '@/lib/llm'
import { sanitizeInput, checkDefensiveSafety } from '@/lib/ai-harness'

export async function POST(request: Request) {
  try {
    const { messages, context, stream } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    // Apply pre-flight PII scrubbing & safety guardrails uniformly
    const sanitizedMessages = messages.map((m: { role: 'system' | 'user' | 'assistant'; content: string }) => {
      const { sanitized } = sanitizeInput(String(m.content || ''))
      const safety = checkDefensiveSafety(sanitized)
      if (!safety.safe && safety.refusal) {
        throw new Error(safety.refusal)
      }
      return { role: m.role, content: sanitized }
    })

    const sysPrompt = context ?? SYSTEM_PROMPTS.MENTOR

    if (stream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          const sendChunk = (token: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
          }
          try {
            let emitted = false
            for await (const token of streamLLM(sanitizedMessages, sysPrompt)) {
              if (token.includes('[LLM_OFFLINE]')) break
              emitted = true
              sendChunk(token)
            }
            if (!emitted) {
              const fallback = await callLLM(sanitizedMessages, sysPrompt)
              for (const piece of fallback.content.match(/.{1,18}(\s|$)|\S+/g) ?? [fallback.content]) {
                sendChunk(piece)
                await new Promise(r => setTimeout(r, 12))
              }
            }
          } catch {
            const fallback = await callLLM(sanitizedMessages, sysPrompt)
            for (const piece of fallback.content.match(/.{1,18}(\s|$)|\S+/g) ?? [fallback.content]) {
              sendChunk(piece)
              await new Promise(r => setTimeout(r, 12))
            }
          } finally {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    const response = await callLLM(sanitizedMessages, sysPrompt)
    return NextResponse.json(response)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Mentor AI kernel unreachable'
    return NextResponse.json(
      { content: message.startsWith('[') ? message : `[SYSTEM_ERROR] ${message}`, model: 'error', tokens: 0 },
      { status: 200 }
    )
  }
}
