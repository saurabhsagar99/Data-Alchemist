"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

// Types
export interface Client {
  ClientID: string
  ClientName: string
  PriorityLevel: number
  RequestedTaskIDs: string[]
  GroupTag: string
  AttributesJSON: string
}

export interface Worker {
  WorkerID: string
  WorkerName: string
  Skills: string[]
  AvailableSlots: number[]
  MaxLoadPerPhase: number
  WorkerGroup: string
  QualificationLevel: number
}

export interface Task {
  TaskID: string
  TaskName: string
  Category: string
  Duration: number
  RequiredSkills: string[]
  PreferredPhases: number[]
  MaxConcurrent: number
}

export interface ValidationError {
  id: string
  type: string
  message: string
  entity: "client" | "worker" | "task"
  entityId: string
  field?: string
  severity: "error" | "warning"
}

export interface Rule {
  id: string
  type: "coRun" | "slotRestriction" | "loadLimit" | "phaseWindow" | "patternMatch" | "precedence"
  name: string
  description: string
  parameters: Record<string, any>
  active: boolean
}

export interface Priority {
  id: string
  name: string
  weight: number
  description: string
}

interface DataState {
  clients: Client[]
  workers: Worker[]
  tasks: Task[]
  validationErrors: ValidationError[]
  rules: Rule[]
  priorities: Priority[]
  isLoading: boolean
  searchQuery: string
  filteredData: {
    clients: Client[]
    workers: Worker[]
    tasks: Task[]
  }
}

type DataAction =
  | { type: "SET_CLIENTS"; payload: Client[] }
  | { type: "SET_WORKERS"; payload: Worker[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "UPDATE_CLIENT"; payload: { id: string; data: Partial<Client> } }
  | { type: "UPDATE_WORKER"; payload: { id: string; data: Partial<Worker> } }
  | { type: "UPDATE_TASK"; payload: { id: string; data: Partial<Task> } }
  | { type: "SET_VALIDATION_ERRORS"; payload: ValidationError[] }
  | { type: "ADD_RULE"; payload: Rule }
  | { type: "UPDATE_RULE"; payload: { id: string; data: Partial<Rule> } }
  | { type: "DELETE_RULE"; payload: string }
  | { type: "SET_PRIORITIES"; payload: Priority[] }
  | { type: "UPDATE_PRIORITY"; payload: { id: string; weight: number } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_FILTERED_DATA"; payload: { clients: Client[]; workers: Worker[]; tasks: Task[] } }

const initialState: DataState = {
  clients: [],
  workers: [],
  tasks: [],
  validationErrors: [],
  rules: [],
  priorities: [
    { id: "1", name: "Priority Level", weight: 0.3, description: "Client priority importance" },
    { id: "2", name: "Task Fulfillment", weight: 0.25, description: "Requested task completion" },
    { id: "3", name: "Worker Fairness", weight: 0.2, description: "Equal workload distribution" },
    { id: "4", name: "Skill Matching", weight: 0.15, description: "Optimal skill utilization" },
    { id: "5", name: "Phase Efficiency", weight: 0.1, description: "Timeline optimization" },
  ],
  isLoading: false,
  searchQuery: "",
  filteredData: {
    clients: [],
    workers: [],
    tasks: [],
  },
}

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "SET_CLIENTS":
      return { ...state, clients: action.payload, filteredData: { ...state.filteredData, clients: action.payload } }
    case "SET_WORKERS":
      return { ...state, workers: action.payload, filteredData: { ...state.filteredData, workers: action.payload } }
    case "SET_TASKS":
      return { ...state, tasks: action.payload, filteredData: { ...state.filteredData, tasks: action.payload } }
    case "UPDATE_CLIENT":
      const updatedClients = state.clients.map((client) =>
        client.ClientID === action.payload.id ? { ...client, ...action.payload.data } : client,
      )
      return { ...state, clients: updatedClients }
    case "UPDATE_WORKER":
      const updatedWorkers = state.workers.map((worker) =>
        worker.WorkerID === action.payload.id ? { ...worker, ...action.payload.data } : worker,
      )
      return { ...state, workers: updatedWorkers }
    case "UPDATE_TASK":
      const updatedTasks = state.tasks.map((task) =>
        task.TaskID === action.payload.id ? { ...task, ...action.payload.data } : task,
      )
      return { ...state, tasks: updatedTasks }
    case "SET_VALIDATION_ERRORS":
      return { ...state, validationErrors: action.payload }
    case "ADD_RULE":
      return { ...state, rules: [...state.rules, action.payload] }
    case "UPDATE_RULE":
      const updatedRules = state.rules.map((rule) =>
        rule.id === action.payload.id ? { ...rule, ...action.payload.data } : rule,
      )
      return { ...state, rules: updatedRules }
    case "DELETE_RULE":
      return { ...state, rules: state.rules.filter((rule) => rule.id !== action.payload) }
    case "SET_PRIORITIES":
      return { ...state, priorities: action.payload }
    case "UPDATE_PRIORITY":
      const updatedPriorities = state.priorities.map((priority) =>
        priority.id === action.payload.id ? { ...priority, weight: action.payload.weight } : priority,
      )
      return { ...state, priorities: updatedPriorities }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload }
    case "SET_FILTERED_DATA":
      return { ...state, filteredData: action.payload }
    default:
      return state
  }
}

const DataContext = createContext<{
  state: DataState
  dispatch: React.Dispatch<DataAction>
} | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState)

  return <DataContext.Provider value={{ state, dispatch }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
