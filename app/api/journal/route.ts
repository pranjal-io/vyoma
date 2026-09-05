import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { entryText } = await req.json()
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server' }, { status: 500 })
    }

    if (!entryText || typeof entryText !== 'string' || !entryText.trim()) {
      return NextResponse.json({ error: 'Journal entry text is required' }, { status: 400 })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are Vyoma, an empathetic AI companion. Analyse this journal entry in exactly 2 warm, perceptive sentences and identify the core emotion. Do not use generic advice.',
          },
          {
            role: 'user',
            content: entryText.trim(),
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq journal analysis error:', response.status, errorText)
      return NextResponse.json({ error: `Groq call failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const analysis = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning
    if (!analysis) {
      return NextResponse.json({ error: 'Empty analysis from model' }, { status: 502 })
    }

    return NextResponse.json({ analysis: analysis.trim() })
  } catch (error) {
    console.error('Journal API route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
