import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Recipe type for generated recipes
export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: string;
  difficulty: string;
  servings: number;
  cuisine: string;
  tags: string[];
  // Added fields for social interactions
  likes?: number;
  comments?: number;
  saved?: boolean;
};

/**
 * Validate a Gemini API key by testing a simple request
 * @param apiKey The Gemini API key to validate
 * @returns A Promise that resolves to true if valid, or rejects with an error if invalid
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("API key is empty");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 50,
      }
    });
    
    // Make a simple request to validate the key
    const prompt = "Respond with only the word 'valid' if you can read this message.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase();
    
    // Check if response contains the word "valid"
    if (!text.includes("valid")) {
      throw new Error("Invalid API response format");
    }
    
    return true;
  } catch (error) {
    console.error("API key validation failed:", error);
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Invalid API key");
      } else if (error.message.includes("Permission denied")) {
        throw new Error("API key does not have sufficient permissions");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please try again later.");
      }
    }
    throw new Error("Unable to validate API key. Please check your connection and try again.");
  }
}

/**
 * Get the user's Gemini API key from Supabase
 */
export async function getUserGeminiKey() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const geminiKey = user.user_metadata.gemini_key;
  
  if (!geminiKey) {
    throw new Error("Gemini API key not found");
  }

  return geminiKey;
}

/**
 * Generate recipes using Gemini API
 */
export async function generateRecipes(
  ingredients: string,
  preferences: {
    cuisine: string;
    dietaryRestrictions: string;
    mealType: string;
    difficulty: string;
    cooking_time: string;
    servingSize: number;
    additionalNotes: string;
    strictIngredients: boolean;
  }
): Promise<Recipe[]> {
  try {
    const apiKey = await getUserGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    // Build the prompt
    const preferencesList = Object.entries(preferences)
      .filter(([value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const prompt = `
      As a professional chef and recipe curator, create recipes based on the following ingredients and preferences.
      
      Ingredients available:
      ${ingredients}
      
      Preferences:
      ${preferencesList}
      
      Generate 10 diverse, creative recipes using the provided ingredients.
      ${preferences.strictIngredients ? "ONLY use the ingredients listed above." : "You may suggest a few additional basic ingredients if needed."}
      
      For each recipe, provide the following in JSON format:
      - title: A catchy descriptive title
      - description: A brief description
      - ingredients: List of ingredients with quantities
      - instructions: Step-by-step detailed instructions
      - cooking_time: Cooking time in minutes as integer
      - difficulty: Difficulty (1-5)
      - servings: Serving size
      - cuisine: Cuisine type
      - tags: Tags (relevant keywords)
      
      Focus on quality over quantity - provide detailed, accurate, and appetizing recipes.
      Respond with only a valid JSON array of recipe objects.
    `;

    try {
      // Request JSON format from the model
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      let cleanedText = text;
      
      // Remove any markdown code blocks
      cleanedText = cleanedText.replace(/```(?:json)?|```/g, '');
      
      // Remove any comments that might be in the response
      cleanedText = cleanedText.replace(/\/\/.*/g, '');
      
      // Try to extract just the JSON array if other text is present
      const jsonArrayMatch = cleanedText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonArrayMatch) {
        cleanedText = jsonArrayMatch[0];
      }
      
      // Final trim and cleanup
      cleanedText = cleanedText.trim();
      
      const recipes = JSON.parse(cleanedText) as Recipe[];
      
      // Add unique IDs based on recipe names and ensure all required fields exist
      const processedRecipes = recipes.map(recipe => {
        const recipeData = recipe as any;
        
        return {
          ...recipe,
          // Ensure required fields exist with defaults if missing
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          // Ensure servings is populated and is a number
          servings: recipe.servings || recipeData.serving_size || recipeData.servingSize || Number(preferences.servingSize) || 2,
          // Ensure cuisine is populated
          cuisine: recipe.cuisine || preferences.cuisine || "Mixed Cuisine",
          // Add social interaction fields
          likes: 0,
          comments: 0,
          saved: false,
        };
      });
      
      return processedRecipes;
    } catch (parseError) {
      console.error("Error with recipe generation:", parseError);
      throw new Error("Failed to generate recipes from AI response");
    }
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
}

/**
 * Chat with Gemini about a recipe
 * @param recipeContext The recipe context (title, description, ingredients, etc.)
 * @param chatHistory Array of messages (user/ai) for context
 * @returns The AI's response as a string
 */
export async function chatWithGemini(
  recipeContext: {
    title: string;
    description: string;
    ingredients: any[];
    instructions: string[];
    cooking_time?: string;
    difficulty?: string;
    servings?: string | number;
    cuisine?: string;
    tags?: string[];
  },
  chatHistory: { sender: "user" | "ai"; text: string }[]
): Promise<string> {
  try {
    const apiKey = await getUserGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    // System prompt with recipe context
    const systemPrompt = `
You are a helpful, expert chef AI. The user is chatting about this recipe:
Title: ${recipeContext.title}
Description: ${recipeContext.description}
Ingredients: ${Array.isArray(recipeContext.ingredients) ? recipeContext.ingredients.join(", ") : ""}
Instructions: ${Array.isArray(recipeContext.instructions) ? recipeContext.instructions.join(" | ") : ""}
Cooking Time: ${recipeContext.cooking_time || "N/A"}
Difficulty: ${recipeContext.difficulty || "N/A"}
Servings: ${recipeContext.servings || "N/A"}
Cuisine: ${recipeContext.cuisine || "N/A"}
Tags: ${Array.isArray(recipeContext.tags) ? recipeContext.tags.join(", ") : ""}

Always answer as a friendly, knowledgeable chef. If the user asks for clarification or substitutions, use the recipe context above.
`;

    // Build chat history for Gemini (prepend system prompt as first user message)
    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...chatHistory.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      })),
    ];

    const result = await model.generateContent({ contents: history });
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    throw new Error("Failed to get a response from Gemini AI");
  }
} 

