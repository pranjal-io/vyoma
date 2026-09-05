import { NextRequest, NextResponse } from 'next/server'

async function callGroqFallback(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are Vyoma — a warm, wise, deeply empathetic AI companion. Give short, inspiring, meaningful reflections.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) throw new Error(`Groq fallback failed: ${response.status}`)
  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning
  if (!text) throw new Error('Empty Groq response')
  return text.trim()
}

export async function POST(req: NextRequest) {
  try {
    const { name = 'friend' } = await req.json()
    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    const prompt = `Give ${name} one short warm inspiring reflection for today. Two sentences max. No generic advice.`

    if (geminiKey) {
      for (let i = 0; i < 2; i++) {
        try {
          if (i > 0) await new Promise(r => setTimeout(r, 1000))
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          )

          if (res.ok) {
            const data = await res.json()
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (reply) {
              return NextResponse.json({ reflection: reply.trim() })
            }
          }
        } catch (err) {
          console.warn('Gemini reflection attempt failed, retrying or falling back...', err)
        }
      }
    }

    if (groqKey) {
      const fallbackReply = await callGroqFallback(prompt, groqKey)
      return NextResponse.json({ reflection: fallbackReply })
    }

    return NextResponse.json({ reflection: 'Take a deep breath and connect with your inner calm today. Vyoma is here for you.' })
  } catch (error) {
    console.error('Reflection API route error:', error)
    return NextResponse.json({ reflection: 'Take a deep breath and connect with your inner calm today. Vyoma is here for you.' })
  }
}
