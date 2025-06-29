"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Trash2, Sparkles, MessageSquare, Lightbulb } from "lucide-react"
import { useData, type Rule } from "@/contexts/data-context"

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

export default function RuleBuilder() {
  const { state, dispatch } = useData()
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    type: "coRun",
    name: "",
    description: "",
    parameters: {},
    active: true,
  })
  const [naturalLanguageRule, setNaturalLanguageRule] = useState("")
  const [isProcessingNL, setIsProcessingNL] = useState(false)
  const [ruleRecommendations, setRuleRecommendations] = useState<string[]>([])
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  const ruleTypes = [
    { value: "coRun", label: "Co-Run Tasks", description: "Tasks that must run together" },
    { value: "slotRestriction", label: "Slot Restriction", description: "Limit slots for groups" },
    { value: "loadLimit", label: "Load Limit", description: "Maximum load per worker group" },
    { value: "phaseWindow", label: "Phase Window", description: "Restrict tasks to specific phases" },
    { value: "patternMatch", label: "Pattern Match", description: "Rules based on patterns" },
    { value: "precedence", label: "Precedence", description: "Task ordering rules" },
  ]

  const addRule = () => {
    if (!newRule.name || !newRule.type) return

    const rule: Rule = {
      id: `rule-${Date.now()}`,
      type: newRule.type as any,
      name: newRule.name,
      description: newRule.description || "",
      parameters: newRule.parameters || {},
      active: newRule.active ?? true,
    }

    dispatch({ type: "ADD_RULE", payload: rule })

    setNewRule({
      type: "coRun",
      name: "",
      description: "",
      parameters: {},
      active: true,
    })
  }

  const processNaturalLanguageRule = async () => {
    if (!naturalLanguageRule.trim()) return

    setIsProcessingNL(true)

    try {
      const systemPrompt = `You are a business rules expert. Convert natural language rule descriptions into structured rule objects.
        
        Available rule types:
        - coRun: Tasks that must run together
        - slotRestriction: Limit slots for groups  
        - loadLimit: Maximum load per worker group
        - phaseWindow: Restrict tasks to specific phases
        - patternMatch: Rules based on patterns
        - precedence: Task ordering rules
        
        IMPORTANT: Return ONLY a JSON object with: { "type", "name", "description", "parameters" }
        Do not include any other text or markdown formatting.`

      const prompt = `Convert this natural language rule: "${naturalLanguageRule}"
        
        Available data context:
        - Clients: ${state.clients.map((c) => c.ClientID).join(", ")}
        - Workers: ${state.workers.map((w) => w.WorkerID).join(", ")}
        - Tasks: ${state.tasks.map((t) => t.TaskID).join(", ")}
        
        Return ONLY a JSON object.`

      const text = await callAI(prompt, systemPrompt, {})
      console.log("Raw AI response for rule:", text)
      
      let parsedRule
      try {
        // First try to parse as-is
        parsedRule = JSON.parse(text)
        console.log("Successfully parsed rule:", parsedRule)
      } catch (parseError) {
        console.log("Initial JSON parse failed, trying to extract from markdown...")
        console.log("Raw AI response:", text)
        
        try {
          // Try to extract JSON from markdown
          const cleanedText = extractJSONFromMarkdown(text)
          console.log("Cleaned text:", cleanedText)
          parsedRule = JSON.parse(cleanedText)
          console.log("Successfully parsed rule after markdown extraction:", parsedRule)
        } catch (secondParseError) {
          console.error("Failed to parse AI response as JSON after markdown extraction:", secondParseError)
          console.log("Response length:", text.length)
          console.log("First 200 characters:", text.substring(0, 200))
          console.log("Last 200 characters:", text.substring(text.length - 200))
          
          // Fallback: create a basic rule
          parsedRule = {
            type: "patternMatch",
            name: `Rule: ${naturalLanguageRule.substring(0, 30)}...`,
            description: naturalLanguageRule,
            parameters: {}
          }
        }
      }
      
      // Validate the parsed rule has required fields
      if (!parsedRule.type || !parsedRule.name) {
        console.error("Parsed rule missing required fields:", parsedRule)
        parsedRule = {
          type: "patternMatch",
          name: `Rule: ${naturalLanguageRule.substring(0, 30)}...`,
          description: naturalLanguageRule,
          parameters: {}
        }
      }
      
      setNewRule({
        ...parsedRule,
        active: true,
      })
      setNaturalLanguageRule("")
    } catch (error) {
      console.error("Failed to process natural language rule:", error)
      // Show error to user
      alert("Failed to process rule. Please try a different description.")
    } finally {
      setIsProcessingNL(false)
    }
  }

  const generateRuleRecommendations = async () => {
    setIsGeneratingRecommendations(true)
    try {
      const systemPrompt = `You are a resource allocation expert. Analyze data patterns and suggest business rules. 
      
      IMPORTANT: Return ONLY a JSON array of strings with rule suggestions. Do not include any other text or markdown formatting.
      
      Example format: ["Rule suggestion 1", "Rule suggestion 2", "Rule suggestion 3"]`

      const prompt = `Analyze this data and suggest 3-5 business rules for resource allocation:
        
        Clients: ${JSON.stringify(state.clients.slice(0, 5))}
        Workers: ${JSON.stringify(state.workers.slice(0, 5))}
        Tasks: ${JSON.stringify(state.tasks.slice(0, 5))}
        
        Look for patterns like:
        - Tasks that often appear together
        - Worker overload situations
        - Skill mismatches
        - Phase conflicts
        - Priority imbalances
        
        Return ONLY a JSON array of rule suggestions as strings.`

      const text = await callAI(prompt, systemPrompt, {})
      console.log("Raw AI response for recommendations:", text)
      
      let recommendations
      try {
        // First try to parse as-is
        recommendations = JSON.parse(text)
        console.log("Successfully parsed recommendations:", recommendations)
      } catch (parseError) {
        console.log("Initial JSON parse failed, trying to extract from markdown...")
        console.log("Raw AI response:", text)
        
        try {
          // Try to extract JSON from markdown
          const cleanedText = extractJSONFromMarkdown(text)
          console.log("Cleaned text:", cleanedText)
          recommendations = JSON.parse(cleanedText)
          console.log("Successfully parsed recommendations after markdown extraction:", recommendations)
        } catch (secondParseError) {
          console.error("Failed to parse AI response as JSON after markdown extraction:", secondParseError)
          console.log("Response length:", text.length)
          console.log("First 200 characters:", text.substring(0, 200))
          console.log("Last 200 characters:", text.substring(text.length - 200))
          
          // Fallback: create some basic recommendations based on data
          recommendations = [
            "Limit frontend developers to maximum 3 tasks per phase",
            "Ensure backend and frontend tasks are balanced across phases",
            "Prioritize enterprise clients with urgent timelines",
            "Match worker skills to task requirements automatically"
          ]
        }
      }
      
      // Ensure recommendations is an array
      if (!Array.isArray(recommendations)) {
        console.error("AI response is not an array:", recommendations)
        recommendations = [
          "Limit frontend developers to maximum 3 tasks per phase",
          "Ensure backend and frontend tasks are balanced across phases",
          "Prioritize enterprise clients with urgent timelines",
          "Match worker skills to task requirements automatically"
        ]
      }
      
      setRuleRecommendations(recommendations)
    } catch (error) {
      console.error("Failed to generate recommendations:", error)
      // Fallback recommendations
      setRuleRecommendations([
        "Limit frontend developers to maximum 3 tasks per phase",
        "Ensure backend and frontend tasks are balanced across phases", 
        "Prioritize enterprise clients with urgent timelines",
        "Match worker skills to task requirements automatically"
      ])
      // Show error to user
      alert("AI recommendation failed. Using fallback suggestions.")
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const renderRuleParameters = (rule: Partial<Rule>) => {
    switch (rule.type) {
      case "coRun":
        return (
          <div className="space-y-4">
            <div>
              <Label>Task IDs (comma-separated)</Label>
              <Input
                placeholder="T001, T002, T003"
                value={rule.parameters?.tasks?.join(", ") || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      tasks: e.target.value.split(",").map((t) => t.trim()),
                    },
                  }))
                }
              />
            </div>
          </div>
        )

      case "loadLimit":
        return (
          <div className="space-y-4">
            <div>
              <Label>Worker Group</Label>
              <Select
                value={rule.parameters?.workerGroup || ""}
                onValueChange={(value) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, workerGroup: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select worker group" />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set(state.workers.map((w) => w.WorkerGroup))].map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Slots Per Phase</Label>
              <Input
                type="number"
                value={rule.parameters?.maxSlots || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, maxSlots: Number.parseInt(e.target.value) },
                  }))
                }
              />
            </div>
          </div>
        )

      case "phaseWindow":
        return (
          <div className="space-y-4">
            <div>
              <Label>Task ID</Label>
              <Select
                value={rule.parameters?.taskId || ""}
                onValueChange={(value) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: { ...prev.parameters, taskId: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {state.tasks.map((task) => (
                    <SelectItem key={task.TaskID} value={task.TaskID}>
                      {task.TaskName} ({task.TaskID})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Allowed Phases (comma-separated)</Label>
              <Input
                placeholder="1, 2, 3"
                value={rule.parameters?.phases?.join(", ") || ""}
                onChange={(e) =>
                  setNewRule((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      phases: e.target.value
                        .split(",")
                        .map((p) => Number.parseInt(p.trim()))
                        .filter((p) => !isNaN(p)),
                    },
                  }))
                }
              />
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label>Parameters (JSON)</Label>
            <Textarea
              placeholder='{"key": "value"}'
              value={JSON.stringify(rule.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value)
                  setNewRule((prev) => ({ ...prev, parameters: params }))
                } catch {}
              }}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Rule Builder Header */}
      <Card className="card-hover glass-effect border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Business Rules Configuration
          </CardTitle>
          <CardDescription>Create and manage business rules for resource allocation with AI assistance</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual">Manual Rules</TabsTrigger>
          <TabsTrigger value="natural">Natural Language</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Manual Rule Creation */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Rule Type</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) => setNewRule((prev) => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ruleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rule Name</Label>
                  <Input
                    placeholder="Enter rule name"
                    value={newRule.name}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this rule does"
                  value={newRule.description}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {renderRuleParameters(newRule)}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newRule.active}
                  onCheckedChange={(checked) => setNewRule((prev) => ({ ...prev, active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <Button onClick={addRule} disabled={!newRule.name || !newRule.type}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="natural" className="space-y-6">
          {/* Natural Language Rule Creation */}
          <Card className="card-hover glass-effect border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Natural Language Rule Creator
              </CardTitle>
              <CardDescription>
                Describe your rule in plain English and let AI convert it to a structured rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Describe Your Rule</Label>
                <Textarea
                  placeholder="e.g., 'Tasks T001 and T002 should always run together' or 'Sales team workers should not exceed 3 tasks per phase'"
                  value={naturalLanguageRule}
                  onChange={(e) => setNaturalLanguageRule(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={processNaturalLanguageRule} disabled={!naturalLanguageRule.trim() || isProcessingNL}>
                {isProcessingNL ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Convert to Rule
                  </>
                )}
              </Button>

              {/* Preview of converted rule */}
              {newRule.name && (
                <div className="border rounded-lg p-4 bg-card/50">
                  <h4 className="font-semibold mb-2">Converted Rule Preview:</h4>
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {newRule.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {newRule.type}
                    </p>
                    <p>
                      <strong>Description:</strong> {newRule.description}
                    </p>
                    <p>
                      <strong>Parameters:</strong> {JSON.stringify(newRule.parameters, null, 2)}
                    </p>
                  </div>
                  <Button onClick={addRule} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add This Rule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* AI Rule Recommendations */}
          <Card className="card-hover glass-effect border-yellow-200/50 dark:border-yellow-800/50 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                AI Rule Recommendations
              </CardTitle>
              <CardDescription>Get intelligent suggestions based on your data patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={generateRuleRecommendations} disabled={isGeneratingRecommendations}>
                {isGeneratingRecommendations ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Recommendations
                  </>
                )}
              </Button>

              {isGeneratingRecommendations && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
                </div>
              )}

              {ruleRecommendations.length > 0 && (
                <div className="space-y-3">
                  {ruleRecommendations.map((recommendation, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-card/50">
                      <p className="text-sm">{recommendation}</p>
                      <Button size="sm" className="mt-2" onClick={() => setNaturalLanguageRule(recommendation)}>
                        Use This Suggestion
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Existing Rules */}
      {state.rules.length > 0 && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Active Rules ({state.rules.length})</CardTitle>
            <CardDescription>Manage your existing business rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 bg-card/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rule.name}</h4>
                        <Badge variant={rule.active ? "default" : "secondary"}>
                          {rule.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{rule.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                      <div className="text-xs text-muted-foreground">Parameters: {JSON.stringify(rule.parameters)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.active}
                        onCheckedChange={(checked) =>
                          dispatch({
                            type: "UPDATE_RULE",
                            payload: { id: rule.id, data: { active: checked } },
                          })
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: "DELETE_RULE", payload: rule.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
