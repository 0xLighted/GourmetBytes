"use client"

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import SkeletonProfile from '@/components/sub-components/SkeletonProfile'
import { Mail, AtSign } from 'lucide-react'
import Avatar from '@/components/sub-components/Avatar'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const getUser = async () => {
      setLoading(true)
      
      try {
        // Get the current user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          throw error || new Error('User not found')
        }
        
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
        // Redirect to login if user is not authenticated
        router.push('/get-started')
      } finally {
        setLoading(false)
      }
    }
    
    getUser()
  }, [supabase, router])
  
  // Refresh user data after successful profile update
  const handleProfileUpdateSuccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!error && user) {
      setUser(user)
    }
  }
  
  // Show skeleton while loading
  if (loading) {
    return <SkeletonProfile />
  }
  
  // Extract user metadata for display
  const {
    full_name,
    username,
  } = user.user_metadata || {}
  
  const displayName = full_name || username || user.email?.split('@')[0] || 'User'
  
  // Show error if no user
  if (!user) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account details and preferences</p>
        </header>
        
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-xl">
          <p>You must be signed in to view this page. You are not supposed to see this.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account details and preferences</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <Avatar 
                src={user.user_metadata?.avatar_url} 
                name={displayName}
                size="xl"
                className="mb-4"
              />
              
              {/* Name */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {full_name || 'Anonymous Chef'}
              </h2>
              
              {/* Username if available */}
              {username && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <AtSign size={14} className="mr-1" />
                  <span>{username}</span>
                </div>
              )}
              
              {/* Email */}
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                <Mail size={14} className="mr-1" />
                <span>{user.email}</span>
              </div>
              
              {/* API Key indicator */}
              <div className="w-full flex items-center justify-center">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.user_metadata?.gemini_key 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}>
                  {user.user_metadata?.gemini_key 
                    ? "Gemini API Key Configured" 
                    : "Gemini API Key Not Set"}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile information forms */}
        <div className="md:col-span-2">
            <ProfileForm user={user} onSuccess={handleProfileUpdateSuccess} />
        </div>
      </div>
    </div>
  )
} 