"use client";

import { useEffect, useState, useRef } from "react";
import { chatWithGemini } from "@/lib/gemini";

interface RecipeContext {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  difficulty?: string;
  servings?: string;
  cuisine?: string;
  tags?: string[];
}

interface Message {
  sender: "user" | "ai";
  text: string;
}

export default function AIChatPage() {
  const [recipe, setRecipe] = useState<RecipeContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recipe context from sessionStorage
    const stored = sessionStorage.getItem("gourmet-bytes-chat-recipe");
    if (stored) {
      setRecipe(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !recipe) return;
    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const aiText = await chatWithGemini(recipe, [...messages, userMsg]);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: aiText },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I couldn't get a response from the AI. Please try again." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-b-xl shadow-md">
        <h1 className="text-xl font-bold">AI Chat about Recipe</h1>
        {recipe && (
          <div className="mt-2">
            <div className="font-semibold text-lg">{recipe.title}</div>
            <div className="text-sm opacity-80">{recipe.description}</div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {recipe.cuisine && <span className="bg-white/20 px-2 py-1 rounded-full">{recipe.cuisine}</span>}
              {recipe.difficulty && <span className="bg-white/20 px-2 py-1 rounded-full">{recipe.difficulty}</span>}
              {recipe.cookingTime && <span className="bg-white/20 px-2 py-1 rounded-full">{recipe.cookingTime}</span>}
              {recipe.servings && <span className="bg-white/20 px-2 py-1 rounded-full">{recipe.servings} servings</span>}
            </div>
          </div>
        )}
      </div>
      {/* Chat Area + Input, flex layout */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800">
        <div className="flex-1 p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-10">Start chatting about this recipe!</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow text-sm whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 animate-pulse">
                The AI chef is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="m-2 p-4 bg-white dark:bg-gray-900 rounded-lg dark:border-gray-700 flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm outline-0"
            placeholder="Ask the AI chef anything about this recipe..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow hover:from-orange-400 hover:to-red-500 transition-all"
            disabled={!input.trim() || loading}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
} 