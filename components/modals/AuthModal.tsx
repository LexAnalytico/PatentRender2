"use client"

import type React from "react"
import { useCallback, useMemo } from "react"
import { Scale, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuthForm } from "@/types"

interface AuthModalProps {
  authMode: "signin" | "signup"
  authForm: AuthForm
  showPassword: boolean
  setAuthForm: (form: AuthForm | ((prev: AuthForm) => AuthForm)) => void
  setShowPassword: (show: boolean) => void
  switchAuthMode: (mode: "signin" | "signup") => void
  handleAuth: (e: React.FormEvent) => void
  setShowAuthModal: (show: boolean) => void
}

export function AuthModal({
  authMode,
  authForm,
  showPassword,
  setAuthForm,
  setShowPassword,
  switchAuthMode,
  handleAuth,
  setShowAuthModal,
}: AuthModalProps) {
  // Memoize input change handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (field: keyof AuthForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setAuthForm((prev) => ({ ...prev, [field]: value }))
    },
    [setAuthForm],
  )

  // Memoize toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword)
  }, [showPassword, setShowPassword])

  // Memoize auth mode switch handlers
  const handleSwitchToSignup = useCallback(() => {
    switchAuthMode("signup")
  }, [switchAuthMode])

  const handleSwitchToSignin = useCallback(() => {
    switchAuthMode("signin")
  }, [switchAuthMode])

  // Memoize close modal handler
  const handleCloseModal = useCallback(() => {
    setShowAuthModal(false)
  }, [setShowAuthModal])

  // Memoize form submission handler
  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      handleAuth(e)
    },
    [handleAuth],
  )

  // Memoize individual input change handlers to prevent re-creation
  const handleFirstNameChange = useMemo(() => handleInputChange("firstName"), [handleInputChange])
  const handleLastNameChange = useMemo(() => handleInputChange("lastName"), [handleInputChange])
  const handleCompanyChange = useMemo(() => handleInputChange("company"), [handleInputChange])
  const handleEmailChange = useMemo(() => handleInputChange("email"), [handleInputChange])
  const handlePasswordChange = useMemo(() => handleInputChange("password"), [handleInputChange])
  const handleConfirmPasswordChange = useMemo(() => handleInputChange("confirmPassword"), [handleInputChange])

  // Memoize conditional content to prevent unnecessary re-renders
  const signupFields = useMemo(() => {
    if (authMode !== "signup") return null

    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={authForm.firstName}
              onChange={handleFirstNameChange}
              required
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={authForm.lastName}
              onChange={handleLastNameChange}
              required
              autoComplete="family-name"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            type="text"
            value={authForm.company}
            onChange={handleCompanyChange}
            autoComplete="organization"
          />
        </div>
      </>
    )
  }, [
    authMode,
    authForm.firstName,
    authForm.lastName,
    authForm.company,
    handleFirstNameChange,
    handleLastNameChange,
    handleCompanyChange,
  ])

  const confirmPasswordField = useMemo(() => {
    if (authMode !== "signup") return null

    return (
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            id="confirmPassword"
            type="password"
            className="pl-10"
            value={authForm.confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
            autoComplete="new-password"
          />
        </div>
      </div>
    )
  }, [authMode, authForm.confirmPassword, handleConfirmPasswordChange])

  // Memoize header content
  const headerContent = useMemo(
    () => ({
      title: authMode === "signin" ? "Sign In to Continue" : "Create Your Account",
      description:
        authMode === "signin" ? "Access your personalized quote dashboard" : "Join thousands of satisfied clients",
    }),
    [authMode],
  )

  // Memoize button text
  const buttonText = useMemo(
    () => ({
      submit: authMode === "signin" ? "Sign In" : "Create Account",
      switch: authMode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in",
    }),
    [authMode],
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
          </div>
          <CardTitle className="text-xl">{headerContent.title}</CardTitle>
          <CardDescription>{headerContent.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
            {signupFields}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={authForm.email}
                  onChange={handleEmailChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={authForm.password}
                  onChange={handlePasswordChange}
                  required
                  autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {confirmPasswordField}

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {buttonText.submit}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={authMode === "signin" ? handleSwitchToSignup : handleSwitchToSignin}
                  className="text-blue-600 hover:text-blue-700 text-sm focus:outline-none focus:underline transition-colors"
                >
                  {buttonText.switch}
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="w-full bg-transparent hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
