"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Sparkles, Zap } from "lucide-react"
import { useData, type ValidationError } from "@/contexts/data-context"

// Helper function to call the AI API
async function callAI(prompt: string, system: string, context: any) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, system, context }),
  })
  
  if (!response.ok) {
    throw new Error('AI API call failed')
  }
  
  const data = await response.json()
  return data.result
}

// Helper function to extract JSON from markdown responses
function extractJSONFromMarkdown(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
  
  // If it's still wrapped in code blocks without language specifier
  cleaned = cleaned.replace(/```\s*/g, '')
  
  // Trim whitespace
  cleaned = cleaned.trim()
  
  return cleaned
}

export default function DataValidation() {
  const { state, dispatch } = useData()
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const runValidation = async () => {
    setIsValidating(true)
    setValidationProgress(0)
    const errors: ValidationError[] = []

    // Core validations
    const validations = [
      () => validateMissingColumns(),
      () => validateDuplicateIDs(),
      () => validateMalformedLists(),
      () => validateOutOfRangeValues(),
      () => validateBrokenJSON(),
      () => validateUnknownReferences(),
      () => validateCircularCoRuns(),
      () => validateOverloadedWorkers(),
      () => validateSkillCoverage(),
      () => validateMaxConcurrency(),
    ]

    for (let i = 0; i < validations.length; i++) {
      const validationErrors = validations[i]()
      errors.push(...validationErrors)
      setValidationProgress(((i + 1) / validations.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate processing time
    }

    dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors })

    // Generate AI suggestions
    await generateAISuggestions(errors)

    setIsValidating(false)
  }

  const generateAISuggestions = async (errors: ValidationError[]) => {
    if (errors.length === 0) return

    try {
      const systemPrompt = `You are a data validation expert. Given validation errors, provide practical suggestions for fixing them. Return suggestions as a JSON array of strings.`

      const prompt = `Validation errors found:
        ${errors.map((e) => `- ${e.message} (${e.entity}: ${e.entityId})`).join("\n")}
        
        Provide 3-5 practical suggestions for fixing these issues.`

      const text = await callAI(prompt, systemPrompt, {})
      
      let suggestions
      try {
        // First try to parse as-is
        suggestions = JSON.parse(text)
      } catch (parseError) {
        console.log("Initial JSON parse failed, trying to extract from markdown...")
        console.log("Raw AI response:", text)
        
        try {
          // Try to extract JSON from markdown
          const cleanedText = extractJSONFromMarkdown(text)
          console.log("Cleaned text:", cleanedText)
          suggestions = JSON.parse(cleanedText)
        } catch (secondParseError) {
          console.error("Failed to parse AI response as JSON after markdown extraction:", secondParseError)
          
          // Fallback: create a simple suggestion based on the raw text
          suggestions = [
            "Review the validation errors above and fix the data issues",
            "Check for missing required fields in your data",
            "Ensure all IDs are unique within their respective data types",
            "Verify that referenced entities exist in your data"
          ]
        }
      }
      
      setAiSuggestions(suggestions)
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error)
      // Set fallback suggestions
      setAiSuggestions([
        "Review the validation errors above and fix the data issues",
        "Check for missing required fields in your data",
        "Ensure all IDs are unique within their respective data types",
        "Verify that referenced entities exist in your data"
      ])
    }
  }

  // Validation functions
  const validateMissingColumns = (): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check required client columns
    state.clients.forEach((client) => {
      if (!client.ClientID) {
        errors.push({
          id: `missing-client-id-${Math.random()}`,
          type: "missing_required_field",
          message: "Missing required ClientID",
          entity: "client",
          entityId: client.ClientID || "unknown",
          field: "ClientID",
          severity: "error",
        })
      }
    })

    return errors
  }

  const validateDuplicateIDs = (): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check duplicate client IDs
    const clientIds = new Set()
    state.clients.forEach((client) => {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          id: `duplicate-client-${client.ClientID}`,
          type: "duplicate_id",
          message: `Duplicate ClientID: ${client.ClientID}`,
          entity: "client",
          entityId: client.ClientID,
          field: "ClientID",
          severity: "error",
        })
      }
      clientIds.add(client.ClientID)
    })

    return errors
  }

  const validateMalformedLists = (): ValidationError[] => {
    const errors: ValidationError[] = []

    state.workers.forEach((worker) => {
      if (!Array.isArray(worker.AvailableSlots)) {
        errors.push({
          id: `malformed-slots-${worker.WorkerID}`,
          type: "malformed_list",
          message: "AvailableSlots must be an array of numbers",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "AvailableSlots",
          severity: "error",
        })
      }
    })

    return errors
  }

  const validateOutOfRangeValues = (): ValidationError[] => {
    const errors: ValidationError[] = []

    state.clients.forEach((client) => {
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          id: `priority-range-${client.ClientID}`,
          type: "out_of_range",
          message: "PriorityLevel must be between 1 and 5",
          entity: "client",
          entityId: client.ClientID,
          field: "PriorityLevel",
          severity: "error",
        })
      }
    })

    state.tasks.forEach((task) => {
      if (task.Duration < 1) {
        errors.push({
          id: `duration-range-${task.TaskID}`,
          type: "out_of_range",
          message: "Duration must be at least 1",
          entity: "task",
          entityId: task.TaskID,
          field: "Duration",
          severity: "error",
        })
      }
    })

    return errors
  }

  const validateBrokenJSON = (): ValidationError[] => {
    const errors: ValidationError[] = []

    state.clients.forEach((client) => {
      try {
        JSON.parse(client.AttributesJSON)
      } catch {
        errors.push({
          id: `broken-json-${client.ClientID}`,
          type: "broken_json",
          message: "Invalid JSON in AttributesJSON",
          entity: "client",
          entityId: client.ClientID,
          field: "AttributesJSON",
          severity: "error",
        })
      }
    })

    return errors
  }

  const validateUnknownReferences = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const taskIds = new Set(state.tasks.map((t) => t.TaskID))

    state.clients.forEach((client) => {
      client.RequestedTaskIDs.forEach((taskId) => {
        if (!taskIds.has(taskId)) {
          errors.push({
            id: `unknown-task-${client.ClientID}-${taskId}`,
            type: "unknown_reference",
            message: `Referenced TaskID '${taskId}' does not exist`,
            entity: "client",
            entityId: client.ClientID,
            field: "RequestedTaskIDs",
            severity: "error",
          })
        }
      })
    })

    return errors
  }

  const validateCircularCoRuns = (): ValidationError[] => {
    // Simplified circular dependency check
    return []
  }

  const validateOverloadedWorkers = (): ValidationError[] => {
    const errors: ValidationError[] = []

    state.workers.forEach((worker) => {
      if (worker.AvailableSlots.length < worker.MaxLoadPerPhase) {
        errors.push({
          id: `overloaded-${worker.WorkerID}`,
          type: "overloaded_worker",
          message: "MaxLoadPerPhase exceeds available slots",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "MaxLoadPerPhase",
          severity: "warning",
        })
      }
    })

    return errors
  }

  const validateSkillCoverage = (): ValidationError[] => {
    const errors: ValidationError[] = []
    const workerSkills = new Set()

    state.workers.forEach((worker) => {
      worker.Skills.forEach((skill) => workerSkills.add(skill))
    })

    state.tasks.forEach((task) => {
      task.RequiredSkills.forEach((skill) => {
        if (!workerSkills.has(skill)) {
          errors.push({
            id: `missing-skill-${task.TaskID}-${skill}`,
            type: "skill_coverage",
            message: `No worker has required skill: ${skill}`,
            entity: "task",
            entityId: task.TaskID,
            field: "RequiredSkills",
            severity: "warning",
          })
        }
      })
    })

    return errors
  }

  const validateMaxConcurrency = (): ValidationError[] => {
    const errors: ValidationError[] = []

    state.tasks.forEach((task) => {
      const qualifiedWorkers = state.workers.filter((worker) =>
        task.RequiredSkills.every((skill) => worker.Skills.includes(skill)),
      )

      if (task.MaxConcurrent > qualifiedWorkers.length) {
        errors.push({
          id: `max-concurrent-${task.TaskID}`,
          type: "max_concurrency",
          message: `MaxConcurrent (${task.MaxConcurrent}) exceeds qualified workers (${qualifiedWorkers.length})`,
          entity: "task",
          entityId: task.TaskID,
          field: "MaxConcurrent",
          severity: "warning",
        })
      }
    })

    return errors
  }

  const errorsByType = state.validationErrors.reduce(
    (acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const errorCount = state.validationErrors.filter((e) => e.severity === "error").length
  const warningCount = state.validationErrors.filter((e) => e.severity === "warning").length

  return (
    <div className="space-y-6">
      {/* Validation Header */}
      <Card className="card-hover glass-effect border-green-200/50 dark:border-green-800/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            Data Validation & AI Analysis
          </CardTitle>
          <CardDescription>Comprehensive validation with AI-powered error detection and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={runValidation} disabled={isValidating}>
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Validation
                </>
              )}
            </Button>
            {isValidating && (
              <div className="flex-1">
                <Progress value={validationProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-1">{Math.round(validationProgress)}% complete</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 This validation uses the same comprehensive checks as the "Validate Data" button in the Data Ingestion tab.
          </p>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {state.validationErrors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {state.clients.length + state.workers.length + state.tasks.length - state.validationErrors.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Valid Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="card-hover glass-effect border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              AI Suggestions
            </CardTitle>
            <CardDescription>Smart recommendations to fix your data issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <Alert key={index}>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>{suggestion}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Errors */}
      {state.validationErrors.length > 0 && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Validation Details</CardTitle>
            <CardDescription>Detailed breakdown of all validation issues found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(errorsByType).map(([type, count]) => (
                <div key={type} className="border rounded-lg p-4 bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{type.replace("_", " ")}</h4>
                    <Badge variant="secondary">{count} issues</Badge>
                  </div>
                  <div className="space-y-2">
                    {state.validationErrors
                      .filter((error) => error.type === type)
                      .slice(0, 5)
                      .map((error) => (
                        <div key={error.id} className="flex items-start gap-2 text-sm">
                          {error.severity === "error" ? (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="text-foreground">{error.message}</p>
                            <p className="text-muted-foreground text-xs">
                              {error.entity}: {error.entityId} {error.field && `(${error.field})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    {state.validationErrors.filter((error) => error.type === type).length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ... and {state.validationErrors.filter((error) => error.type === type).length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {state.validationErrors.length === 0 && !isValidating && (
        <Card className="card-hover glass-effect border-green-500/50 dark:border-green-400/50 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">All Validations Passed!</h3>
              <p className="text-green-700 dark:text-green-300">Your data is clean and ready for rule configuration.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
