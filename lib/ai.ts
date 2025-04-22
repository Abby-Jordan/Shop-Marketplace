// This file contains functions for AI chat assistant

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Product knowledge base for the AI assistant
const productKnowledge = {
  milk: {
    cow: {
      fat: "3.5% fat content",
      protein: "3.3g protein per 100ml",
      calories: "65 kcal per 100ml",
      source: "Sourced from grass-fed cows",
      benefits: "Rich in calcium and essential nutrients",
    },
    buffalo: {
      fat: "6-8% fat content, higher than cow milk",
      protein: "4g protein per 100ml",
      calories: "100 kcal per 100ml",
      source: "Sourced from free-range buffaloes",
      benefits: "Creamier texture, higher in calcium than cow milk",
    },
  },
  paneer: {
    fat: "Contains approximately 20-25% fat",
    protein: "High in protein, about 18g per 100g",
    calories: "265 kcal per 100g",
    source: "Made from pure cow milk",
    benefits: "Good source of calcium and protein, vegetarian alternative to meat",
  },
  sweets: {
    "gulab jamun": {
      ingredients: "Milk solids, flour, sugar syrup, cardamom, rose water",
      calories: "Approximately 150-180 kcal per piece",
      shelf_life: "Best consumed within 2-3 days if kept at room temperature, 5-7 days if refrigerated",
    },
    rasgulla: {
      ingredients: "Cottage cheese (chenna), semolina, sugar syrup",
      calories: "Approximately 120-150 kcal per piece",
      shelf_life: "Best consumed within 2-3 days if kept at room temperature, 5-7 days if refrigerated",
    },
    "kaju katli": {
      ingredients: "Cashew nuts, sugar, cardamom, silver varq",
      calories: "Approximately 90-110 kcal per piece",
      shelf_life: "Can be stored for up to 2 weeks in an airtight container",
    },
  },
  namkeen: {
    "aloo bhujia": {
      ingredients: "Potato, gram flour, spices, salt",
      calories: "Approximately 150 kcal per 30g serving",
      shelf_life: "Can be stored for up to 1 month in an airtight container",
    },
    mixture: {
      ingredients: "Gram flour, rice flakes, peanuts, spices, salt",
      calories: "Approximately 170 kcal per 30g serving",
      shelf_life: "Can be stored for up to 1 month in an airtight container",
    },
  },
}

// Ask a question about a product
export async function askProductQuestion(question: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a helpful assistant for Shree Mahakali Dairy (SMD), a dairy and sweets shop. 
      Answer the following question about our products using the knowledge base provided.
      If you don't know the answer, politely say so and offer to help with something else.
      
      Knowledge base:
      ${JSON.stringify(productKnowledge, null, 2)}
      
      Question: ${question}`,
      system:
        "You are a helpful, friendly, and knowledgeable assistant for Shree Mahakali Dairy. Provide concise, accurate information about our products. If you don't know something specific, be honest and suggest alternatives or offer to help with something else. Always maintain a warm, professional tone.",
    })

    return text
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "I'm sorry, I'm having trouble answering your question right now. Please try again later or contact our customer service for assistance."
  }
}
