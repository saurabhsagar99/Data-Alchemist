"use client"

import { useState } from "react"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  TrendingUp,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function DataGrid() {
  const { state, dispatch } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState("clients")
  
  // Action states
  const [viewItem, setViewItem] = useState<any>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteItem, setDeleteItem] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<any>(null)

  const getFilteredData = () => {
    let data: any[] = []
    
    switch (activeTab) {
      case "clients":
        data = state.clients || []
        break
      case "workers":
        data = state.workers || []
        break
      case "tasks":
        data = state.tasks || []
        break
      default:
        data = []
    }

    if (searchQuery) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    return data
  }

  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "clients":
        return <Users className="w-4 h-4" />
      case "workers":
        return <Users className="w-4 h-4" />
      case "tasks":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const getTabColor = (tab: string) => {
    switch (tab) {
      case "clients":
        return "text-purple-600 dark:text-purple-400"
      case "workers":
        return "text-green-600 dark:text-green-400"
      case "tasks":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-blue-600 dark:text-blue-400"
    }
  }

  // Action handlers
  const handleView = (item: any) => {
    setViewItem(item)
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setEditingData({ ...item }) // Create a copy for editing
  }

  const handleSaveEdit = () => {
    if (!editingData || !editItem) return

    try {
      // Basic validation
      const requiredFields = {
        clients: ['ClientID', 'ClientName'],
        workers: ['WorkerID', 'WorkerName'],
        tasks: ['TaskID', 'TaskName']
      }
      
      const currentRequiredFields = requiredFields[activeTab as keyof typeof requiredFields] || []
      const missingFields = currentRequiredFields.filter(field => !editingData[field])
      
      if (missingFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Missing required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        })
        return
      }

      // Validate numeric fields
      const numericFields = ['PriorityLevel', 'Duration', 'MaxConcurrent', 'MaxLoadPerPhase', 'QualificationLevel']
      const invalidNumericFields = numericFields.filter(field => 
        editingData[field] !== undefined && (isNaN(editingData[field]) || editingData[field] < 0)
      )
      
      if (invalidNumericFields.length > 0) {
        toast({
          title: "Validation Error",
          description: `Invalid numeric values in: ${invalidNumericFields.join(', ')}`,
          variant: "destructive",
        })
        return
      }

      let updatedData: any[] = []
      
      switch (activeTab) {
        case "clients":
          updatedData = state.clients.map((client: any) => 
            client.ClientID === editItem.ClientID ? editingData : client
          )
          dispatch({ type: "SET_CLIENTS", payload: updatedData })
          break
        case "workers":
          updatedData = state.workers.map((worker: any) => 
            worker.WorkerID === editItem.WorkerID ? editingData : worker
          )
          dispatch({ type: "SET_WORKERS", payload: updatedData })
          break
        case "tasks":
          updatedData = state.tasks.map((task: any) => 
            task.TaskID === editItem.TaskID ? editingData : task
          )
          dispatch({ type: "SET_TASKS", payload: updatedData })
          break
      }

      toast({
        title: "Item updated",
        description: `Successfully updated the ${activeTab.slice(0, -1)}.`,
      })
      setEditItem(null)
      setEditingData(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditItem(null)
    setEditingData(null)
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!editingData) return
    
    // Handle special field types
    let processedValue = value
    
    // Try to parse JSON for fields that should be objects/arrays
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        processedValue = JSON.parse(value)
      } catch {
        // If JSON parsing fails, keep as string
        processedValue = value
      }
    }
    
    // Handle comma-separated strings for array fields
    if (typeof value === 'string' && value.includes(',') && !value.startsWith('[')) {
      const commonArrayFields = ['Skills', 'AvailableSlots', 'PreferredPhases', 'RequestedTaskIDs', 'RequiredSkills']
      if (commonArrayFields.includes(fieldName)) {
        processedValue = value.split(',').map((item: string) => item.trim()).filter(Boolean)
      }
    }
    
    // Handle numeric fields
    if (['PriorityLevel', 'Duration', 'MaxConcurrent', 'MaxLoadPerPhase', 'QualificationLevel'].includes(fieldName)) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        processedValue = numValue
      }
    }

    setEditingData({
      ...editingData,
      [fieldName]: processedValue
    })
  }

  const getFieldType = (fieldName: string, value: any): string => {
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'object' && value !== null) return 'object'
    return 'text'
  }

  const renderFieldInput = (fieldName: string, value: any) => {
    const fieldType = getFieldType(fieldName, value)
    
    switch (fieldType) {
      case 'array':
        return (
          <Input
            value={Array.isArray(value) ? value.join(', ') : String(value)}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder="Enter comma-separated values"
            className="font-mono text-sm"
          />
        )
      case 'object':
        return (
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder="Enter JSON object"
            className="w-full p-2 border rounded-md font-mono text-sm min-h-[80px] resize-y"
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="font-mono text-sm"
          />
        )
      case 'boolean':
        return (
          <select
            value={String(value)}
            onChange={(e) => handleFieldChange(fieldName, e.target.value === 'true')}
            className="w-full p-2 border rounded-md text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        )
      default:
        return (
          <Input
            value={String(value)}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            className="font-mono text-sm"
          />
        )
    }
  }

  const handleDelete = (item: any) => {
    setDeleteItem(item)
  }

  const confirmDelete = () => {
    if (!deleteItem) return

    try {
      let updatedData: any[] = []
      
      switch (activeTab) {
        case "clients":
          updatedData = state.clients.filter((client: any) => client.ClientID !== deleteItem.ClientID)
          dispatch({ type: "SET_CLIENTS", payload: updatedData })
          break
        case "workers":
          updatedData = state.workers.filter((worker: any) => worker.WorkerID !== deleteItem.WorkerID)
          dispatch({ type: "SET_WORKERS", payload: updatedData })
          break
        case "tasks":
          updatedData = state.tasks.filter((task: any) => task.TaskID !== deleteItem.TaskID)
          dispatch({ type: "SET_TASKS", payload: updatedData })
          break
      }

      toast({
        title: "Item deleted",
        description: `Successfully deleted the ${activeTab.slice(0, -1)}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteItem(null)
    }
  }

  const handleCopyField = async (fieldName: string, value: any) => {
    try {
      const textToCopy = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      await navigator.clipboard.writeText(textToCopy)
      setCopiedField(fieldName)
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard.`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const formatFieldValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const renderTable = () => {
    if (currentData.length === 0) {
      return (
        <div className="text-center py-12">
          <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No data available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? "No results found for your search." : "Upload some data to get started."}
          </p>
        </div>
      )
    }

    const headers = Object.keys(currentData[0] || {})

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {headers.map((header) => {
                  const value = row[header]
                  let displayValue = value

                  // Handle arrays
                  if (Array.isArray(value)) {
                    displayValue = value.join(", ")
                  }
                  // Handle objects
                  else if (typeof value === "object" && value !== null) {
                    displayValue = JSON.stringify(value)
                  }
                  // Handle long strings
                  else if (typeof value === "string" && value.length > 50) {
                    displayValue = value.substring(0, 50) + "..."
                  }

                  return (
                    <td key={header} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {displayValue}
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      onClick={() => handleView(row)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                      onClick={() => handleEdit(row)}
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                      onClick={() => handleDelete(row)}
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Data Explorer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your uploaded data
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-modern"
            onClick={() => {
              const dataToExport = {
                clients: state.clients,
                workers: state.workers,
                tasks: state.tasks,
                exportDate: new Date().toISOString(),
                totalRecords: (state.clients?.length || 0) + (state.workers?.length || 0) + (state.tasks?.length || 0)
              }
              const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `data-alchemist-export-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              toast({
                title: "Export successful",
                description: "Data exported to JSON file.",
              })
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-modern"
            onClick={() => {
              toast({
                title: "Filter options",
                description: "Advanced filtering coming soon! Use the search bar above for now.",
              })
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                {filteredData.length} records
              </Badge>
              {searchQuery && (
                <Badge variant="outline" className="px-3 py-1">
                  Filtered
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Tabs */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Tables
          </CardTitle>
          <CardDescription>
            Browse through your uploaded data by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="clients" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/10 data-[state=active]:to-purple-600/10"
              >
                <Users className="w-4 h-4" />
                Clients ({state.clients?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="workers"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/10 data-[state=active]:to-green-600/10"
              >
                <Users className="w-4 h-4" />
                Workers ({state.workers?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/10 data-[state=active]:to-orange-600/10"
              >
                <TrendingUp className="w-4 h-4" />
                Tasks ({state.tasks?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="mt-6">
              {renderTable()}
            </TabsContent>
            
            <TabsContent value="workers" className="mt-6">
              {renderTable()}
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-6">
              {renderTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn-modern"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-modern"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0 btn-modern"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-modern"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn-modern"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* View Modal */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              View {activeTab.slice(0, -1)} Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected {activeTab.slice(0, -1)}.
            </DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              {Object.entries(viewItem).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-muted-foreground mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm break-words">
                      {formatFieldValue(value)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-8 w-8 p-0"
                    onClick={() => handleCopyField(key, value)}
                    title="Copy to clipboard"
                  >
                    {copiedField === key ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit {activeTab.slice(0, -1)}
            </DialogTitle>
            <DialogDescription>
              Make changes to the {activeTab.slice(0, -1)} information. Click Save when done.
            </DialogDescription>
          </DialogHeader>
          {editingData && (
            <div className="space-y-4">
              {Object.entries(editingData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                    <Badge variant="outline" className="text-xs">
                      {getFieldType(key, value)}
                    </Badge>
                  </label>
                  {renderFieldInput(key, value)}
                  <div className="text-xs text-muted-foreground">
                    {getFieldType(key, value) === 'array' && "Enter comma-separated values"}
                    {getFieldType(key, value) === 'object' && "Enter valid JSON"}
                    {getFieldType(key, value) === 'number' && "Numeric value"}
                    {getFieldType(key, value) === 'boolean' && "True or False"}
                    {getFieldType(key, value) === 'text' && "Text input"}
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {activeTab.slice(0, -1)} 
              {deleteItem && (
                <span className="font-medium">
                  {" "}"{deleteItem[Object.keys(deleteItem)[0]]}"{" "}
                </span>
              )}
              from your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
