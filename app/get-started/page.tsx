"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChefHat, ArrowRight, Eye, EyeOff, Github } from "lucide-react"
import InputField from "@/components/sub-components/inputField"
import { AuthService } from '@/lib/auth'
import GeminiKeyModal from "@/components/GeminiKeyModal"
import { validateGeminiKey } from "@/lib/gemini"

export default function GetStarted() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validatingKey, setValidatingKey] = useState(false)
  const [formType, setFormType] = useState<"login" | "signup">("login")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    geminiKey: "",
    name: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    geminiKey: "",
    name: "",
  })
  
  const authService = new AuthService()

  const toggleFormType = () => {
    setFormType(formType === "login" ? "signup" : "login")
    // Reset errors when toggling form
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      geminiKey: "",
      name: "",
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = async () => {
    let isValid = true
    const newErrors = { ...errors }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    }

    // Additional validations for signup
    if (formType === "signup") {
      // Name validation
      if (!formData.name) {
        newErrors.name = "Name is required"
        isValid = false
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
        isValid = false
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
        isValid = false
      }

      // Gemini API key validation
      if (!formData.geminiKey) {
        newErrors.geminiKey = "Gemini API key is required"
        isValid = false
      } else {
        try {
          setValidatingKey(true)
          await validateGeminiKey(formData.geminiKey)
          // Clear any previous errors if validation passes
          newErrors.geminiKey = ""
        } catch (error) {
          newErrors.geminiKey = error instanceof Error ? error.message : "Invalid API key"
          isValid = false
        } finally {
          setValidatingKey(false)
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!await validateForm()) {
        setLoading(false)
        return
      }

      console.log(formType, formData)
      if (formType === "login") {
        await authService.emailLogin(formData.email, formData.password)
      } else {
        await authService.emailSignUp(
          formData.email,
          formData.password,
          formData.name,
          formData.geminiKey
        )
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setErrors({
        ...errors,
        email: "Authentication failed. Please check your credentials.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-gradient-to-br bg-gray-200 dark:bg-gradient-to-br dark:from-dark-gradient-from dark:to-dark-gradient-to h-full flex items-center">
      <div id="auth-content" className="container mx-auto p-4">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            {/* Auth Card */}
            <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-dark-card border border-orange-500/20 shadow-2xl shadow-black/30">
              <div className="md:grid md:grid-cols-2">
                {/* Form Side */}
                <div className="p-6 md:p-10">
                  <div className="mb-8 flex items-center justify-center md:justify-start">
                    <Link href="/" className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                        <Image src="/branding_white.svg" alt="branding" className="h-5 w-5" width={28} height={28} />
                      </div>
                      <span className="text-xl font-bold text-orange-500">Gourmet Bytes</span>
                    </Link>
                  </div>

                  <h1 className="mb-2 text-center text-3xl font-bold text-black dark:text-white md:text-left">
                    {formType === "login" ? "Welcome Back!" : "Create Account"}
                  </h1>
                  <p className="mb-8 text-center text-black/50 dark:text-white/50 md:text-left">
                    {formType === "login" 
                      ? "Login to access your personalized recipes and preferences"
                      : "Join Gourmet Bytes and start creating AI-powered recipes"}
                  </p>

                  {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center space-y-4 rounded-lg bg-white/90 p-8 dark:bg-dark-card/90">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                        <p className="text-lg font-medium text-black dark:text-white">
                          {formType === "login" ? "Signing in..." : "Creating account..."}
                        </p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6" aria-disabled={loading} >
                    {/* Name field (signup only) */}
                    {formType === "signup" && (
                      <InputField label="Full Name" id="name" type="text" placeholder="John Doe" formData={formData} errors={errors} handleInputChange={handleInputChange} disabled={loading}/>
                    )}

                    {/* Email field */}
                    <InputField label="Email Address" id="email" type="email" placeholder="you@example.com" formData={formData} errors={errors} handleInputChange={handleInputChange} disabled={loading}/>

                    {/* Password field */}
                    <InputField label="Password" id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" formData={formData} errors={errors} handleInputChange={handleInputChange} disabled={loading}>
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 not-dark:text-gray-700" />
                        ) : (
                          <Eye className="h-5 w-5 not-dark:text-gray-700" />
                        )}
                      </button>
                      {formType === "login" && (
                        <Link href="/forgot-password" className="absolute right-0 -top-7 text-sm text-orange-500 hover:text-orange-400">
                          Forgot password?
                        </Link>
                      )}
                    </InputField>

                    {/* Confirm Password field (signup only) */}
                    {formType === "signup" && (
                      <InputField label="Confirm Password" id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" formData={formData} errors={errors} handleInputChange={handleInputChange} disabled={loading}/>
                    )}

                    {/* Gemini API Key field (signup only) */}
                    {formType === "signup" && (
                      <InputField 
                        label="Gemini API Key" 
                        id="geminiKey" 
                        type="text" 
                        placeholder="Enter your Gemini API key" 
                        formData={formData} 
                        errors={errors} 
                        handleInputChange={handleInputChange} 
                        disabled={loading || validatingKey}
                      >
                        <span className="text-xs text-black/50 dark:text-white/50">
                          Your API key is encrypted and securely stored. 
                          <GeminiKeyModal />
                        </span>
                        {validatingKey && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                          </div>
                        )}
                      </InputField>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-red-700 px-4 py-3 font-medium text-white shadow-lg shadow-orange-900/20 hover:from-orange-400 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#0e0f11] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          {formType === "login" ? "Sign In" : "Create Account"}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </button>

                    {/* Separator */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-black/20 dark:border-white/30"></div>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-gray-100 dark:bg-dark-gradient-from px-2 text-black/60 dark:text-white/60">Or continue with</span>
                      </div>
                    </div>

                    {/* Social login buttons - Updated to only Google and GitHub */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Google login button */}
                      <button
                        type="button"
                        onClick={() => authService.oAuthLogin('google')}
                        className="flex items-center justify-center gap-2 rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 text-black dark:text-white shadow-sm hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        <span>Google</span>
                      </button>
                      
                      {/* GitHub login button */}
                      <button
                        type="button"
                        onClick={() => authService.oAuthLogin('github')}
                        className="flex items-center justify-center gap-2 rounded-md border border-black/20 dark:border-white/30 bg-white dark:bg-dark-gradient-from px-4 py-2 text-black dark:text-white shadow-sm hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        <Github className="h-5 w-5" />
                        <span>GitHub</span>
                      </button>
                    </div>

                    {/* Toggle form type */}
                    <div className="text-center text-sm text-black/60 dark:text-white/60">
                      {formType === "login" ? (
                        <>
                          Don&apos;t have an account?{" "}
                          <button
                            type="button"
                            onClick={toggleFormType}
                            className="font-medium text-orange-500 hover:text-orange-400 cursor-pointer"
                          >
                            Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={toggleFormType}
                            className="font-medium text-orange-500 hover:text-orange-400 cursor-pointer"
                          >
                            Sign in
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>

                {/* Image Side */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-700/20"></div>
                  <Image
                    src="/images/auth-food.jpg"
                    alt="Gourmet dish prepared with Gourmet Bytes"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#141517]/80 to-[#141517]/60"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                    <div className="max-w-md text-center">
                      <h2 className="mb-6 text-3xl font-bold text-white">
                        {formType === "login"
                          ? "Welcome back to your culinary journey"
                          : "Begin your gourmet adventure"}
                      </h2>
                      <p className="text-[#ffffffcc]">
                        {formType === "login"
                          ? "Access your saved recipes, preferences, and continue creating delicious meals with ingredients you already have."
                          : "Join Gourmet Bytes and transform everyday ingredients into extraordinary meals with the power of AI."}
                      </p>
                      
                      <div className="mt-10 flex flex-col items-center space-y-6">
                        <div className="flex items-center space-x-3 rounded-lg bg-[#ffffff15] p-4 backdrop-blur-sm border border-orange-500/10">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                            <ChefHat className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-white">Personalized Recipes</h3>
                            <p className="text-sm text-[#ffffff99]">
                              Tailored to your preferences and dietary needs
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="mt-6 text-center text-xs text-[#ffffff60]">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-orange-500 hover:text-orange-400">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-orange-500 hover:text-orange-400">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
