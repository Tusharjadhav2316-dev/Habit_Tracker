"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send } from "lucide-react"
import type { Habit, HabitLog } from "@/lib/types"

interface Props {
  habits: Habit[]
  habitLogs: HabitLog[]
}

interface ChatMessage {
  role: "user" | "ai"
  text: string
}

const SUGGESTED_QUESTIONS = [
  "Why am I missing habits on weekends?",
  "Which habit needs the most attention?",
  "How can I improve my consistency?",
]

export function HabitCoach({ habits, habitLogs }: Props) {
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const send = async (text?: string) => {
    const msgToSend = text || message
    if (!msgToSend.trim() || loading) return

    setChat(prev => [...prev, { role: "user", text: msgToSend }])
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits, habitLogs, message: msgToSend }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "AI request failed")
      }

      const data = await res.json()

      setChat(prev => [
        ...prev,
        { role: "ai", text: data.reply || "Sorry, I couldn't generate a response." },
      ])
    } catch (err: any) {
      setChat(prev => [
        ...prev,
        { role: "ai", text: err.message || "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-5" />
          AI Habit Coach
        </CardTitle>
        <CardDescription>
          Ask anything about your habits and get AI-powered advice
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {chat.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border bg-muted px-3 py-1 text-xs hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto rounded-lg bg-muted/40 p-3">
          {chat.map((c, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                c.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start border bg-card"
              }`}
            >
              {c.text}
            </div>
          ))}

          {loading && (
            <div className="self-start rounded-lg border bg-card p-3 text-sm">
              Thinking...
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask your AI coach..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            disabled={loading}
          />
          <Button size="icon" onClick={() => send()} disabled={loading || !message.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}