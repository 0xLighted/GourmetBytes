"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import InputField from "@/components/sub-components/inputField"
import { AuthService } from '@/lib/auth'

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })
  
  const authService = new AuthService()
  const router = useRouter()

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

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
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

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!validateForm()) {
        setLoading(false)
        return
      }

      await authService.updateUser({
        password: formData.password
      })
      
      // Show success state
      setResetComplete(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/get-started')
      }, 3000)
    } catch (error) {
      console.error('Password update error:', error)
      setErrors({
        ...errors,
        password: "Failed to update password. Please try again or request a new reset link.",
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
                        <Image src="/branding_white.svg" alt="branding" className="h-5 w-5" />
                      </div>
                      <span className="text-xl font-bold text-orange-500">Gourmet Bytes</span>
                    </Link>
                  </div>

                  <h1 className="mb-2 text-center text-3xl font-bold text-black dark:text-white md:text-left">
                    {resetComplete ? "Password Reset Complete" : "Create New Password"}
                  </h1>
                  <p className="mb-8 text-center text-black/50 dark:text-white/50 md:text-left">
                    {resetComplete 
                      ? "Your password has been updated successfully"
                      : "Enter your new password below"}
                  </p>

                  {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center space-y-4 rounded-lg bg-white/90 p-8 dark:bg-dark-card/90">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                        <p className="text-lg font-medium text-black dark:text-white">
                          Updating password...
                        </p>
                      </div>
                    </div>
                  )}

                  {!resetComplete ? (
                    <form onSubmit={handleSubmit} className="space-y-6" aria-disabled={loading}>
                      {/* Password field */}
                      <InputField 
                        label="New Password" 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        formData={formData as any} 
                        errors={errors as any} 
                        handleInputChange={handleInputChange} 
                        disabled={loading}
                      >
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
                      </InputField>
                      
                      {/* Confirm Password field */}
                      <InputField 
                        label="Confirm New Password" 
                        id="confirmPassword" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        formData={formData as any} 
                        errors={errors as any} 
                        handleInputChange={handleInputChange} 
                        disabled={loading}
                      />

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
                            Reset Password
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-red-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-center space-y-3 mt-4">
                        <p className="text-black/70 dark:text-white/70">
                          Your password has been reset successfully. You will be redirected to the login page shortly.
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <Link
                          href="/get-started"
                          className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-red-700 px-4 py-3 font-medium text-white shadow-lg shadow-orange-900/20 hover:from-orange-400 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#0e0f11]"
                        >
                          Go to Login
                        </Link>
                      </div>
                    </div>
                  )}
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
                        {resetComplete 
                          ? "Welcome back to Gourmet Bytes" 
                          : "Almost there!"}
                      </h2>
                      <p className="text-[#ffffffcc]">
                        {resetComplete
                          ? "Your account is now secure. Get ready to discover amazing recipes and unleash your culinary creativity."
                          : "Create a strong password to secure your account and get back to exploring delicious recipes tailored just for you."}
                      </p>
                      
                      <div className="mt-10 flex flex-col items-center">
                        <div className="w-full max-w-sm rounded-lg bg-[#ffffff15] p-5 backdrop-blur-sm border border-orange-500/10">
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h3 className="font-medium text-white">Secure Account</h3>
                              <p className="text-sm text-[#ffffff99]">
                                Protection for your culinary creations
                              </p>
                            </div>
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