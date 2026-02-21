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
    const message: string = body?.message ?? ""

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
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

    const habitSummary =
      habits.length > 0
        ? habits.map((h) => `• ${h.name}`).join("\n")
        : "No habits tracked yet."

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
            role: "system",
            content: `You are an encouraging AI Habit Coach.

User habits:
${habitSummary}

Give concise motivating advice (2–4 sentences).`,
          },
          {
            role: "user",
            content: message,
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
    const reply =
      data?.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate advice."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("AI Coach crash:", error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}