# Gemini API Setup Guide

This project has been updated to use Google's Gemini API with the official Google Generative AI SDK.

## Setup Instructions

1. **Get a Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Set Environment Variables:**
   Create a `.env.local` file in the root directory with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   **Note:** The SDK also supports `GOOGLE_API_KEY` as an alternative environment variable name.

3. **Available Models:**
   - `gemini-2.0-flash-exp` (default) - Latest and most capable
   - `gemini-1.5-flash` - Fast and efficient
   - `gemini-1.5-pro` - More capable for complex tasks
   - `gemini-pro` - Legacy model

## Changes Made

- Replaced `@ai-sdk/google` with `@google/genai` (official Google Generative AI SDK)
- Updated all API calls to use the new SDK structure
- Updated imports in all components:
  - `app/api/ai/route.ts`
  - `components/natural-language-search.tsx`
  - `components/rule-builder.tsx`
  - `components/data-validation.tsx`

## Features Using Gemini API

- Natural language search
- AI-powered rule generation
- Data validation suggestions
- General AI assistance

## API Structure

The project now uses the official Google Generative AI SDK with the following structure:
```javascript
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const model = ai.models.generateContent({
  model: "gemini-2.0-flash-exp",
  contents: [{ role: "user", parts: [{ text: prompt }] }]
})
```

## Troubleshooting

If you encounter issues:
1. Ensure your API key is valid and has sufficient quota
2. Check that the `.env.local` file is in the root directory
3. **Important:** Use `GEMINI_API_KEY` or `GOOGLE_API_KEY` as the environment variable name
4. Restart your development server after adding environment variables
5. Make sure you're using the latest version of the `@google/genai` package 