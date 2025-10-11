"use client"

import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import { useEffect } from "react"

// Custom styles for NProgress
import "nprogress/nprogress.css"

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 300,
  showSpinner: false,
})

export default function TopProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Start the progress bar when navigation starts
    NProgress.start()
    
    // Complete the progress bar after a short delay to ensure it's visible even for fast navigations
    const timer = setTimeout(() => {
      NProgress.done()
    }, 200)
    
    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [pathname, searchParams])

  return null // This component doesn't render anything
} 