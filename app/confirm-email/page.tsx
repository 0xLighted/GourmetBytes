"use client"

import Image from "next/image"
import Link from "next/link"
import { ChefHat, MailCheck } from "lucide-react"

export default function ConfirmEmailPage() {
  return (
    <main className="bg-gradient-to-br bg-gray-200 dark:bg-gradient-to-br dark:from-dark-gradient-from dark:to-dark-gradient-to min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            {/* Confirmation Card */}
            <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-dark-card border border-orange-500/20 shadow-2xl shadow-black/30 p-8 md:p-12">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                  <MailCheck className="h-10 w-10 text-white" />
                </div>

                {/* Heading */}
                <h1 className="mb-4 text-3xl font-bold text-black dark:text-white">
                  Please Confirm Your Email
                </h1>

                {/* Description */}
                <p className="mb-8 text-lg text-black/70 dark:text-white/70">
                  We&apos;ve sent a confirmation email to your inbox. Please check your email and click the verification link to complete your registration.
                </p>

                {/* Image */}
                <div className="relative mb-8 h-64 w-full rounded-lg overflow-hidden">
                  <Image
                    src="/images/cooking-illustration.webp"
                    alt="Email confirmation illustration"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-700/20" />
                </div>

                {/* Tips */}
                <div className="mb-8 space-y-4 text-left">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      1
                    </div>
                    <p className="text-black/80 dark:text-white/80">
                      Check your inbox for an email from <span className="font-medium">Supabase Auth</span>
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      2
                    </div>
                    <p className="text-black/80 dark:text-white/80">
                      Click the verification link in the email
                    </p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      3
                    </div>
                    <p className="text-black/80 dark:text-white/80">
                      Start exploring your personalized cooking experience
                    </p>
                  </div>
                </div>

                {/* Resend Email */}
                <div className="mb-8">
                  <p className="text-black/70 dark:text-white/70">
                    Didn&apos;t receive the email?{' '}
                    <button
                      type="button"
                      className="font-medium text-orange-500 hover:text-orange-400"
                      onClick={() => {
                        // Add resend email logic here
                      }}
                    >
                      Resend confirmation
                    </button>
                  </p>
                </div>

                {/* Back to Home */}
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-orange-500 to-red-700 px-6 py-3 font-medium text-white shadow-lg shadow-orange-900/20 hover:from-orange-400 hover:to-red-600 transition-all"
                >
                  <ChefHat className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 