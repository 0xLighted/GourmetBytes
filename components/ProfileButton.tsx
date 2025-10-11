"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useRef } from "react"
import { User, Bookmark, HelpCircle, LogOut } from "lucide-react"

export default function ProfileButton() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const menuItems = [
    { icon: Bookmark, label: 'Saved Recipes', path: '/dashboard/saved-recipes' },
    { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    { icon: LogOut, label: 'Logout', action: handleLogout, isDestructive: true },
  ]

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  // Extract user information
  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userEmail = user.email || 'No email provided'

  return (
    <div 
      className="relative"
      ref={buttonRef}
      onMouseEnter={() => {
        // Only apply hover effect on desktop
        if (window.innerWidth >= 768) {
          setIsOpen(true)
        }
      }}
      onMouseLeave={() => {
        // Only apply hover effect on desktop
        if (window.innerWidth >= 768) {
          setIsOpen(false)
        }
      }}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-orange-500 bg-white dark:bg-dark-card px-4 py-2 text-black dark:text-white shadow-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors md:hidden"
      >
        <User className="h-5 w-5" />
        <span>Profile</span>
      </button>

      {/* Desktop Profile Button */}
      <div className="hidden md:block">
        <button
          onClick={() => router.push('/dashboard/profile')}
          className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-orange-500 hover:border-orange-400 transition-all cursor-pointer"
        >
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="User profile"
              fill
              className="object-cover p-2"
            />
          ) : (
            <User className="m-auto dark:text-white/80"/>
          )}
        </button>
        
        {/* Create padding area to prevent dropdown from disappearing */}
        <div className="absolute w-full h-4"></div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full mt-2 w-64 rounded-lg bg-white dark:bg-dark-card border border-black/30 dark:border-white/30 shadow-lg shadow-black/30 overflow-hidden transition-opacity duration-200 z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Create a bridge element to prevent hover gaps */}
        <div className="absolute w-full h-4 -top-4"></div>
        
        {/* User Info Section - Clickable to view profile */}
        <button 
          onClick={() => {
            router.push('/dashboard/profile');
            setIsOpen(false);
          }}
          className="w-full px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/30">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="User profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="m-auto text-orange-500 mt-2"/>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-black dark:text-white truncate">{userName}</span>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                <span>{userEmail}</span>
              </div>
              <span className="text-xs text-orange-500 mt-1">View your profile</span>
            </div>
          </div>
        </button>
        
        <div className="py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else if (item.path) {
                  router.push(item.path)
                  setIsOpen(false)
                }
              }}
              className={`w-full px-4 py-2 text-left flex items-center space-x-3 cursor-pointer ${
                item.isDestructive
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-black/90 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 