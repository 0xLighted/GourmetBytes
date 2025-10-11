"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  const searchParams = useSearchParams()

  return (
    <main className="flex h-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 dark:from-dark-gradient-from dark:to-dark-gradient-to">
      <div className="flex flex-col items-center justify-center p-6 w-full max-w-lg bg-white/80 dark:bg-dark-card/90 rounded-xl shadow-2xl border border-orange-500/20">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 mb-4">
            <Image src="/branding_white.svg" alt="Gourmet Bytes" width={40} height={40} />
          </div>
          <h1 className="text-5xl font-extrabold text-orange-500 mb-2">404</h1>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Page Not Found</h2>
          <p className="text-center text-black/60 dark:text-white/60 max-w-xs">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-gradient-to-r from-orange-500 to-red-700 px-6 py-3 font-medium text-white shadow-lg hover:from-orange-400 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#0e0f11] transition"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
} 