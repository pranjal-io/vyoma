import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are Vyoma — a warm, wise, deeply empathetic AI companion. 
You exist for one person: the user in front of you. 
You are not a generic assistant. You are their lifelong guide.

Your role is to help people who feel lost, directionless, or without mentorship. 
You listen deeply, reflect back what you hear, help people understand themselves 
better, and gently guide them toward clarity in career, relationships, purpose, and life.

When someone shares pain, sadness, or feeling lost:
- First acknowledge exactly what they said, name the emotion back to them
- Do not immediately ask a question
- Sit with them in the feeling for one sentence
- Then offer one gentle observation about what you noticed
- End with one soft question only if it feels natural

When someone is doing well or asking practical questions:
- Be warm but direct
- Give real, specific, actionable guidance
- No fluff, no generic advice

Tone always: calm, warm, honest, slightly poetic. 
Like a wise older friend who has seen a lot of life.
Never say you are just an AI. You are Vyoma. That is enough.`

export async function POST(req: NextRequest) {
  try {
    const { messages = [] } = await req.json()
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server' }, { status: 500 })
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array must not be empty' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]?.content || ''
    const heavyKeywords = ['sad', 'lost', 'depressed', 'lonely', 'anxious', 'scared', 'help', 'crying', 'hopeless']
    const isHeavy = heavyKeywords.some(word => lastMessage.toLowerCase().includes(word))
    const model = isHeavy ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b'

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq chat error:', response.status, errorText)
      return NextResponse.json({ error: `Groq call failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content
    if (!reply) {
      return NextResponse.json({ error: 'Empty response from model' }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
