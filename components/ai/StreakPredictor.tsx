"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import type { Habit, HabitLog } from "@/lib/types"

interface Prediction {
  habit_id: string
  risk: "low" | "medium" | "high"
  score: number
  reason: string
}

interface Props {
  habits: Habit[]
  habitLogs: HabitLog[]
}

export function StreakPredictor({ habits, habitLogs }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (habits.length === 0) return

    const runPrediction = async () => {
      setLoading(true)
      setErrorMsg(null)

      try {
        const res = await fetch("/api/ai-predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habits, habitLogs }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Prediction failed")
        }

        const data = await res.json()
        setPredictions(data.predictions || [])
      } catch (err: any) {
        console.error("Prediction error:", err)
        setErrorMsg(err.message)
      } finally {
        setLoading(false)
      }
    }

    runPrediction()
  }, [habits]) // ✅ FIXED — rerun when habits load

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Streak Risk Prediction
        </CardTitle>
        <CardDescription>
          AI analysis of which habits you may miss today
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Analyzing habits...</p>}

        {errorMsg && (
          <p className="text-sm text-red-500">
            Could not load predictions: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && predictions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No predictions available yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}