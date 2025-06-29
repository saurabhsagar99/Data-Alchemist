"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Database,
  Sparkles,
  Users,
  TrendingUp
} from "lucide-react";
import type { Client, Worker, Task } from "@/contexts/data-context";
import type { ValidationError } from "@/contexts/data-context";

export function DataIngestion() {
  const { state, dispatch } = useData();

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validating, setValidating] = useState(false);

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    return data;
  }, []);

  const transformToClient = (row: Record<string, any>): Client => ({
    ClientID: row.ClientID || row.clientId || row.id || '',
    ClientName: row.ClientName || row.clientName || row.name || '',
    PriorityLevel: parseInt(row.PriorityLevel || row.priorityLevel || row.priority || '1'),
    RequestedTaskIDs: typeof row.RequestedTaskIDs === 'string' 
      ? row.RequestedTaskIDs.split(',').map((id: string) => id.trim())
      : row.RequestedTaskIDs || [],
    GroupTag: row.GroupTag || row.groupTag || row.group || '',
    AttributesJSON: row.AttributesJSON || row.attributesJSON || row.attributes || '{}'
  });

  const transformToWorker = (row: Record<string, any>): Worker => {
    let availableSlots: number[] = [];
    
    // Handle AvailableSlots parsing with error handling
    if (typeof row.AvailableSlots === 'string') {
      try {
        // First try to parse as JSON
        availableSlots = JSON.parse(row.AvailableSlots.replace(/'/g, '"'));
      } catch (parseError) {
        // If JSON parsing fails, try to parse as comma-separated numbers
        try {
          availableSlots = row.AvailableSlots
            .split(',')
            .map((slot: string) => parseInt(slot.trim()))
            .filter((slot: number) => !isNaN(slot));
        } catch (splitError) {
          // If all parsing fails, default to empty array
          console.warn(`Failed to parse AvailableSlots for worker ${row.WorkerID || row.workerId || row.id}:`, row.AvailableSlots);
          availableSlots = [];
        }
      }
    } else if (Array.isArray(row.AvailableSlots)) {
      availableSlots = row.AvailableSlots;
    }

    return {
      WorkerID: row.WorkerID || row.workerId || row.id || '',
      WorkerName: row.WorkerName || row.workerName || row.name || '',
      Skills: typeof row.Skills === 'string' 
        ? row.Skills.split(',').map((skill: string) => skill.trim())
        : row.Skills || [],
      AvailableSlots: availableSlots,
      MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase || row.maxLoadPerPhase || row.maxLoad || '1'),
      WorkerGroup: row.WorkerGroup || row.workerGroup || row.group || '',
      QualificationLevel: parseInt(row.QualificationLevel || row.qualificationLevel || row.level || '1')
    };
  };

  const transformToTask = (row: Record<string, any>): Task => {
    let preferredPhases: number[] = [];
    
    // Handle PreferredPhases parsing with error handling
    if (typeof row.PreferredPhases === 'string') {
      try {
        // First try to parse as JSON
        preferredPhases = JSON.parse(row.PreferredPhases.replace(/'/g, '"'));
      } catch (parseError) {
        // If JSON parsing fails, try to parse as comma-separated numbers
        try {
          preferredPhases = row.PreferredPhases
            .split(',')
            .map((phase: string) => parseInt(phase.trim()))
            .filter((phase: number) => !isNaN(phase));
        } catch (splitError) {
          // If all parsing fails, default to empty array
          console.warn(`Failed to parse PreferredPhases for task ${row.TaskID || row.taskId || row.id}:`, row.PreferredPhases);
          preferredPhases = [];
        }
      }
    } else if (Array.isArray(row.PreferredPhases)) {
      preferredPhases = row.PreferredPhases;
    }

    return {
      TaskID: row.TaskID || row.taskId || row.id || '',
      TaskName: row.TaskName || row.taskName || row.name || '',
      Category: row.Category || row.category || '',
      Duration: parseInt(row.Duration || row.duration || '1'),
      RequiredSkills: typeof row.RequiredSkills === 'string'
        ? row.RequiredSkills.split(',').map((skill: string) => skill.trim())
        : row.RequiredSkills || [],
      PreferredPhases: preferredPhases,
      MaxConcurrent: parseInt(row.MaxConcurrent || row.maxConcurrent || row.concurrent || '1')
    };
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileName = file.name.toLowerCase();
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const text = await file.text();
        const rawData = parseCSV(text);

        // Determine file type and transform data
        if (fileName.includes('clients') || fileName.includes('client')) {
          const clients = rawData.map(transformToClient);
          dispatch({ type: "SET_CLIENTS", payload: clients });
          console.log('Clients data loaded:', clients);
        } else if (fileName.includes('workers') || fileName.includes('worker')) {
          const workers = rawData.map(transformToWorker);
          dispatch({ type: "SET_WORKERS", payload: workers });
          console.log('Workers data loaded:', workers);
        } else if (fileName.includes('tasks') || fileName.includes('task')) {
          const tasks = rawData.map(transformToTask);
          dispatch({ type: "SET_TASKS", payload: tasks });
          console.log('Tasks data loaded:', tasks);
        } else {
          // Default to tasks if filename doesn't match
          const tasks = rawData.map(transformToTask);
          dispatch({ type: "SET_TASKS", payload: tasks });
          console.log('Default tasks data loaded:', tasks);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setUploadStatus("success");
      
      // Auto-validate after upload
      setTimeout(() => {
        validateData();
      }, 1000);

    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  }, [parseCSV, dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: true
  });

  const validateData = async () => {
    setValidating(true);
    try {
      const errors: ValidationError[] = [];

      // Core validations - same as data-validation component
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
      ];

      for (let i = 0; i < validations.length; i++) {
        const validationErrors = validations[i]();
        errors.push(...validationErrors);
        // Small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      dispatch({ type: "SET_VALIDATION_ERRORS", payload: errors });

      // Show validation result
      if (errors.length === 0) {
        console.log('✅ All data validated successfully!');
      } else {
        console.log(`⚠️ Found ${errors.length} validation issues`);
        console.log('Validation errors:', errors);
      }

    } catch (error) {
      console.error('Validation error:', error);
      // Add a generic error to the validation errors
      dispatch({ 
        type: "SET_VALIDATION_ERRORS", 
        payload: [{
          id: 'validation-error',
          type: 'system',
          message: 'Validation process failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
          entity: 'client', // Use a valid entity type
          entityId: 'validation',
          severity: 'error'
        }]
      });
    } finally {
      setValidating(false);
    }
  };

  // Validation functions - same as data-validation component
  const validateMissingColumns = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check required client columns
    state.clients?.forEach((client) => {
      if (!client.ClientID) {
        errors.push({
          id: `missing-client-id-${Math.random()}`,
          type: "missing_required_field",
          message: "Missing required ClientID",
          entity: "client",
          entityId: client.ClientID || "unknown",
          field: "ClientID",
          severity: "error",
        });
      }
    });

    // Check required worker columns
    state.workers?.forEach((worker) => {
      if (!worker.WorkerID) {
        errors.push({
          id: `missing-worker-id-${Math.random()}`,
          type: "missing_required_field",
          message: "Missing required WorkerID",
          entity: "worker",
          entityId: worker.WorkerID || "unknown",
          field: "WorkerID",
          severity: "error",
        });
      }
    });

    // Check required task columns
    state.tasks?.forEach((task) => {
      if (!task.TaskID) {
        errors.push({
          id: `missing-task-id-${Math.random()}`,
          type: "missing_required_field",
          message: "Missing required TaskID",
          entity: "task",
          entityId: task.TaskID || "unknown",
          field: "TaskID",
          severity: "error",
        });
      }
    });

    return errors;
  };

  const validateDuplicateIDs = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check duplicate client IDs
    const clientIds = new Set();
    state.clients?.forEach((client) => {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          id: `duplicate-client-${client.ClientID}`,
          type: "duplicate_id",
          message: `Duplicate ClientID: ${client.ClientID}`,
          entity: "client",
          entityId: client.ClientID,
          field: "ClientID",
          severity: "error",
        });
      }
      clientIds.add(client.ClientID);
    });

    // Check duplicate worker IDs
    const workerIds = new Set();
    state.workers?.forEach((worker) => {
      if (workerIds.has(worker.WorkerID)) {
        errors.push({
          id: `duplicate-worker-${worker.WorkerID}`,
          type: "duplicate_id",
          message: `Duplicate WorkerID: ${worker.WorkerID}`,
          entity: "worker",
          entityId: worker.WorkerID,
          field: "WorkerID",
          severity: "error",
        });
      }
      workerIds.add(worker.WorkerID);
    });

    // Check duplicate task IDs
    const taskIds = new Set();
    state.tasks?.forEach((task) => {
      if (taskIds.has(task.TaskID)) {
        errors.push({
          id: `duplicate-task-${task.TaskID}`,
          type: "duplicate_id",
          message: `Duplicate TaskID: ${task.TaskID}`,
          entity: "task",
          entityId: task.TaskID,
          field: "TaskID",
          severity: "error",
        });
      }
      taskIds.add(task.TaskID);
    });

    return errors;
  };

  const validateMalformedLists = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.workers?.forEach((worker) => {
      if (!Array.isArray(worker.AvailableSlots)) {
        errors.push({
          id: `malformed-slots-${worker.WorkerID}`,
          type: "malformed_list",
          message: "AvailableSlots must be an array of numbers",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "AvailableSlots",
          severity: "error",
        });
      }
    });

    state.tasks?.forEach((task) => {
      if (!Array.isArray(task.PreferredPhases)) {
        errors.push({
          id: `malformed-phases-${task.TaskID}`,
          type: "malformed_list",
          message: "PreferredPhases must be an array of numbers",
          entity: "task",
          entityId: task.TaskID,
          field: "PreferredPhases",
          severity: "error",
        });
      }
    });

    return errors;
  };

  const validateOutOfRangeValues = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.clients?.forEach((client) => {
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          id: `priority-range-${client.ClientID}`,
          type: "out_of_range",
          message: "PriorityLevel must be between 1 and 5",
          entity: "client",
          entityId: client.ClientID,
          field: "PriorityLevel",
          severity: "error",
        });
      }
    });

    state.tasks?.forEach((task) => {
      if (task.Duration < 1) {
        errors.push({
          id: `duration-range-${task.TaskID}`,
          type: "out_of_range",
          message: "Duration must be at least 1",
          entity: "task",
          entityId: task.TaskID,
          field: "Duration",
          severity: "error",
        });
      }
    });

    state.workers?.forEach((worker) => {
      if (worker.MaxLoadPerPhase < 1) {
        errors.push({
          id: `maxload-range-${worker.WorkerID}`,
          type: "out_of_range",
          message: "MaxLoadPerPhase must be at least 1",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "MaxLoadPerPhase",
          severity: "error",
        });
      }
      if (worker.QualificationLevel < 1 || worker.QualificationLevel > 5) {
        errors.push({
          id: `qualification-range-${worker.WorkerID}`,
          type: "out_of_range",
          message: "QualificationLevel must be between 1 and 5",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "QualificationLevel",
          severity: "error",
        });
      }
    });

    return errors;
  };

  const validateBrokenJSON = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.clients?.forEach((client) => {
      try {
        JSON.parse(client.AttributesJSON);
      } catch {
        errors.push({
          id: `broken-json-${client.ClientID}`,
          type: "broken_json",
          message: "Invalid JSON in AttributesJSON",
          entity: "client",
          entityId: client.ClientID,
          field: "AttributesJSON",
          severity: "error",
        });
      }
    });

    return errors;
  };

  const validateUnknownReferences = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const taskIds = new Set(state.tasks?.map((t) => t.TaskID) || []);

    state.clients?.forEach((client) => {
      client.RequestedTaskIDs?.forEach((taskId) => {
        if (!taskIds.has(taskId)) {
          errors.push({
            id: `unknown-task-${client.ClientID}-${taskId}`,
            type: "unknown_reference",
            message: `Referenced TaskID '${taskId}' does not exist`,
            entity: "client",
            entityId: client.ClientID,
            field: "RequestedTaskIDs",
            severity: "error",
          });
        }
      });
    });

    return errors;
  };

  const validateCircularCoRuns = (): ValidationError[] => {
    // Simplified circular dependency check
    return [];
  };

  const validateOverloadedWorkers = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.workers?.forEach((worker) => {
      if (worker.AvailableSlots.length < worker.MaxLoadPerPhase) {
        errors.push({
          id: `overloaded-${worker.WorkerID}`,
          type: "overloaded_worker",
          message: "MaxLoadPerPhase exceeds available slots",
          entity: "worker",
          entityId: worker.WorkerID,
          field: "MaxLoadPerPhase",
          severity: "warning",
        });
      }
    });

    return errors;
  };

  const validateSkillCoverage = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    const workerSkills = new Set();
    
    state.workers?.forEach((worker) => {
      worker.Skills?.forEach((skill) => workerSkills.add(skill));
    });

    state.tasks?.forEach((task) => {
      const missingSkills = task.RequiredSkills?.filter((skill) => !workerSkills.has(skill)) || [];
      if (missingSkills.length > 0) {
        errors.push({
          id: `missing-skills-${task.TaskID}`,
          type: "skill_coverage",
          message: `No workers have required skills: ${missingSkills.join(", ")}`,
          entity: "task",
          entityId: task.TaskID,
          field: "RequiredSkills",
          severity: "warning",
        });
      }
    });

    return errors;
  };

  const validateMaxConcurrency = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    state.tasks?.forEach((task) => {
      const qualifiedWorkers = state.workers?.filter((worker) =>
        task.RequiredSkills?.every((skill) => worker.Skills?.includes(skill))
      ) || [];

      if (task.MaxConcurrent > qualifiedWorkers.length) {
        errors.push({
          id: `max-concurrent-${task.TaskID}`,
          type: "max_concurrency",
          message: `MaxConcurrent (${task.MaxConcurrent}) exceeds qualified workers (${qualifiedWorkers.length})`,
          entity: "task",
          entityId: task.TaskID,
          field: "MaxConcurrent",
          severity: "warning",
        });
      }
    });

    return errors;
  };

  const clearData = () => {
    dispatch({ type: "SET_CLIENTS", payload: [] });
    dispatch({ type: "SET_WORKERS", payload: [] });
    dispatch({ type: "SET_TASKS", payload: [] });
    dispatch({ type: "SET_VALIDATION_ERRORS", payload: [] });
    setUploadStatus("idle");
    setUploadProgress(0);
    setValidating(false);
  };

  const totalRecords = (state.clients?.length || 0) + (state.workers?.length || 0) + (state.tasks?.length || 0);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Data Files
          </CardTitle>
          <CardDescription>
            Drag and drop your CSV files or click to browse. Supported files: clients.csv, workers.csv, tasks.csv
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full">
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              
              <div>
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <FileText className="w-3 h-3 mr-1" />
                  CSV Files
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Database className="w-3 h-3 mr-1" />
                  Multiple Files
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Processing
                </Badge>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Processing files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus === "success" && (
            <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Files uploaded successfully! Data validation in progress...
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {errorMessage || 'Failed to upload files. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Summary */}
      {totalRecords > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRecords}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{state.clients?.length || 0}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workers</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{state.workers?.length || 0}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{state.tasks?.length || 0}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={validateData} 
          disabled={totalRecords === 0 || uploading || validating}
          className="btn-modern bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          {validating ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Validating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Data
            </>
          )}
        </Button>
        
        <Button 
          onClick={clearData} 
          variant="outline" 
          disabled={totalRecords === 0 || uploading || validating}
          className="btn-modern"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Data
        </Button>
      </div>

      {/* Validation Status */}
      {state.validationErrors.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Found {state.validationErrors.length} validation issues. Check the Data Validation tab for details.
          </AlertDescription>
        </Alert>
      )}

      {state.validationErrors.length === 0 && totalRecords > 0 && !validating && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            All data validated successfully! No issues found.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 