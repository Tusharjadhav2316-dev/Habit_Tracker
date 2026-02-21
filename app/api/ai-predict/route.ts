import { NextRequest, NextResponse } from "next/server"
import type { Habit, HabitLog } from "@/lib/types"

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

    const habits: Habit[] = body?.habits ?? []
    const habitLogs: HabitLog[] = body?.habitLogs ?? []

    if (!habits.length) {
      return NextResponse.json({ predictions: [] })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not set" },
        { status: 500 }
      )
    }

    const habitSummary = habits
      .map((h, index) => {
        const logs = habitLogs
          .filter((l) => l.habit_id === h.id)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 14)

        const completed = logs.filter((l) => l.status === "completed").length
        const rate = logs.length
          ? Math.round((completed / logs.length) * 100)
          : 0

        return `index:${index}, name:${h.name}, rate:${rate}%`
      })
      .join("\n")

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
            content: `Predict today's miss risk.

${habitSummary}

Reply ONLY JSON array:
[
 { "index":0, "risk":"low", "score":20, "reason":"short reason" }
]`,
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

    let rawPredictions
    try {
      rawPredictions = JSON.parse(text.replace(/```json|```/g, "").trim())
    } catch {
      console.error("Prediction parse failed:", text)
      rawPredictions = []
    }

    const predictions = rawPredictions
      .map((p: any) => ({
        habit_id: habits[p.index]?.id ?? "",
        risk: p.risk ?? "medium",
        score: p.score ?? 50,
        reason: p.reason ?? "No reason provided",
      }))
      .filter((p: any) => p.habit_id)

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error("AI Predict crash:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}