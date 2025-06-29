"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function AITest() {
  const [isTesting, setIsTesting] = useState(false)
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const testAI = async () => {
    setIsTesting(true)
    setResult("")
    setError("")

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "Say hello and return a simple JSON response: {\"message\": \"Hello from AI\"}",
          system: "You are a helpful AI assistant. Return only JSON responses.",
          context: {}
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="card-hover glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI API Test
        </CardTitle>
        <CardDescription>Test the AI API connection and response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testAI} disabled={isTesting}>
          {isTesting ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test AI API"
          )}
        </Button>

        {result && (
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Success:</h4>
            <pre className="text-sm text-green-700 dark:text-green-300 overflow-auto">
              {result}
            </pre>
          </div>
        )}

        {error && (
          <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error:</h4>
            <pre className="text-sm text-red-700 dark:text-red-300 overflow-auto">
              {error}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 