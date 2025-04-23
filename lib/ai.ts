import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Ask a question about a product
export async function askProductQuestion(question: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a helpful assistant for Shree Mahakali Dairy (SMD), a dairy and sweets shop. 
      Answer the following question about our products.
      If you don't know the answer, politely say so and offer to help with something else.
      
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
