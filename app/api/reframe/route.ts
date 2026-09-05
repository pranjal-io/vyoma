import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { thought } = await req.json()
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured on the server' }, { status: 500 })
    }

    if (!thought || typeof thought !== 'string' || !thought.trim()) {
      return NextResponse.json({ error: 'Thought is required' }, { status: 400 })
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
            content: "You are Vyoma's Mental Gym coach. Help the user reframe this negative or anxious thought into a balanced, self-compassionate, and constructive perspective. Keep your response to 2 calm and supportive sentences.",
          },
          {
            role: 'user',
            content: `Reframe this thought: "${thought.trim()}"`,
          },
        ],
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq reframe error:', response.status, errorText)
      return NextResponse.json({ error: `Groq call failed: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const reframedThought = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning
    if (!reframedThought) {
      return NextResponse.json({ error: 'Empty reframe response from model' }, { status: 502 })
    }

    return NextResponse.json({ reframedThought: reframedThought.trim() })
  } catch (error) {
    console.error('Reframe API route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
