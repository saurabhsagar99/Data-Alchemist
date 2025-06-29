"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Sparkles, Loader2, Users, Briefcase, Target } from "lucide-react"
import { useData } from "@/contexts/data-context"

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

export default function NaturalLanguageSearch() {
  const { state, dispatch } = useData()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<string>("")

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    dispatch({ type: "SET_SEARCH_QUERY", payload: query })

    try {
      // Create context for AI
      const context = {
        clients: state.clients,
        workers: state.workers,
        tasks: state.tasks,
      }

      const systemPrompt = `You are a data search assistant. Given a natural language query and data context, return a JSON object with filtered results.
        
        The data structure is:
        - clients: array of {ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON}
        - workers: array of {WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel}
        - tasks: array of {TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent}
        
        Return only a JSON object with the filtered results in the format:
        {
          "clients": [...],
          "workers": [...],
          "tasks": [...],
          "explanation": "Brief explanation of what was found"
        }`

      const prompt = `Search query: "${query}"
        
        Data context: ${JSON.stringify(context, null, 2)}
        
        Filter the data based on the natural language query and return the matching results.`

      const text = await callAI(prompt, systemPrompt, context)
      
      let results
      try {
        // First try to parse as-is
        results = JSON.parse(text)
      } catch (parseError) {
        console.log("Initial JSON parse failed, trying to extract from markdown...")
        console.log("Raw AI response:", text)
        
        try {
          // Try to extract JSON from markdown
          const cleanedText = extractJSONFromMarkdown(text)
          console.log("Cleaned text:", cleanedText)
          results = JSON.parse(cleanedText)
        } catch (secondParseError) {
          console.error("Failed to parse AI response as JSON after markdown extraction:", secondParseError)
          console.log("Raw AI response:", text)
          setSearchResults("Search completed, but couldn't parse results properly. Raw response: " + text.substring(0, 200) + "...")
          return
        }
      }

      dispatch({
        type: "SET_FILTERED_DATA",
        payload: {
          clients: results.clients || [],
          workers: results.workers || [],
          tasks: results.tasks || [],
        },
      })

      setSearchResults(results.explanation || "Search completed")
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults("Search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setSearchResults("")
    dispatch({ type: "SET_SEARCH_QUERY", payload: "" })
    dispatch({
      type: "SET_FILTERED_DATA",
      payload: {
        clients: [],
        workers: [],
        tasks: [],
      },
    })
  }

  return (
    <Card className="card-hover glass-effect border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Natural Language Search
        </CardTitle>
        <CardDescription>
          Search your data using plain English. Try: "Show me all high priority clients" or "Find workers with
          JavaScript skills"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., 'All tasks with duration more than 2 phases and requiring Python skills'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            {state.searchQuery && (
              <Button variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            )}
          </div>

          {searchResults && (
            <div className="p-3 bg-card/50 rounded-md border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Search Results</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{searchResults}</p>
              {state.filteredData.clients.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Found: {state.filteredData.clients.length} clients, {state.filteredData.workers.length} workers,{" "}
                  {state.filteredData.tasks.length} tasks
                </p>
              )}
            </div>
          )}

          {/* Detailed Results Display */}
          {(state.filteredData.clients.length > 0 || state.filteredData.workers.length > 0 || state.filteredData.tasks.length > 0) && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Search Results Details</CardTitle>
                <CardDescription>
                  Showing {state.filteredData.clients.length + state.filteredData.workers.length + state.filteredData.tasks.length} matching records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="clients" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="clients" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Clients ({state.filteredData.clients.length})
                    </TabsTrigger>
                    <TabsTrigger value="workers" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Workers ({state.filteredData.workers.length})
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Tasks ({state.filteredData.tasks.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="clients" className="mt-4">
                    {state.filteredData.clients.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Client ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Group</TableHead>
                              <TableHead>Requested Tasks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {state.filteredData.clients.map((client) => (
                              <TableRow key={client.ClientID}>
                                <TableCell className="font-medium">{client.ClientID}</TableCell>
                                <TableCell>{client.ClientName}</TableCell>
                                <TableCell>
                                  <Badge variant={client.PriorityLevel >= 4 ? "destructive" : "secondary"}>
                                    {client.PriorityLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>{client.GroupTag}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {client.RequestedTaskIDs?.slice(0, 3).map((taskId) => (
                                      <Badge key={taskId} variant="outline" className="text-xs">
                                        {taskId}
                                      </Badge>
                                    ))}
                                    {client.RequestedTaskIDs?.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{client.RequestedTaskIDs.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No matching clients found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="workers" className="mt-4">
                    {state.filteredData.workers.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Worker ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Skills</TableHead>
                              <TableHead>Group</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead>Available Slots</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {state.filteredData.workers.map((worker) => (
                              <TableRow key={worker.WorkerID}>
                                <TableCell className="font-medium">{worker.WorkerID}</TableCell>
                                <TableCell>{worker.WorkerName}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {worker.Skills?.slice(0, 3).map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {worker.Skills?.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{worker.Skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{worker.WorkerGroup}</TableCell>
                                <TableCell>
                                  <Badge variant={worker.QualificationLevel >= 4 ? "default" : "secondary"}>
                                    {worker.QualificationLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {worker.AvailableSlots?.slice(0, 3).map((slot) => (
                                      <Badge key={slot} variant="outline" className="text-xs">
                                        {slot}
                                      </Badge>
                                    ))}
                                    {worker.AvailableSlots?.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{worker.AvailableSlots.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No matching workers found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-4">
                    {state.filteredData.tasks.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Task ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Required Skills</TableHead>
                              <TableHead>Max Concurrent</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {state.filteredData.tasks.map((task) => (
                              <TableRow key={task.TaskID}>
                                <TableCell className="font-medium">{task.TaskID}</TableCell>
                                <TableCell>{task.TaskName}</TableCell>
                                <TableCell>{task.Category}</TableCell>
                                <TableCell>
                                  <Badge variant={task.Duration > 2 ? "destructive" : "secondary"}>
                                    {task.Duration} phases
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {task.RequiredSkills?.slice(0, 3).map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {task.RequiredSkills?.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{task.RequiredSkills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{task.MaxConcurrent}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No matching tasks found</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setQuery("Show me all high priority clients")}
            >
              High priority clients
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setQuery("Find workers with JavaScript skills")}
            >
              JavaScript workers
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setQuery("Tasks requiring more than 3 phases")}
            >
              Long duration tasks
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setQuery("Workers available in phase 1 and 2")}
            >
              Early phase workers
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
