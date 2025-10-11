"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCheck({
  children,
  redirectTo = "/get-started",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(redirectTo);
          return;
        }
        setAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push(redirectTo);
      } else if (event === "SIGNED_IN" && !authenticated) {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, redirectTo, authenticated]);

  if (loading) {
    // Return a loading spinner
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
} 