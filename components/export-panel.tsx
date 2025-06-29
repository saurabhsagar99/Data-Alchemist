"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Package
} from "lucide-react"
import { useData } from "@/contexts/data-context"

export default function ExportPanel() {
  const { state } = useData()
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    includeClients: true,
    includeWorkers: true,
    includeTasks: true,
    includeRules: true,
    includePriorities: true,
    includeValidationReport: true,
    cleanData: true
  })

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          if (Array.isArray(value)) {
            return `"${value.join(',')}"`
          }
          if (typeof value === 'object') {
            return `"${JSON.stringify(value)}"`
          }
          return `"${value}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const cleanData = (data: any[], type: string) => {
    return data.map(item => {
      const cleaned = { ...item }
      
      // Remove empty or null values
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
          delete cleaned[key]
        }
      })

      // Type-specific cleaning
      if (type === 'clients') {
        if (cleaned.AttributesJSON && typeof cleaned.AttributesJSON === 'string') {
          try {
            JSON.parse(cleaned.AttributesJSON)
          } catch {
            cleaned.AttributesJSON = '{}'
          }
        }
      }

      if (type === 'workers') {
        if (cleaned.AvailableSlots && Array.isArray(cleaned.AvailableSlots)) {
          cleaned.AvailableSlots = cleaned.AvailableSlots.filter((slot: any) => 
            typeof slot === 'number' && slot > 0
          )
        }
      }

      if (type === 'tasks') {
        if (cleaned.PreferredPhases && Array.isArray(cleaned.PreferredPhases)) {
          cleaned.PreferredPhases = cleaned.PreferredPhases.filter((phase: any) => 
            typeof phase === 'number' && phase > 0
          )
        }
      }

      return cleaned
    })
  }

  const generateValidationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalClients: state.clients.length,
        totalWorkers: state.workers.length,
        totalTasks: state.tasks.length,
        validationErrors: state.validationErrors.length,
        rules: state.rules.length
      },
      errors: state.validationErrors.map(error => ({
        type: error.type,
        message: error.message,
        entity: error.entity,
        entityId: error.entityId,
        severity: error.severity
      })),
      recommendations: [
        ...(state.clients.length === 0 ? ['Add client data to begin allocation planning'] : []),
        ...(state.workers.length === 0 ? ['Add worker data to enable task assignment'] : []),
        ...(state.tasks.length === 0 ? ['Add task definitions to create work items'] : []),
        ...(state.validationErrors.length > 0 ? ['Review and fix validation errors before proceeding'] : []),
        ...(state.rules.length === 0 ? ['Consider adding business rules for better allocation control'] : [])
      ]
    }
    return report
  }

  const exportAll = async () => {
    setIsExporting(true)

    try {
      // Export individual CSV files
      if (exportOptions.includeClients && state.clients.length > 0) {
        const cleanedClients = exportOptions.cleanData ? cleanData(state.clients, 'clients') : state.clients
        downloadCSV(cleanedClients, 'clients_cleaned.csv')
      }

      if (exportOptions.includeWorkers && state.workers.length > 0) {
        const cleanedWorkers = exportOptions.cleanData ? cleanData(state.workers, 'workers') : state.workers
        downloadCSV(cleanedWorkers, 'workers_cleaned.csv')
      }

      if (exportOptions.includeTasks && state.tasks.length > 0) {
        const cleanedTasks = exportOptions.cleanData ? cleanData(state.tasks, 'tasks') : state.tasks
        downloadCSV(cleanedTasks, 'tasks_cleaned.csv')
      }

      // Export rules.json
      if (exportOptions.includeRules) {
        const rulesConfig = {
          metadata: {
            generatedAt: new Date().toISOString(),
            version: "1.0",
            source: "Data Alchemist"
          },
          rules: state.rules.map(rule => ({
            id: rule.id,
            type: rule.type,
            name: rule.name,
            description: rule.description,
            parameters: rule.parameters,
            active: rule.active
          })),
          priorities: state.priorities.map(priority => ({
            id: priority.id,
            name: priority.name,
            weight: priority.weight,
            description: priority.description
          }))
        }
        downloadJSON(rulesConfig, 'rules.json')
      }

      // Export validation report
      if (exportOptions.includeValidationReport) {
        const validationReport = generateValidationReport()
        downloadJSON(validationReport, 'validation_report.json')
      }

      // Export complete package
      const completePackage = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: "1.0",
          tool: "Data Alchemist"
        },
        data: {
          clients: exportOptions.cleanData ? cleanData(state.clients, 'clients') : state.clients,
          workers: exportOptions.cleanData ? cleanData(state.workers, 'workers') : state.workers,
          tasks: exportOptions.cleanData ? cleanData(state.tasks, 'tasks') : state.tasks
        },
        configuration: {
          rules: state.rules,
          priorities: state.priorities,
          validationErrors: state.validationErrors
        }
      }
      downloadJSON(completePackage, 'data_alchemist_export.json')

    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const hasData = state.clients.length > 0 || state.workers.length > 0 || state.tasks.length > 0
  const hasErrors = state.validationErrors.length > 0

  return (
    <Card className="card-hover glass-effect border-green-200/50 dark:border-green-800/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
          Export Cleaned Data & Configuration
        </CardTitle>
        <CardDescription>
          Download your validated data and business rules ready for the next stage of resource allocation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No data available for export. Please upload and validate your data first.
            </AlertDescription>
          </Alert>
        )}

        {hasData && (
          <div className="space-y-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="font-medium">Export Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeClients" 
                      checked={exportOptions.includeClients}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, includeClients: !!checked }))
                      }
                    />
                    <Label htmlFor="includeClients" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Clients Data ({state.clients.length} records)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeWorkers" 
                      checked={exportOptions.includeWorkers}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, includeWorkers: !!checked }))
                      }
                    />
                    <Label htmlFor="includeWorkers" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Workers Data ({state.workers.length} records)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeTasks" 
                      checked={exportOptions.includeTasks}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, includeTasks: !!checked }))
                      }
                    />
                    <Label htmlFor="includeTasks" className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Tasks Data ({state.tasks.length} records)
                    </Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeRules" 
                      checked={exportOptions.includeRules}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, includeRules: !!checked }))
                      }
                    />
                    <Label htmlFor="includeRules" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Business Rules ({state.rules.length} rules)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includePriorities" 
                      checked={exportOptions.includePriorities}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, includePriorities: !!checked }))
                      }
                    />
                    <Label htmlFor="includePriorities" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Priority Weights
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cleanData" 
                      checked={exportOptions.cleanData}
                      onCheckedChange={(checked: boolean | "indeterminate") => 
                        setExportOptions(prev => ({ ...prev, cleanData: !!checked }))
                      }
                    />
                    <Label htmlFor="cleanData" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Clean & Validate Data
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-card/50 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{state.clients.length}</div>
                <div className="text-sm text-muted-foreground">Clients</div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{state.workers.length}</div>
                <div className="text-sm text-muted-foreground">Workers</div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{state.tasks.length}</div>
                <div className="text-sm text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{state.rules.length}</div>
                <div className="text-sm text-muted-foreground">Rules</div>
              </div>
            </div>

            {/* Validation Status */}
            {hasErrors && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {state.validationErrors.length} validation errors found. Consider reviewing and fixing these before export.
                </AlertDescription>
              </Alert>
            )}

            {!hasErrors && state.validationErrors.length === 0 && hasData && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All data has been validated successfully. Ready for export!
                </AlertDescription>
              </Alert>
            )}

            {/* Export Button */}
            <div className="flex gap-4">
              <Button 
                onClick={exportAll} 
                disabled={!hasData || isExporting}
                className="flex-1"
              >
                {isExporting ? (
                  <>
                    <Download className="h-4 w-4 mr-2 animate-pulse" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data & Configuration
                  </>
                )}
              </Button>
            </div>

            {/* Export Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>What you'll get:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Cleaned CSV files for each data type (clients, workers, tasks)</li>
                <li>rules.json with all business rules and priority weights</li>
                <li>validation_report.json with data quality assessment</li>
                <li>Complete package as data_alchemist_export.json</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
