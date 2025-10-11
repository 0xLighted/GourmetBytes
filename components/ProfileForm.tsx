"use client"

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import FormInput from './sub-components/FormInput'
import Button from './sub-components/Button'
import { toast } from 'react-hot-toast'
import { validateGeminiKey } from '@/lib/gemini'
import { Lock, Mail, User, Key, Eye, EyeOff } from 'lucide-react'
import GeminiKeyModal from './GeminiKeyModal'

interface ProfileFormProps {
  user: any
  onSuccess: () => void
}

type FormSectionProps = {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

const FormSection = ({ title, icon, children }: FormSectionProps) => (
  <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
)

export default function ProfileForm({ user, onSuccess }: ProfileFormProps) {
  const [personalLoading, setPersonalLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [personalData, setPersonalData] = useState({
    full_name: user.user_metadata?.full_name || ''
  })
  
  const [emailData, setEmailData] = useState({
    email: user.email || '',
    confirmPassword: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  
  const [apiKeyData, setApiKeyData] = useState({
    gemini_key: user.user_metadata?.gemini_key || ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClientComponentClient()

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalData(prev => ({ ...prev, [name]: value }))
    clearError(name)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailData(prev => ({ ...prev, [name]: value }))
    clearError(name)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    clearError(name)
  }

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setApiKeyData(prev => ({ ...prev, [name]: value }))
    clearError(name)
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}

    if (personalData.full_name && personalData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters long'
    }

    updateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEmailChange = () => {
    const newErrors: Record<string, string> = {}

    if (emailData.email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      
      if (!emailData.confirmPassword) {
        newErrors.confirmPassword = 'Password is required to change email'
      }
    }

    updateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordChange = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long'
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match'
    }

    updateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateApiKey = () => {
    const newErrors: Record<string, string> = {}
    // No validation needed here as API key validation will happen during submission
    updateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateErrors = (newErrors: Record<string, string>) => {
    setErrors(prev => ({ ...prev, ...newErrors }))
  }

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePersonalInfo()) return

    setPersonalLoading(true)
    try {
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: personalData.full_name,
          // Preserve other metadata
          gemini_key: user.user_metadata?.gemini_key
        }
      })
      if (metadataError) throw metadataError

      toast.success('Personal information updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update personal information')
    } finally {
      setPersonalLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmailChange() || emailData.email === user.email) return

    setEmailLoading(true)
    try {
      // First verify the password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailData.confirmPassword,
      })
      
      if (signInError) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Incorrect password' }))
        throw signInError
      }

      // Update email
      const { error: emailError } = await supabase.auth.updateUser({
        email: emailData.email
      })
      
      if (emailError) throw emailError

      // Reset password field
      setEmailData(prev => ({ ...prev, confirmPassword: '' }))
      
      toast.success('Verification email sent! Check your inbox to confirm your new email address')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating email:', error)
      if (!errors.confirmPassword) {
        toast.error(error.message || 'Failed to update email')
      }
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordChange()) return

    setPasswordLoading(true)
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      })
      
      if (signInError) {
        setErrors(prev => ({ ...prev, currentPassword: 'Incorrect password' }))
        throw signInError
      }

      // Update password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      
      if (passwordError) throw passwordError

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
      
      toast.success('Password updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating password:', error)
      if (!errors.currentPassword) {
        toast.error(error.message || 'Failed to update password')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateApiKey()) return

    setApiKeyLoading(true)
    try {
      // Validate Gemini API key if it's changed
      if (apiKeyData.gemini_key !== user.user_metadata?.gemini_key) {
        try {
          await validateGeminiKey(apiKeyData.gemini_key);
          // Update user metadata with new API key
          const { error: metadataError } = await supabase.auth.updateUser({
            data: {
              gemini_key: apiKeyData.gemini_key,
              // Preserve other metadata
              full_name: user.user_metadata?.full_name
            }
          })
          if (metadataError) throw metadataError

          toast.success('Gemini API key updated successfully')
          onSuccess()
        } catch (error: any) {
          setErrors(prev => ({ ...prev, gemini_key: error.message || 'Invalid API key' }))
          throw error
        }
      }
    } catch (error: any) {
      console.error('Error updating API key:', error)
      if (!errors.gemini_key) {
        toast.error(error.message || 'Failed to update API key')
      }
    } finally {
      setApiKeyLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <FormSection title="Personal Information" icon={<User className="h-4 w-4 text-orange-600 dark:text-orange-400" />}>
        <form onSubmit={handlePersonalSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            name="full_name"
            type="text"
            value={personalData.full_name}
            onChange={handlePersonalChange}
            error={errors.full_name}
            placeholder="Enter your full name"
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={personalLoading}
              disabled={personalLoading || personalData.full_name === user.user_metadata?.full_name}
            >
              Update Name
            </Button>
          </div>
        </form>
      </FormSection>

      {/* Email Change */}
      <FormSection title="Email Address" icon={<Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />}>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={emailData.email}
            onChange={handleEmailChange}
            error={errors.email}
            placeholder="Enter your email"
          />

          {emailData.email !== user.email && (
            <FormInput
              label="Current Password"
              name="confirmPassword"
              type="password"
              value={emailData.confirmPassword}
              onChange={handleEmailChange}
              error={errors.confirmPassword}
              placeholder="Enter your current password to confirm"
            />
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={emailLoading}
              disabled={emailLoading || emailData.email === user.email}
            >
              Update Email
            </Button>
          </div>

          {emailData.email !== user.email && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              You&apos;ll need to verify your new email address before the change takes effect.
            </p>
          )}
        </form>
      </FormSection>

      {/* Password Change */}
      <FormSection title="Change Password" icon={<Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />}>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <FormInput
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={errors.currentPassword}
            placeholder="Enter your current password"
          />

          <FormInput
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={errors.newPassword}
            placeholder="Enter new password"
          />

          <FormInput
            label="Confirm New Password"
            name="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            error={errors.confirmNewPassword}
            placeholder="Confirm your new password"
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={passwordLoading}
              disabled={passwordLoading || !passwordData.newPassword}
            >
              Update Password
            </Button>
          </div>
        </form>
      </FormSection>

      {/* Gemini API Key */}
      <FormSection title="API Settings" icon={<Key className="h-4 w-4 text-orange-600 dark:text-orange-400" />}>
        <form onSubmit={handleApiKeySubmit} className="space-y-4">
          <div>
            <div className="relative">
              <FormInput
                label="Gemini API Key"
                name="gemini_key"
                type={showApiKey ? "text" : "password"}
                value={apiKeyData.gemini_key}
                onChange={handleApiKeyChange}
                error={errors.gemini_key}
                placeholder="Enter your Gemini API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-[2.1rem] p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showApiKey ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-xs text-black/50 dark:text-white/50">
                Your API key is encrypted and securely stored. 
                <GeminiKeyModal />
              </span>
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              isLoading={apiKeyLoading}
              disabled={apiKeyLoading || apiKeyData.gemini_key === user.user_metadata?.gemini_key}
            >
              Update API Key
            </Button>
          </div>
        </form>
      </FormSection>
    </div>
  )
} 