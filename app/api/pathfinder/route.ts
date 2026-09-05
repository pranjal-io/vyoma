import { NextRequest, NextResponse } from 'next/server'

interface RoadmapStage {
  stage: number
  title: string
  duration: string
  actions: string[]
  milestone: string
}

interface PathfinderRoadmap {
  goal: string
  timeline: string
  stages: RoadmapStage[]
  firstStep: string
}

function cleanAndSanitizeJSON(raw: string): string {
  let clean = raw.trim()

  // Remove markdown code fences
  clean = clean.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim()

  // Extract substring from first '{' to last '}'
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1)
  }

  // Remove trailing commas before closing braces/brackets (common LLM syntax defect)
  clean = clean.replace(/,\s*([}\]])/g, '$1')

  return clean
}

function parseRoadmapJSON(text: string): PathfinderRoadmap {
  const clean = cleanAndSanitizeJSON(text)

  let parsed: any
  try {
    parsed = JSON.parse(clean)
  } catch (primaryErr) {
    console.warn('[PathFinder] Standard JSON.parse failed, attempting repair...', primaryErr)
    // Attempt to repair unescaped control characters/newlines
    const repaired = clean
      .replace(/[\u0000-\u001F]+/g, ' ')
      .replace(/,\s*([}\]])/g, '$1')
    parsed = JSON.parse(repaired)
  }

  // Normalize and validate schema
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed output is not an object')
  }

  const normalizedStages: RoadmapStage[] = Array.isArray(parsed.stages)
    ? parsed.stages.map((st: any, idx: number) => ({
        stage: typeof st.stage === 'number' ? st.stage : idx + 1,
        title: String(st.title || `Stage ${idx + 1}`),
        duration: String(st.duration || 'Flexible'),
        actions: Array.isArray(st.actions)
          ? st.actions.map((a: any) => String(a))
          : [String(st.actions || 'Take initial steps')],
        milestone: String(st.milestone || 'Stage complete'),
      }))
    : [
        {
          stage: 1,
          title: 'Initial Assessment & Planning',
          duration: 'Week 1-2',
          actions: ['Clarify specific objectives', 'Outline required resources'],
          milestone: 'Action plan established',
        },
      ]

  return {
    goal: String(parsed.goal || 'Goal Roadmap'),
    timeline: String(parsed.timeline || 'Flexible Timeline'),
    stages: normalizedStages,
    firstStep: String(parsed.firstStep || 'Take the first decisive step today towards your goal.'),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json()
    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 })
    }

    const prompt = `You are Vyoma PathFinder. The user wants to achieve: "${goal.trim()}"
    
Create a structured roadmap with exactly this JSON format and nothing else, 
no markdown, no explanation, just raw JSON:
{
  "goal": "the user's goal",
  "timeline": "realistic timeline",
  "stages": [
    {
      "stage": 1,
      "title": "Stage title",
      "duration": "X weeks",
      "actions": ["action 1", "action 2", "action 3"],
      "milestone": "what success looks like"
    }
  ],
  "firstStep": "the single most important thing to do today"
}`

    // 1. Try Gemini
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                response_mime_type: 'application/json',
              },
            }),
          }
        )

        if (res.ok) {
          const data = await res.json()
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
          console.log('[PathFinder] Raw Gemini response text:', reply)

          if (reply) {
            const parsed = parseRoadmapJSON(reply)
            return NextResponse.json({ roadmap: parsed })
          }
        } else {
          console.warn('[PathFinder] Gemini API responded with status:', res.status)
        }
      } catch (err) {
        console.warn('[PathFinder] Gemini call/parse failed, falling back to Groq...', err)
      }
    }

    // 2. Fallback to Groq
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              {
                role: 'system',
                content: 'You are Vyoma PathFinder. You output ONLY valid JSON without markdown fences, explanations, or commentary.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            max_tokens: 1500,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning
          console.log('[PathFinder] Raw Groq response text:', reply)

          if (reply) {
            const parsed = parseRoadmapJSON(reply)
            return NextResponse.json({ roadmap: parsed })
          }
        } else {
          console.warn('[PathFinder] Groq fallback API status:', response.status)
        }
      } catch (groqErr) {
        console.error('[PathFinder] Groq fallback failed:', groqErr)
      }
    }

    return NextResponse.json({ error: 'Failed to generate roadmap from AI providers' }, { status: 502 })
  } catch (error) {
    console.error('[PathFinder] API route error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
