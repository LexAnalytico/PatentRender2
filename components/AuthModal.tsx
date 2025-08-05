import React from "react";
import { Scale, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"; // adjust to your path
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface AuthModalProps {
  authForm: AuthFormState;
  setAuthForm: React.Dispatch<React.SetStateAction<AuthFormState>>;
  authMode: "signin" | "signup";
  switchAuthMode: (mode: "signin" | "signup") => void;
  handleAuth: (e: React.FormEvent) => void;
  handleForgotPassword: () => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAuthModal: (show: boolean) => void;
}

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  company: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  authForm,
  setAuthForm,
  authMode,
  switchAuthMode,
  handleAuth,
  handleForgotPassword,
  showPassword,
  setShowPassword,
  setShowAuthModal,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">LegalIP Pro</span>
          </div>
          <CardTitle className="text-xl">
            {authMode === "signin" ? "Sign In to Continue" : "Create Your Account"}
          </CardTitle>
          <CardDescription>
            {authMode === "signin" ? "Access your personalized quote dashboard" : "Join thousands of satisfied clients"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={authForm.firstName}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={authForm.lastName}
                      onChange={(e) =>
                        setAuthForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    type="text"
                    value={authForm.company}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, company: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-10 pr-10"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authMode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10"
                    value={authForm.confirmPassword}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    switchAuthMode(authMode === "signin" ? "signup" : "signin")
                  }
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {authMode === "signin"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;