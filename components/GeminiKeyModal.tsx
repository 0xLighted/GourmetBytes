"use client"

import { X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function GeminiKeyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const steps = [
    (
      <>
        Go to&nbsp;
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-400"
        >
          Google AI Studio
        </a>
      </>
    ),
    "Press \"Create API Key\" and \"Create API key in new project\"",
    "Copy and paste the generated API key to the API key field",
  ]

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="ml-1 text-orange-500 hover:text-orange-400 cursor-pointer"
      >
        Learn how to get a key
      </button>

      {isOpen && (
        <div className="fixed text-base inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="relative w-full max-w-2xl mx-4 bg-white dark:bg-dark-card rounded-lg shadow-lg p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                How to Get Your Gemini API Key
              </h2>

              <div className="space-y-6 text-black/80 dark:text-white/80">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-6">
                    <div className="flex p-3.5 aspect-square h-full items-center rounded-full bg-orange-500/10 text-orange-500">
                      {index+1}
                    </div>
                    <p>{step}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-md bg-gradient-to-r from-orange-500 to-red-700 px-4 py-3 font-medium text-white shadow-lg shadow-orange-900/20 hover:from-orange-400 hover:to-red-600 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 