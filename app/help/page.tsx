"use client"

import Branding from "@/components/sub-components/branding";
import { useState } from "react";
import { Mail, Info, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How does Gourmet Bytes generate recipes?",
    answer:
      "Gourmet Bytes uses AI (Gemini 1.5 Flash) to generate recipes based on the ingredients you provide, your preferences, and dietary restrictions.",
  },
  {
    question: "Is my data and API key secure?",
    answer:
      "Yes! Your Gemini API key is encrypted with your password and never shared. We comply with GDPR and industry best practices for privacy.",
  },
  {
    question: "Do I need to pay to use the app?",
    answer:
      "No. Gourmet Bytes is completely free to use. There are no subscription plans or paywalls for essential features.",
  },
  {
    question: "Can I use the app without internet access?",
    answer:
      "No. Since it is a web-based platform, an active internet connection is required for all features, including recipe generation and chatbot assistance.",
  },
  {
    question: "How does the chatbot work?",
    answer:
      "The chatbot uses the same Gemini 1.5 Flash model as the recipe generator. It can help you with recipe suggestions, cooking tips, and general food knowledge.",
  },
  {
    question: "What if the AI gives me a strange or incorrect recipe?",
    answer:
      "AI suggestions are based on prompt engineering and training data, but they may occasionally generate imperfect results. You can refine your inputs or ask the chatbot for clarification or alternatives.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-gradient-from py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Page Header */}
        <div className="flex flex-col items-center mb-12">
          <Branding />
          <h1 className="mt-4 text-4xl font-bold text-black dark:text-white text-center">Help & Support</h1>
          <p className="mt-2 text-lg text-black/60 dark:text-white/60 text-center max-w-xl">
            Find answers, learn about Gourmet Bytes, and get in touch with our team.
          </p>
        </div>

        {/* FAQ Section */}
        <section className="mb-10">
          <div className="bg-white dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-white/10 shadow-md mb-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="text-orange-500 h-6 w-6" />
              <h2 className="text-2xl font-bold text-black dark:text-white">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                  <button
                    className="flex items-center justify-between w-full text-left focus:outline-none"
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    aria-expanded={openIndex === idx}
                  >
                    <span className="font-medium text-black dark:text-white text-lg">{faq.question}</span>
                    {openIndex === idx ? (
                      <ChevronUp className="h-5 w-5 text-orange-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-orange-500" />
                    )}
                  </button>
                  {openIndex === idx && (
                    <div className="mt-2 text-black/70 dark:text-white/70 text-base animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About the Project */}
        <section className="mb-10">
          <div className="bg-white dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-white/10 shadow-md mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-orange-500 h-6 w-6" />
              <h2 className="text-2xl font-bold text-black dark:text-white">About Gourmet Bytes</h2>
            </div>
            <p className="text-black/70 dark:text-white/70 text-lg mb-2">
              Gourmet Bytes is an AI-powered digital cookbook designed to help you create gourmet-level meals with the ingredients you already have at home. Our mission is to make home cooking easy, fun, and accessible for everyone.
            </p>
            <ul className="list-disc pl-6 text-black/60 dark:text-white/60">
              <li>Personalized recipe generation using Gemini 2.0 Flash</li>
              <li>Save and share your favorite recipes</li>
              <li>Open marketplace for community creations</li>
              <li>Privacy-first: your data and API keys are secure</li>
            </ul>
          </div>
        </section>

        {/* Contact/Support Section */}
        <section className="mb-10">
          <div className="bg-white dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-white/10 shadow-md mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-orange-500 h-6 w-6" />
              <h2 className="text-2xl font-bold text-black dark:text-white">Contact & Support</h2>
            </div>
            <p className="text-black/70 dark:text-white/70 text-lg mb-4">
              Need help or want to give feedback? Email us at <a href="mailto:support@gourmetbytes.com" className="text-orange-500 underline">support@gourmetbytes.com</a> or use the contact form below.
            </p>
            {/* Placeholder for contact form */}
            <div className="bg-gray-100 dark:bg-dark-gradient-to rounded-lg p-4 border border-gray-200 dark:border-white/10 text-black/60 dark:text-white/60 text-center">
              [Contact form coming soon]
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 