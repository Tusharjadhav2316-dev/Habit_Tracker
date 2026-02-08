
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { firebaseAuth } from "@/lib/firebase/client"
import { DashboardContent } from "@/components/dashboard-content"
import type { User } from "firebase/auth"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        router.push("/auth/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardContent user={user} />
}
=======
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return <DashboardContent user={user} />
}

