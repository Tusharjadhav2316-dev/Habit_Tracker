"use client"

import { HabitCoach } from "@/components/ai/HabitCoach"
import { HabitRecommend } from "@/components/ai/HabitRecommend"
import { StreakPredictor } from "@/components/ai/StreakPredictor"
import type { Habit, HabitLog } from "@/lib/types"

interface Props {
  habits: Habit[]
  habitLogs: HabitLog[]
  onAddHabit?: (habit: Omit<Habit, "id" | "user_id" | "created_at">) => void
}

export function AiDashboard({ habits, habitLogs, onAddHabit }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">AI Insights</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Personalized AI analysis of your habit data
        </p>
      </div>

      <StreakPredictor habits={habits} habitLogs={habitLogs} />
      <HabitRecommend onAddHabit={onAddHabit} />
      <HabitCoach habits={habits} habitLogs={habitLogs} />
    </div>
  )
}