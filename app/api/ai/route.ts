import { GoogleGenAI } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"

// Helper function to extract JSON from markdown response
function extractJSONFromMarkdown(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
  
  // Try to find JSON object or array in the text
  // Look for the first occurrence of { or [ and find its matching closing bracket
  let startIndex = -1
  let bracketType = ''
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      startIndex = i
      bracketType = '{'
      break
    } else if (cleaned[i] === '[') {
      startIndex = i
      bracketType = '['
      break
    }
  }
  
  if (startIndex === -1) {
    // No JSON found, return the original text
    return text
  }
  
  // Find the matching closing bracket
  let bracketCount = 0
  let endIndex = -1
  
  for (let i = startIndex; i < cleaned.length; i++) {
    if (cleaned[i] === bracketType) {
      bracketCount++
    } else if (cleaned[i] === (bracketType === '{' ? '}' : ']')) {
      bracketCount--
      if (bracketCount === 0) {
        endIndex = i
        break
      }
    }
  }
  
  if (endIndex === -1) {
    // No matching closing bracket found, return the original text
    return text
  }
  
  // Extract the JSON content
  const jsonContent = cleaned.substring(startIndex, endIndex + 1)
  
  // Validate that it's actually valid JSON
  try {
    JSON.parse(jsonContent)
    return jsonContent
  } catch (error) {
    console.warn("Extracted content is not valid JSON:", jsonContent)
    return text
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, system, context } = await request.json()

    // Use the correct environment variable
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })
    
    // Use the correct model name
    const model = ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${system || "You are a helpful AI assistant."}\n\n${prompt}\n\nContext: ${JSON.stringify(context, null, 2)}` }]
        }
      ]
    })

    const response = await model
    const rawText = response.text || ""
    
    console.log("Raw AI response:", rawText)
    
    // Extract JSON if the response contains markdown formatting
    const cleanedText = extractJSONFromMarkdown(rawText)

    return NextResponse.json({ result: cleanedText })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 })
  }
}
