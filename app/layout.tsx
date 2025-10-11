import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TopProgressBar from "@/components/TopProgressBar";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "../components/context/ThemeContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Gourmet Bytes - AI-Powered Recipe Generator",
  description: "Create personalized recipes with ingredients you already have using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col h-screen`}>
        <ThemeProvider>
          <TopProgressBar />
          <NavBar />
          <div className="grow" id="main">
            {children}
          </div>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
