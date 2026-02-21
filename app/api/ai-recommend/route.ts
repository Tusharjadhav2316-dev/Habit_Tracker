import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    let body

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      )
    }

    const goal: string = body?.goal ?? ""

    if (!goal.trim()) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set" },
        { status: 500 }
      )
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Habit Tracker AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Suggest exactly 4 habits for goal: "${goal}".

Reply ONLY valid JSON array.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("OpenRouter error:", errText)

      return NextResponse.json(
        { error: "OpenRouter API failed", detail: errText },
        { status: 500 }
      )
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content ?? "[]"

    let habits
    try {
      habits = JSON.parse(text.replace(/```json|```/g, "").trim())
    } catch {
      console.error("JSON parse failed:", text)
      habits = []
    }

    return NextResponse.json({ habits })
  } catch (error) {
    console.error("AI Recommend crash:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}