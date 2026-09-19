import { NextResponse } from 'next/server'
import { callLLM, SYSTEM_PROMPTS } from '@/lib/llm'

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }
    const response = await callLLM(messages, context ?? SYSTEM_PROMPTS.MENTOR)
    return NextResponse.json(response)
  } catch (error) {
    console.error('[API/mentor] Error:', error)
    return NextResponse.json(
      { content: '[SYSTEM_ERROR] Mentor AI kernel unreachable. Check LLM_API_KEY configuration.', model: 'error', tokens: 0 },
      { status: 200 }
    )
  }
}
