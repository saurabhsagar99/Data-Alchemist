"use client"

import { useState } from "react";
import { DataProvider } from "@/contexts/data-context";
import { DataIngestion } from "@/components/data-ingestion";
import { DataGrid } from "@/components/data-grid";
import DataValidation from "@/components/data-validation";
import RuleBuilder from "@/components/rule-builder";
import NaturalLanguageSearch from "@/components/natural-language-search";
import PrioritizationPanel from "@/components/prioritization-panel";
import ExportPanel from "@/components/export-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  Database, 
  Search, 
  Settings, 
  BarChart3, 
  Download, 
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Star
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DataProvider>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">Data Alchemist</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your data with AI-powered cleaning, validation, and analysis. 
                Upload CSV files, apply intelligent rules, and export clean datasets with ease.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="btn-modern px-8 py-3 text-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  View Documentation
                </Button>
              </div>
              
              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Zap className="w-4 h-4 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Shield className="w-4 h-4 mr-1" />
                  Secure
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Real-time
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  Collaborative
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:w-80 flex-shrink-0">
                  <Card className="glass-effect sticky top-8">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Workspace
                      </CardTitle>
                      <CardDescription>
                        Manage your data processing workflow
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent">
                        <TabsTrigger 
                          value="overview" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Overview</div>
                              <div className="text-xs text-muted-foreground">Dashboard & Analytics</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="ingestion" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <Upload className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Data Ingestion</div>
                              <div className="text-xs text-muted-foreground">Upload & Process Files</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="validation" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Validation</div>
                              <div className="text-xs text-muted-foreground">Quality Checks & Rules</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="rules" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Rule Builder</div>
                              <div className="text-xs text-muted-foreground">Custom Processing Rules</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="search" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <Search className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">AI Search</div>
                              <div className="text-xs text-muted-foreground">Natural Language Queries</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="prioritization" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Prioritization</div>
                              <div className="text-xs text-muted-foreground">Smart Task Ranking</div>
                            </div>
                          </div>
                        </TabsTrigger>
                        
                        <TabsTrigger 
                          value="export" 
                          className="justify-start h-auto p-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/10 data-[state=active]:to-purple-500/10 data-[state=active]:border-l-4 data-[state=active]:border-blue-500"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-medium">Export</div>
                              <div className="text-xs text-muted-foreground">Download Results</div>
                            </div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card className="card-hover glass-effect">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Total Records</CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">2,847</div>
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="text-green-600 dark:text-green-400">+12%</span> from last week
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="card-hover glass-effect">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Validation Score</CardTitle>
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400">94.2%</div>
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="text-green-600 dark:text-green-400">+5.3%</span> improvement
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="card-hover glass-effect">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Processing Time</CardTitle>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">2.3s</div>
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="text-green-600 dark:text-green-400">-18%</span> faster
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">New data uploaded</p>
                              <p className="text-sm text-muted-foreground">workers.csv - 156 records</p>
                            </div>
                            <Badge variant="secondary">2 min ago</Badge>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Validation completed</p>
                              <p className="text-sm text-muted-foreground">98.5% success rate</p>
                            </div>
                            <Badge variant="secondary">5 min ago</Badge>
                          </div>

                          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Issues detected</p>
                              <p className="text-sm text-muted-foreground">3 duplicate entries found</p>
                            </div>
                            <Badge variant="secondary">8 min ago</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ingestion" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Data Ingestion
                        </CardTitle>
                        <CardDescription>
                          Upload and process your CSV files with AI-powered cleaning
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataIngestion />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="validation" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Data Validation
                        </CardTitle>
                        <CardDescription>
                          Validate your data quality and apply custom rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataValidation />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rules" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Rule Builder
                        </CardTitle>
                        <CardDescription>
                          Create and manage custom data processing rules
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RuleBuilder />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="search" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          AI-Powered Search
                        </CardTitle>
                        <CardDescription>
                          Search your data using natural language queries
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <NaturalLanguageSearch />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="prioritization" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Task Prioritization
                        </CardTitle>
                        <CardDescription>
                          Prioritize tasks using AI-powered ranking algorithms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PrioritizationPanel />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="export" className="space-y-6">
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          Export Results
                        </CardTitle>
                        <CardDescription>
                          Download your processed data and reports
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ExportPanel />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </section>

        {/* Data Grid - Always visible at bottom */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  View and interact with your processed data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataGrid />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DataProvider>
  );
}
