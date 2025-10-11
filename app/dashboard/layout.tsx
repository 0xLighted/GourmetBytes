"use client";

import React from "react";
import Link from "next/link";
import AuthCheck from "@/components/auth/AuthCheck";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const navItems = [
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: Bookmark, label: "Saved Recipes", path: "/dashboard/saved-recipes" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <AuthCheck>
      <div className="flex bg-gray-50 dark:bg-gradient-to-b dark:from-dark-gradient-from dark:to-dark-gradient-to h-full">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 p-2 rounded-full bg-white dark:bg-dark-card text-gray-800 dark:text-white outline outline-orange-500 md:hidden"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar - mobile overlay when open */}
        <div
          className={twMerge(
            "fixed inset-0 bg-white dark:bg-black backdrop-blur-md z-40 transition-opacity duration-300 md:hidden",
            sidebarOpen ? "opacity-50" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleSidebar}
        />

        {/* Sidebar navigation */}
        <aside
          className={twMerge(
            "fixed md:sticky md:top-0 z-40 w-64 transition-transform duration-300 ease-in-out rounded-lg md:rounded-none",
            "bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm",
            sidebarOpen ? "translate-5 md:translate-0" : "-translate-x-full md:translate-x-0 translate-y-5 md:translate-y-0"
          )}
        >
          {/* <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
            <ChefHat className="mr-2 text-orange-500"/>
            <h1 className="text-xl font-bold text-orange-500">Dashboard</h1>
          </div> */}

          <nav className="flex-1 flex flex-col overflow-y-auto p-4 justify-around">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={twMerge(
                        "flex items-center p-3 rounded-lg transition-colors duration-200",
                        "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                        isActive
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-500 font-medium"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={async () => {
                  const supabase = createClientComponentClient();
                  await supabase.auth.signOut();
                }}
                className="flex items-center p-3 mt-4 w-full text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 md:px-8 py-8 md:ml-0">{children}</main>
      </div>
    </AuthCheck>
  );
}
