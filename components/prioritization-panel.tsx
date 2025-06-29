"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Target, 
  Users, 
  Clock, 
  Zap, 
  BarChart3, 
  ArrowUpDown,
  Save,
  RotateCcw,
  Sparkles
} from "lucide-react"
import { useData } from "@/contexts/data-context"

interface Priority {
  id: string
  name: string
  weight: number
  description: string
  icon: React.ReactNode
}

const defaultPriorities: Priority[] = [
  { 
    id: "priority_level", 
    name: "Client Priority", 
    weight: 0.3, 
    description: "Importance of client priority levels (1-5)",
    icon: <Target className="h-4 w-4" />
  },
  { 
    id: "task_fulfillment", 
    name: "Task Fulfillment", 
    weight: 0.25, 
    description: "Maximize completion of requested tasks",
    icon: <Zap className="h-4 w-4" />
  },
  { 
    id: "worker_fairness", 
    name: "Worker Fairness", 
    weight: 0.2, 
    description: "Equal workload distribution among workers",
    icon: <Users className="h-4 w-4" />
  },
  { 
    id: "skill_matching", 
    name: "Skill Matching", 
    weight: 0.15, 
    description: "Optimal skill utilization and matching",
    icon: <BarChart3 className="h-4 w-4" />
  },
  { 
    id: "phase_efficiency", 
    name: "Phase Efficiency", 
    weight: 0.1, 
    description: "Timeline optimization and phase balancing",
    icon: <Clock className="h-4 w-4" />
  }
]

const presetProfiles = {
  "maximize_fulfillment": {
    name: "Maximize Fulfillment",
    description: "Prioritize completing as many tasks as possible",
    weights: { priority_level: 0.4, task_fulfillment: 0.35, worker_fairness: 0.15, skill_matching: 0.1, phase_efficiency: 0.0 }
  },
  "fair_distribution": {
    name: "Fair Distribution",
    description: "Focus on equal workload distribution",
    weights: { priority_level: 0.2, task_fulfillment: 0.2, worker_fairness: 0.4, skill_matching: 0.15, phase_efficiency: 0.05 }
  },
  "minimize_workload": {
    name: "Minimize Workload",
    description: "Reduce overall workload and stress",
    weights: { priority_level: 0.25, task_fulfillment: 0.2, worker_fairness: 0.3, skill_matching: 0.15, phase_efficiency: 0.1 }
  },
  "skill_optimization": {
    name: "Skill Optimization",
    description: "Maximize skill utilization and expertise",
    weights: { priority_level: 0.2, task_fulfillment: 0.25, worker_fairness: 0.15, skill_matching: 0.35, phase_efficiency: 0.05 }
  },
  "balanced": {
    name: "Balanced Approach",
    description: "Equal consideration for all factors",
    weights: { priority_level: 0.2, task_fulfillment: 0.2, worker_fairness: 0.2, skill_matching: 0.2, phase_efficiency: 0.2 }
  }
}

export default function PrioritizationPanel() {
  const { state, dispatch } = useData()
  const [priorities, setPriorities] = useState<Priority[]>(defaultPriorities)
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [isCustomizing, setIsCustomizing] = useState(false)

  const updatePriorityWeight = (id: string, weight: number) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, weight } : p))
    setIsCustomizing(true)
  }

  const applyPresetProfile = (profileKey: string) => {
    const profile = presetProfiles[profileKey as keyof typeof presetProfiles]
    if (profile) {
      setPriorities(prev => prev.map(p => ({ ...p, weight: profile.weights[p.id as keyof typeof profile.weights] || 0 })))
      setSelectedProfile(profileKey)
      setIsCustomizing(false)
    }
  }

  const resetToDefaults = () => {
    setPriorities(defaultPriorities)
    setSelectedProfile("")
    setIsCustomizing(false)
  }

  const savePriorities = () => {
    dispatch({ type: "SET_PRIORITIES", payload: priorities })
  }

  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0)
  const isBalanced = Math.abs(totalWeight - 1.0) < 0.01

  return (
    <Card className="card-hover glass-effect border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Resource Allocation Priorities
        </CardTitle>
        <CardDescription>
          Configure how the system should balance different allocation criteria. Adjust weights to reflect your organization's priorities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets">Preset Profiles</TabsTrigger>
            <TabsTrigger value="custom">Custom Weights</TabsTrigger>
            <TabsTrigger value="ranking">Drag & Drop</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(presetProfiles).map(([key, profile]) => (
                <Card 
                  key={key} 
                  className={`cursor-pointer transition-all hover:shadow-md card-hover ${
                    selectedProfile === key ? 'border-blue-500/50 dark:border-blue-400/50 bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => applyPresetProfile(key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{profile.name}</h4>
                      {selectedProfile === key && <Badge variant="secondary">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{profile.description}</p>
                    <div className="space-y-1">
                      {Object.entries(profile.weights).map(([priorityId, weight]) => {
                        const priority = priorities.find(p => p.id === priorityId)
                        return (
                          <div key={priorityId} className="flex justify-between text-xs">
                            <span>{priority?.name}</span>
                            <span className="font-medium">{Math.round(weight * 100)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Total Weight: {Math.round(totalWeight * 100)}%</Label>
                {!isBalanced && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                    Weights should total 100%. Current: {Math.round(totalWeight * 100)}%
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button size="sm" onClick={savePriorities}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {priorities.map((priority) => (
                <div key={priority.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {priority.icon}
                    <Label className="font-medium">{priority.name}</Label>
                    <Badge variant="outline">{Math.round(priority.weight * 100)}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{priority.description}</p>
                  <Slider
                    value={[priority.weight]}
                    onValueChange={([value]) => updatePriorityWeight(priority.id, value)}
                    max={1}
                    min={0}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <div className="text-center text-muted-foreground">
              <ArrowUpDown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>Drag and drop ranking coming soon...</p>
              <p className="text-sm">This will allow you to rank priorities by importance</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Suggestions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-medium text-purple-900 dark:text-purple-100">AI Priority Suggestions</h4>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
            Based on your data patterns, we recommend focusing on:
          </p>
          <div className="space-y-2">
            {state.clients.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">High Priority Clients</Badge>
                <span className="text-sm text-muted-foreground">
                  {state.clients.filter(c => c.PriorityLevel >= 4).length} clients with priority 4-5
                </span>
              </div>
            )}
            {state.workers.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Skill Coverage</Badge>
                <span className="text-sm text-muted-foreground">
                  {new Set(state.workers.flatMap(w => w.Skills)).size} unique skills available
                </span>
              </div>
            )}
            {state.tasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Task Complexity</Badge>
                <span className="text-sm text-muted-foreground">
                  {state.tasks.filter(t => t.Duration > 2).length} tasks with duration &gt; 2 phases
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
