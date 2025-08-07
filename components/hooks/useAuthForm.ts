"use client"

import { useState, useCallback } from "react"
import type { AuthForm } from "@/types"

const initialAuthForm: AuthForm = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  company: "",
}

export function useAuthForm() {
  const [authForm, setAuthForm] = useState<AuthForm>(initialAuthForm)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)

  const resetAuthForm = useCallback(() => {
    setAuthForm(initialAuthForm)
  }, [])

  const switchAuthMode = useCallback(
    (mode: "signin" | "signup") => {
      setAuthMode(mode)
      resetAuthForm()
      setShowPassword(false)
    },
    [resetAuthForm],
  )

  const updateAuthForm = useCallback((updates: Partial<AuthForm>) => {
    setAuthForm((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    authForm,
    authMode,
    showPassword,
    setAuthForm,
    setAuthMode,
    setShowPassword,
    resetAuthForm,
    switchAuthMode,
    updateAuthForm,
  }
}
