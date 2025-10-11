"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X, Sun, Moon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/context/ThemeContext"
import ProfileButton from "./ProfileButton"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import Branding from "./sub-components/branding"

const mainNavItems = [
  {
    label: "Home",
    href: "/",
    children: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#instructions" },
      { label: "Our testimonials", href: "/#testimonials" },
    ],
  },
  { label: "Generate", href: "/generate" },
  { label: "Marketplace", href: "/marketplace" },
]

export default function NavBar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoverStyle, setHoverStyle] = useState({ left: "0px", width: "0px", opacity: 0 })
  const [activeStyle, setActiveStyle] = useState<{ left: string; width: string; transition?: string }>({ left: "0px", width: "0px" })
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [clientSideHasMounted, setClientSideHasMounted] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const prevPathname = useRef(pathname)
  const navRefs = useRef<(HTMLLIElement | null)[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navItemsContainerRef = useRef<HTMLDivElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClientComponentClient()

  const setNavRef = (el: HTMLLIElement | null, index: number) => {
    navRefs.current[index] = el
  }

  // First, indicate that client-side has mounted to avoid hydration mismatches
  useEffect(() => {
    setClientSideHasMounted(true)
  }, [])

  // Update hover effect
  useEffect(() => {
    if (!clientSideHasMounted) return
    
    if (hoveredIndex !== null) {
      const hoveredElement = navRefs.current[hoveredIndex]
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
          opacity: 1
        })
      }
    } else {
      setHoverStyle(prev => ({ ...prev, opacity: 0 }))
    }
  }, [hoveredIndex, clientSideHasMounted])

  // Find the active item index based on pathname
  const findActiveItemIndex = (path: string) => {
    return mainNavItems.findIndex(item => {
      if (item.href === "/") {
        return path === "/" || path.startsWith("/#")
      }
      return path.startsWith(item.href)
    })
  }

  // Update active tab only after client-side mounting to prevent hydration issues
  useEffect(() => {
    if (!clientSideHasMounted) return
    
    // If the pathname changed
    if (pathname !== prevPathname.current) {
      // Don't animate if this is a page load transition (not a click)
      const shouldAnimate = isPageTransitioning
      
      const newActiveIndex = findActiveItemIndex(pathname)
      if (newActiveIndex !== -1) {
        setActiveIndex(newActiveIndex)
        
        const activeElement = navRefs.current[newActiveIndex]
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement
          
          // Update with or without transition based on context
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            transition: shouldAnimate ? "all 300ms ease-out" : "none"
          })
        }
      }
      
      // Reset transition flag and update previous pathname
      setIsPageTransitioning(false)
      prevPathname.current = pathname
    }
  }, [pathname, clientSideHasMounted, isPageTransitioning])

  // Immediate initial positioning (no animation)
  useEffect(() => {
    if (clientSideHasMounted) {
      const initialActiveIndex = findActiveItemIndex(pathname)
      
      if (initialActiveIndex !== -1) {
        setActiveIndex(initialActiveIndex)
        
        // Set without animation for initial load
        const activeElement = navRefs.current[initialActiveIndex]
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
            transition: "none"
          })
        }
      }
    }
  }, [clientSideHasMounted, pathname])

  // Function to update the active tab style with animation
  const updateActiveTabStyle = (index: number) => {
    const activeElement = navRefs.current[index]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
        transition: "all 300ms ease-out"
      })
    }
  }

  // Handle click on nav item - updates active tab with animation
  const handleNavItemClick = (index: number) => {
    setActiveIndex(index)
    updateActiveTabStyle(index)
    setIsPageTransitioning(true)
  }

  // Handle mouseenter on dropdown container
  const handleDropdownMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setDropdownOpen(index)
  }

  // Handle mouseleave for entire nav container
  const handleNavContainerMouseLeave = () => {
    setHoveredIndex(null)
    setDropdownOpen(null)
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-card text-black dark:text-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Branding */}
          <Branding />

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-black dark:text-white hover:text-orange-400 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center justify-center flex-1"
            ref={navItemsContainerRef}
            onMouseLeave={handleNavContainerMouseLeave}
          >
            <div className="relative">
              {/* Hover Highlight */}
              <div
                className="absolute h-[34px] bg-black/5 dark:bg-white/10 rounded-[6px] flex items-center transition-all duration-300 ease-out"
                style={clientSideHasMounted ? hoverStyle : { opacity: 0, left: "0px", width: "0px" }}
              />

              {/* Active Indicator - Only apply transition styles client-side to avoid hydration errors */}
              <div
                className="absolute bottom-[-6px] h-[2px] bg-orange-500"
                style={clientSideHasMounted ? activeStyle : { left: "0px", width: "0px" }}
              />

              {/* Nav Items */}
              <ul className="flex space-x-1 items-center">
                {mainNavItems.map((item, index) => (
                  <li
                    key={index}
                    ref={(el) => setNavRef(el, index)}
                    className={`px-4 py-2 cursor-pointer transition-colors duration-300 h-[34px] relative ${
                      index === activeIndex ? "text-black dark:text-white" : "text-black/60 dark:text-white/60"
                    } ${index === hoveredIndex ? "text-black dark:text-white" : ""}`}
                    onMouseEnter={() => handleDropdownMouseEnter(index)}
                  >
                    <Link 
                      href={item.href}
                      className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full"
                      onClick={() => handleNavItemClick(index)}
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown size={16} className="ml-1" />
                      )}
                    </Link>

                    {/* Dropdown Menu with improved hover area */}
                    {item.children && dropdownOpen === index && (
                      <div 
                        ref={dropdownRef}
                        className="absolute top-full left-0 bg-white dark:bg-dark-card rounded-md shadow-lg py-1 w-44 z-10"
                        onMouseEnter={() => handleDropdownMouseEnter(index)}
                      >
                        {/* Larger invisible bridge to prevent gap between nav item and dropdown */}
                        <div 
                          className="absolute w-full h-4 bg-transparent" 
                          style={{ top: "-12px" }}
                          onMouseEnter={() => handleDropdownMouseEnter(index)}
                        />
                        
                        {item.children.map((child, childIndex) => (
                          <Link 
                            key={childIndex}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Theme Toggle and Get Started Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            {isLoggedIn ? (
              <ProfileButton />
            ) : (
              <Link 
                href="/get-started" 
                className="bg-gradient-to-r from-orange-500 to-red-700 hover:from-orange-400 hover:to-red-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-card border-t border-black/10 dark:border-white/10">
          {mainNavItems.map((item, index) => (
            <div key={index}>
              <button
                className={`w-full flex justify-between items-center px-4 py-2 text-sm font-medium rounded-md
                  ${pathname === item.href ? 'text-black dark:text-white bg-black/5 dark:bg-white/10' : 'text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'}
                `}
                onClick={() => handleNavItemClick(index)}
                aria-expanded={activeIndex === index && item.children !== undefined}
              >
                {item.label}
                {item.children && (
                  <ChevronDown 
                    className={`ml-1 h-4 w-4 transition-transform ${activeIndex === index ? 'rotate-180' : ''}`} 
                  />
                )}
              </button>
              
              {item.children && activeIndex === index && (
                <div className="pl-4 mt-1 mb-2 border-l border-black/10 dark:border-white/10">
                  {item.children.map((child, childIndex) => (
                    <Link 
                      key={childIndex} 
                      href={child.href} 
                      className="block px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Add theme toggle to mobile menu */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-black/30 dark:border-white/30 bg-white dark:bg-dark-card px-4 py-2 text-black dark:text-white shadow-sm hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-5 w-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-5 w-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          {isLoggedIn ? (
            <ProfileButton />
          ) : (
            <Link 
              href="/get-started" 
              className="block w-full text-center bg-gradient-to-r from-orange-500 to-red-700 text-white font-medium py-2 px-4 rounded-md mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  )
} 