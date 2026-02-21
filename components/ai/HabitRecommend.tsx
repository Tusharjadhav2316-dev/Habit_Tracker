"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lightbulb, Plus, Sparkles } from "lucide-react"
import type { Habit } from "@/lib/types"

interface SuggestedHabit {
  name: string
  description: string
  color: string
  goal_type: "daily" | "weekly"
  goal_value: number
}

interface Props {
  onAddHabit?: (habit: Omit<Habit, "id" | "user_id" | "created_at">) => void
}

export function HabitRecommend({ onAddHabit }: Props) {
  const [goal, setGoal] = useState("")
  const [suggestions, setSuggestions] = useState<SuggestedHabit[]>([])
  const [loading, setLoading] = useState(false)

  const recommend = async () => {
    if (!goal.trim() || loading) return

    setLoading(true)
    setSuggestions([])

    try {
      const res = await fetch("/api/ai-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Recommendation failed")
      }

      const data = await res.json()
      setSuggestions(data.habits || [])
    } catch (err) {
      console.error(err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="size-5" />
          Smart Habit Recommendations
        </CardTitle>
        <CardDescription>
          Tell us your goal and AI will suggest helpful habits
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter your goal..."
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && recommend()}
          />
          <Button onClick={recommend} disabled={loading || !goal.trim()}>
            <Sparkles className="size-4 mr-1" />
            {loading ? "Loading..." : "Suggest"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}