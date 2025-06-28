"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Users,
  School,
  DollarSign,
  CheckSquare,
  Plus,
  MoreHorizontal,
  MapPin,
  TrendingUp,
  Settings,
  LogOut,
  Sparkles,
  ArrowLeftRight,
  Loader2,
  Edit,
  Trash2,
  CreditCard,
  Receipt,
  Target,
  FileText,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { teamService, taskService, donationService, expenseService, institutionService, reportService, notificationService, analyticsService, type TeamMember, type Institution, type Task, type Donation, type Expense, type Report, type Analytics } from "@/lib/firestore"
import { institutionServiceEnhanced, analyticsServiceEnhanced, testFirebaseConnection } from "@/lib/firestore-enhanced"
import { onAuthStateChangeWithDebug, getCurrentUser, isUserAuthenticated } from "@/lib/auth-debug"
import { Timestamp } from "firebase/firestore"
import { toast } from "sonner"

interface DashboardProps {
  onLogout: () => void
  onSwitchProject: () => void
  currentProject: string | null
  currentUser: string | null
}

export default function Dashboard({ onLogout, onSwitchProject, currentProject, currentUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [connectionTestResult, setConnectionTestResult] = useState<string>("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Test Firebase connection
  const handleTestConnection = async () => {
    console.log('🧪 Starting Firebase connection test...');
    setConnectionTestResult("Testing connection...");
    
    try {
      await testFirebaseConnection();
      setConnectionTestResult("✅ Connection successful!");
      toast.success("Firebase connection successful!");
    } catch (error) {
      setConnectionTestResult(`❌ Connection failed: ${error}`);
      toast.error("Firebase connection failed!");
    }
  };

  // Load initial data and set up real-time listeners
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true)
      console.log('🚀 Starting dashboard data load...', { 
        currentProject, 
        currentUser,
        isAuthenticated: isUserAuthenticated()
      })
      
      try {
        // Test if user is authenticated first
        if (!isUserAuthenticated()) {
          console.log('❌ User not authenticated, skipping data load');
          toast.error('Please sign in to access dashboard data');
          setIsLoadingData(false);
          return;
        }

        // Load analytics with enhanced service
        console.log('📊 Loading analytics...');
        const { analytics: analyticsData, error: analyticsError } = await analyticsServiceEnhanced.getAnalytics()
        if (analyticsError) {
          console.error('Analytics error:', analyticsError)
          toast.error(`Analytics error: ${analyticsError}`)
        } else if (analyticsData) {
          setAnalytics(analyticsData)
          console.log('✅ Analytics loaded successfully')
        }

        // Load institutions with enhanced service
        console.log('🏢 Loading institutions...');
        const { institutions: institutionsData, error: institutionsError } = await institutionServiceEnhanced.getAll()
        if (institutionsError) {
          console.error('Institutions error:', institutionsError)
          toast.error(`Institutions error: ${institutionsError}`)
        } else {
          setInstitutions(institutionsData)
          console.log(`✅ Loaded ${institutionsData.length} institutions`)
        }

        // Load other data with original services (fallback)
        console.log('📝 Loading tasks, donations, expenses...');
        const [tasksResult, donationsResult, expensesResult, reportsResult] = await Promise.allSettled([
          taskService.getAll(),
          donationService.getAll(), 
          expenseService.getAll(),
          reportService.getAll()
        ]);

        // Handle tasks result
        if (tasksResult.status === 'fulfilled') {
          const { tasks: tasksData, error: tasksError } = tasksResult.value;
          if (tasksError) {
            console.error('Tasks error:', tasksError);
            toast.error(`Tasks error: ${tasksError}`);
          } else {
            setTasks(tasksData);
            console.log(`✅ Loaded ${tasksData.length} tasks`);
          }
        } else {
          console.error('Tasks promise rejected:', tasksResult.reason);
        }

        // Handle donations result  
        if (donationsResult.status === 'fulfilled') {
          const { donations: donationsData, error: donationsError } = donationsResult.value;
          if (donationsError) {
            console.error('Donations error:', donationsError);
            toast.error(`Donations error: ${donationsError}`);
          } else {
            setDonations(donationsData);
            console.log(`✅ Loaded ${donationsData.length} donations`);
          }
        } else {
          console.error('Donations promise rejected:', donationsResult.reason);
        }

        // Handle expenses result
        if (expensesResult.status === 'fulfilled') {
          const { expenses: expensesData, error: expensesError } = expensesResult.value;
          if (expensesError) {
            console.error('Expenses error:', expensesError);
            toast.error(`Expenses error: ${expensesError}`);
          } else {
            setExpenses(expensesData);
            console.log(`✅ Loaded ${expensesData.length} expenses`);
          }
        } else {
          console.error('Expenses promise rejected:', expensesResult.reason);
        }

        // Handle reports result
        if (reportsResult.status === 'fulfilled') {
          const { reports: reportsData, error: reportsError } = reportsResult.value;
          if (reportsError) {
            console.error('Reports error:', reportsError);
            toast.error(`Reports error: ${reportsError}`);
          } else {
            setReports(reportsData);
            console.log(`✅ Loaded ${reportsData.length} reports`);
          }
        } else {
          console.error('Reports promise rejected:', reportsResult.reason);
        }
        
        console.log('✅ Dashboard data loading completed')
        toast.success('Dashboard data loaded successfully!')
      } catch (error) {
        console.error('💥 Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data: ' + (error instanceof Error ? error.message : 'Unknown error'))
      } finally {
        setIsLoadingData(false)
      }
    }

    // Set up auth state monitoring
    const unsubscribeAuth = onAuthStateChangeWithDebug((user) => {
      if (user) {
        console.log('✅ User authenticated, loading data...');
        loadInitialData();
      } else {
        console.log('❌ User not authenticated, clearing data...');
        setAnalytics(null);
        setInstitutions([]);
        setTasks([]);
        setDonations([]);
        setExpenses([]);
        setReports([]);
        setIsLoadingData(false);
      }
    });

    // Set up real-time listeners with enhanced error handling
    let unsubscribeInstitutions = () => {};
    let unsubscribeTasks = () => {};
    let unsubscribeDonations = () => {};
    let unsubscribeExpenses = () => {};
    let unsubscribeReports = () => {};

    if (isUserAuthenticated()) {
      try {
        unsubscribeInstitutions = institutionServiceEnhanced.listen(setInstitutions);
        unsubscribeTasks = taskService.listen(setTasks);
        unsubscribeDonations = donationService.listen(setDonations);
        unsubscribeExpenses = expenseService.listen(setExpenses);
        unsubscribeReports = reportService.listen(setReports);
        console.log('👂 Real-time listeners set up successfully');
      } catch (error) {
        console.error('❌ Failed to set up real-time listeners:', error);
      }
    }

    return () => {
      unsubscribeAuth();
      unsubscribeInstitutions();
      unsubscribeTasks();
      unsubscribeDonations();
      unsubscribeExpenses();
      unsubscribeReports();
      console.log('🧹 Dashboard cleanup completed');
    }
  }, [currentProject])

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading dashboard data...</span>
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            className="mt-4"
          >
            🧪 Test Firebase Connection
          </Button>
          {connectionTestResult && (
            <p className="text-sm mt-2">{connectionTestResult}</p>
          )}
        </div>
      )
    }

    switch (activeTab) {
      case "dashboard":
        return <DashboardContent analytics={analytics} />
      case "orphanages":
        return <OrphanagesContent institutions={institutions} />
      case "tasks":
        return <TasksContent tasks={tasks} />
      case "users":
        return <UsersContent />
      case "finances":
        return <FinancesContent donations={donations} expenses={expenses} />
      case "reports":
        return <ReportsContent reports={reports} analytics={analytics} />
      case "notifications":
        return <NotificationsContent />
      default:
        return <DashboardContent analytics={analytics} />
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f3]">
      {/* Enhanced sidebar with 0.7% spacing and toggle */}
      <div 
        className={`fixed z-50 bg-black shadow-xl rounded-lg transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{
          left: '0.7%',
          top: '0.7%',
          height: '98.6%'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header with toggle button */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-700 px-4">
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold text-[#f5f8f3]">Zask Dashboard</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-[#f5f8f3] hover:bg-gray-800 p-2"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className={`flex-1 space-y-1 py-4 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Dashboard" : ""}
            >
              <Sparkles className="h-4 w-4" />
              {!isSidebarCollapsed && "Dashboard"}
            </button>
            <button
              onClick={() => setActiveTab("orphanages")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "orphanages"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Institutions" : ""}
            >
              <School className="h-4 w-4" />
              {!isSidebarCollapsed && "Institutions"}
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "tasks"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Tasks" : ""}
            >
              <CheckSquare className="h-4 w-4" />
              {!isSidebarCollapsed && "Tasks"}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Team" : ""}
            >
              <Users className="h-4 w-4" />
              {!isSidebarCollapsed && "Team"}
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "finances"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Finances" : ""}
            >
              <DollarSign className="h-4 w-4" />
              {!isSidebarCollapsed && "Finances"}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "reports"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Reports" : ""}
            >
              <FileText className="h-4 w-4" />
              {!isSidebarCollapsed && "Reports"}
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex w-full items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-[#f5f8f3] text-black"
                  : "text-[#f5f8f3] hover:bg-gray-800"
              }`}
              title={isSidebarCollapsed ? "Notifications" : ""}
            >
              <Bell className="h-4 w-4" />
              {!isSidebarCollapsed && "Notifications"}
            </button>
          </nav>

          <div className={`flex flex-col gap-2 p-4 border-t border-gray-700 ${isSidebarCollapsed ? 'items-center' : ''}`}>
            {!isSidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="h-8 w-8 rounded-full bg-[#f5f8f3] flex items-center justify-center">
                    <span className="text-black font-medium">
                      {currentUser?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{currentUser || 'User'}</p>
                    <p className="text-xs text-gray-400">Project: {currentProject || 'None'}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSwitchProject}
                    className="flex-1 h-8 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <ArrowLeftRight className="h-3 w-3 mr-1" />
                    Switch
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="h-8 text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="h-8 w-8 rounded-full bg-[#f5f8f3] flex items-center justify-center mx-auto">
                  <span className="text-black font-medium text-xs">
                    {currentUser?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSwitchProject}
                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                    title="Switch Project"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                    title="Settings"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-gray-800"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div 
        className="transition-all duration-300"
        style={{
          marginLeft: isSidebarCollapsed ? 'calc(0.7% + 4rem + 1rem)' : 'calc(0.7% + 16rem + 1rem)',
          marginRight: '0.7%',
          marginTop: '0.7%',
          marginBottom: '0.7%'
        }}
      >
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 rounded-t-lg">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live Data</span>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10 bg-white rounded-b-lg shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

// Enhanced DashboardContent with real analytics
function DashboardContent({ analytics }: { analytics: Analytics | null }) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-5xl font-bold text-gray-900 font-ephesis">Analytics Overview</h2>
        <p className="text-lg text-gray-600 mt-2 font-poiret-one">Real-time insights from your Zask projects</p>
      </div>
      
      {/* Overview Cards with real data */}
      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{analytics.totalTasks}</p>
            <p className="text-sm text-blue-600 mt-1">{analytics.taskCompletionRate.toFixed(1)}% completion rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">PKR {analytics.totalDonationAmount.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">{analytics.totalDonations} donations received</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <School className="w-5 h-5" />
              Institutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{analytics.totalInstitutions}</p>
            <p className="text-sm text-purple-600 mt-1">{analytics.activeInstitutions} active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{analytics.totalTeamMembers}</p>
            <p className="text-sm text-orange-600 mt-1">{analytics.activeTeamMembers} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="text-gray-800">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Donations:</span>
              <span className="font-bold text-green-600">PKR {analytics.totalDonationAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Expenses:</span>
              <span className="font-bold text-red-600">PKR {analytics.totalExpenseAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-800 font-semibold">Net Balance:</span>
              <span className={`font-bold ${analytics.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PKR {analytics.netBalance.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="text-gray-800">Task Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{analytics.completedTasks}/{analytics.totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{width: `${analytics.taskCompletionRate}%`}}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="font-bold text-red-600">{analytics.pendingTasks}</p>
                <p className="text-gray-600">Pending</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">{analytics.inProgressTasks}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
              <div>
                <p className="font-bold text-green-600">{analytics.completedTasks}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="text-gray-800">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topExpenseCategories.slice(0, 4).map((category, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{category.category.replace('_', ' ')}</span>
                <span className="font-semibold text-gray-800">PKR {category.amount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced OrphanagesContent with real data
function OrphanagesContent({ institutions }: { institutions: Institution[] }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-gray-900 font-ephesis">Institutions</h2>
          <p className="text-lg text-gray-600 mt-2 font-poiret-one">Manage partner orphanages and schools</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Add Institution
        </Button>
      </div>
      
      {/* Real institutions data */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <School className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No institutions found. Add your first institution to get started.</p>
          </div>
        ) : (
          institutions.map((institution) => (
            <Card key={institution.id} className="bg-white border-gray-300 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="w-5 h-5 text-blue-600" />
                  {institution.name}
                </CardTitle>
                <Badge className={institution.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {institution.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {institution.city}
                </p>
                <p className="text-sm text-gray-600">Type: {institution.type}</p>
                <p className="text-sm text-gray-600">Children: {institution.numberOfChildren}</p>
                <p className="text-sm text-gray-600">Contact: {institution.contactPerson}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// New comprehensive Reports section
function ReportsContent({ reports, analytics }: { reports: Report[]; analytics: Analytics | null }) {
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    type: 'financial' as Report['type'],
    description: '',
    format: 'pdf' as Report['format'],
    dateRange: {
      startDate: '',
      endDate: ''
    },
    isScheduled: false,
    scheduleFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly'
  })

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGeneratingReport(true)

    try {
      // Convert string dates to Timestamp objects
      const startDate = Timestamp.fromDate(new Date(newReport.dateRange.startDate))
      const endDate = Timestamp.fromDate(new Date(newReport.dateRange.endDate))

      // Here you would generate the actual report
      const reportData = {
        title: newReport.title,
        type: newReport.type,
        description: newReport.description,
        format: newReport.format,
        isScheduled: newReport.isScheduled,
        scheduleFrequency: newReport.scheduleFrequency,
        generatedBy: 'current-user',
        projectId: 'current-project',
        status: 'completed' as const,
        dateRange: {
          startDate,
          endDate
        },
        data: {
          summary: analytics || {},
          details: [],
          charts: []
        }
      }

      const { error } = await reportService.create(reportData)
      
      if (error) {
        toast.error('Failed to generate report')
      } else {
        toast.success('Report generated successfully!')
        setShowCreateReport(false)
        setNewReport({
          title: '',
          type: 'financial',
          description: '',
          format: 'pdf',
          dateRange: { startDate: '', endDate: '' },
          isScheduled: false,
          scheduleFrequency: 'monthly'
        })
      }
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-gray-900 font-ephesis">Reports & Analytics</h2>
          <p className="text-lg text-gray-600 mt-2 font-poiret-one">Generate comprehensive reports and analytics</p>
        </div>
        <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
              <Plus className="w-5 h-5 mr-2" />
              Generate New Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate New Report
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="reportTitle">Report Title</Label>
                  <Input
                    id="reportTitle"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({...prev, title: e.target.value}))}
                    placeholder="Monthly Financial Report"
                    required
                    disabled={isGeneratingReport}
                  />
                </div>
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({...prev, type: value as Report['type']}))}>
                    <SelectTrigger disabled={isGeneratingReport}>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Report</SelectItem>
                      <SelectItem value="task_progress">Task Progress</SelectItem>
                      <SelectItem value="team_performance">Team Performance</SelectItem>
                      <SelectItem value="institution_summary">Institution Summary</SelectItem>
                      <SelectItem value="donation_analytics">Donation Analytics</SelectItem>
                      <SelectItem value="expense_breakdown">Expense Breakdown</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reportFormat">Format</Label>
                  <Select value={newReport.format} onValueChange={(value) => setNewReport(prev => ({...prev, format: value as Report['format']}))}>
                    <SelectTrigger disabled={isGeneratingReport}>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newReport.dateRange.startDate}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      dateRange: {...prev.dateRange, startDate: e.target.value}
                    }))}
                    required
                    disabled={isGeneratingReport}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newReport.dateRange.endDate}
                    onChange={(e) => setNewReport(prev => ({
                      ...prev, 
                      dateRange: {...prev.dateRange, endDate: e.target.value}
                    }))}
                    required
                    disabled={isGeneratingReport}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateReport(false)}
                  disabled={isGeneratingReport}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Reports List */}
      <div className="grid gap-6">
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No reports generated yet. Create your first report to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className="bg-blue-100 text-blue-800">{report.type}</Badge>
                        <Badge className={
                          report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersContent() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMember, setNewMember] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    permissions: 'member' as 'admin' | 'lead' | 'manager' | 'member'
  })

  // Load team members
  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    const { members: fetchedMembers, error } = await teamService.getAll()
    if (error) {
      toast.error('Failed to load team members')
    } else {
      setMembers(fetchedMembers)
    }
    setIsLoading(false)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingMember(true)

    const memberData = {
      ...newMember,
      status: 'active' as const
    }

    const { error } = await teamService.create(memberData)
    
    if (error) {
      toast.error('Failed to add team member')
    } else {
      toast.success('Team member added successfully!')
      setNewMember({
        fullName: '',
        email: '',
        role: '',
        department: '',
        permissions: 'member'
      })
      setShowAddForm(false)
      loadMembers() // Refresh the list
    }
    setIsAddingMember(false)
  }

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team?`)) return
    
    const { error } = await teamService.delete(id)
    if (error) {
      toast.error('Failed to remove team member')
    } else {
      toast.success('Team member removed successfully')
      loadMembers()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-black">Team Members</h2>
          <p className="text-gray-600 mt-2">Manage team members and permissions</p>
        </div>
        <Button 
          className="bg-black hover:bg-gray-800 text-[#f5f8f3]"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="text-black">Add New Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember(prev => ({...prev, fullName: e.target.value}))}
                    placeholder="Enter full name"
                    required
                    disabled={isAddingMember}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({...prev, email: e.target.value}))}
                    placeholder="Enter email address"
                    required
                    disabled={isAddingMember}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({...prev, role: e.target.value}))}
                    placeholder="e.g., Frontend Developer"
                    required
                    disabled={isAddingMember}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newMember.department}
                    onChange={(e) => setNewMember(prev => ({...prev, department: e.target.value}))}
                    placeholder="e.g., Engineering"
                    required
                    disabled={isAddingMember}
                  />
                </div>
                <div>
                  <Label htmlFor="permissions">Permissions</Label>
                  <select
                    id="permissions"
                    value={newMember.permissions}
                    onChange={(e) => setNewMember(prev => ({...prev, permissions: e.target.value as 'admin' | 'lead' | 'manager' | 'member'}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={isAddingMember}
                  >
                    <option value="member">Member</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-black hover:bg-gray-800 text-[#f5f8f3]"
                  disabled={isAddingMember}
                >
                  {isAddingMember ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Member'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={isAddingMember}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      ) : (
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <Card key={member.id} className="bg-white border-gray-300">
            <CardContent className="p-6 text-center relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Member
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={() => member.id && handleDeleteMember(member.id, member.fullName)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="w-16 h-16 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-[#f5f8f3] font-bold text-lg">
                  {member.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-black">{member.fullName}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <p className="text-xs text-gray-500 mt-1">{member.email}</p>
              <div className="flex justify-center gap-2 mt-3">
                <Badge className={`${
                  member.status === 'active' ? 'bg-green-100 text-green-800' :
                  member.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.status === 'active' ? 'Active' : 
                   member.status === 'away' ? 'Away' : 'Offline'}
                </Badge>
                <Badge className={`${
                  member.permissions === 'admin' ? 'bg-blue-100 text-blue-800' :
                  member.permissions === 'manager' ? 'bg-purple-100 text-purple-800' :
                  member.permissions === 'lead' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {member.permissions.charAt(0).toUpperCase() + member.permissions.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">Department: {member.department}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Team Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-2xl font-bold text-black">{members.length}</h4>
            <p className="text-sm text-gray-600">Total Members</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === 'active').length}
            </h4>
            <p className="text-sm text-gray-600">Active Now</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-2xl font-bold text-blue-600">
              {new Set(members.map(m => m.department)).size}
            </h4>
            <p className="text-sm text-gray-600">Departments</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-2xl font-bold text-purple-600">
              {members.filter(m => m.permissions === 'admin' || m.permissions === 'manager').length}
            </h4>
            <p className="text-sm text-gray-600">Leaders</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TasksContent({ tasks }: { tasks: Task[] }) {
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignedEmail: '',
    status: 'todo' as 'todo' | 'in-progress' | 'completed',
    priority: 'medium' as 'high' | 'medium' | 'low',
    progress: 0
  })

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingTask(true)

    const taskData = {
      ...newTask,
      projectId: 'current-project-id', // You can get this from props or context
      createdBy: 'current-user' // You can get this from props or context
    }

    const { error } = await taskService.create(taskData)
    
    if (error) {
      toast.error('Failed to create task')
    } else {
      toast.success('Task created successfully!')
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        assignedEmail: '',
        status: 'todo',
        priority: 'medium',
        progress: 0
      })
      setShowCreateTask(false)
    }
    setIsCreatingTask(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-black">Tasks Overview</h2>
          <p className="text-gray-600 mt-2">Manage and track all project tasks across teams</p>
        </div>
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 text-[#f5f8f3]">
              <Plus className="w-4 h-4 mr-2" />
              Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Add a new task to your project and assign it to team members.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({...prev, title: e.target.value}))}
                    placeholder="Enter task title"
                    required
                    disabled={isCreatingTask}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="taskDescription">Description</Label>
                  <Textarea
                    id="taskDescription"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe the task details..."
                    rows={3}
                    required
                    disabled={isCreatingTask}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({...prev, assignedTo: e.target.value}))}
                    placeholder="Team member name"
                    required
                    disabled={isCreatingTask}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedEmail">Email</Label>
                  <Input
                    id="assignedEmail"
                    type="email"
                    value={newTask.assignedEmail}
                    onChange={(e) => setNewTask(prev => ({...prev, assignedEmail: e.target.value}))}
                    placeholder="team@example.com"
                    required
                    disabled={isCreatingTask}
                  />
                </div>
                <div>
                  <Label htmlFor="taskPriority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({...prev, priority: value as 'high' | 'medium' | 'low'}))}>
                    <SelectTrigger disabled={isCreatingTask}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taskStatus">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask(prev => ({...prev, status: value as 'todo' | 'in-progress' | 'completed'}))}>
                    <SelectTrigger disabled={isCreatingTask}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="bg-black hover:bg-gray-800 text-[#f5f8f3]"
                  disabled={isCreatingTask}
                >
                  {isCreatingTask ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateTask(false)}
                  disabled={isCreatingTask}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* To Do Column */}
        <Card className="bg-white border-gray-300">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              To Do (16)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK01 - Fix login authentication bug</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Alex Thompson</p>
              <p className="text-xs text-gray-500">Due: Tomorrow</p>
              <Badge className="bg-red-100 text-red-800 text-xs mt-2">High Priority</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK05 - Update user dashboard</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Sarah Chen</p>
              <p className="text-xs text-gray-500">Due: Dec 28</p>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-2">Medium Priority</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK08 - Database optimization</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Mike Rodriguez</p>
              <p className="text-xs text-gray-500">Due: Dec 30</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Low Priority</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK13 - Mobile app testing</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Team QA</p>
              <p className="text-xs text-gray-500">Due: Jan 5</p>
              <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-2">Medium Priority</Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* In Progress Column */}
        <Card className="bg-white border-gray-300">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              In Progress (8)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK02 - Payment gateway integration</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: David Kim</p>
              <p className="text-xs text-gray-500">Progress: 75%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK06 - API documentation</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Emma Wilson</p>
              <p className="text-xs text-gray-500">Progress: 45%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK11 - Security audit</h4>
              <p className="text-xs text-gray-600 mt-1">Assigned to: Security Team</p>
              <p className="text-xs text-gray-500">Progress: 30%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '30%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Completed Column */}
        <Card className="bg-white border-gray-300">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Completed (23)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK03 - User registration system</h4>
              <p className="text-xs text-gray-600 mt-1">Completed by: Alex Thompson</p>
              <p className="text-xs text-gray-500">Finished: Dec 22</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Completed</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK04 - Homepage redesign</h4>
              <p className="text-xs text-gray-600 mt-1">Completed by: Lisa Park</p>
              <p className="text-xs text-gray-500">Finished: Dec 20</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Completed</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK07 - Email notifications</h4>
              <p className="text-xs text-gray-600 mt-1">Completed by: James Liu</p>
              <p className="text-xs text-gray-500">Finished: Dec 18</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Completed</Badge>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <h4 className="font-medium text-black">TASK09 - Social media integration</h4>
              <p className="text-xs text-gray-600 mt-1">Completed by: Sarah Chen</p>
              <p className="text-xs text-gray-500">Finished: Dec 15</p>
              <Badge className="bg-green-100 text-green-800 text-xs mt-2">Completed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-lg font-bold text-black">47</h4>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-lg font-bold text-green-600">23</h4>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-lg font-bold text-blue-600">8</h4>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-300">
          <CardContent className="p-4 text-center">
            <h4 className="text-lg font-bold text-red-600">16</h4>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FinancesContent({ donations, expenses }: { donations: Donation[]; expenses: Expense[] }) {
  const [showDonationForm, setShowDonationForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [isAddingDonation, setIsAddingDonation] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  
  const [newDonation, setNewDonation] = useState({
    donorName: '',
    donorEmail: '',
    amount: 0,
    currency: 'PKR',
    purpose: '',
    paymentMethod: 'online' as 'cash' | 'card' | 'bank_transfer' | 'online',
    status: 'pending' as 'pending' | 'completed' | 'failed',
    notes: ''
  })

  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: 0,
    currency: 'PKR',
    category: 'other' as 'office_supplies' | 'equipment' | 'travel' | 'marketing' | 'utilities' | 'software' | 'other',
    paymentMethod: 'card' as 'cash' | 'card' | 'bank_transfer' | 'check',
    vendor: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'paid'
  })

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingDonation(true)

    const donationData = {
      ...newDonation,
      projectId: 'current-project-id',
      createdBy: 'current-user'
    }

    const { error } = await donationService.create(donationData)
    
    if (error) {
      toast.error('Failed to add donation')
    } else {
      toast.success('Donation added successfully!')
      setNewDonation({
        donorName: '',
        donorEmail: '',
        amount: 0,
        currency: 'PKR',
        purpose: '',
        paymentMethod: 'online',
        status: 'pending',
        notes: ''
      })
      setShowDonationForm(false)
    }
    setIsAddingDonation(false)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingExpense(true)

    const expenseData = {
      ...newExpense,
      projectId: 'current-project-id',
      createdBy: 'current-user'
    }

    const { error } = await expenseService.create(expenseData)
    
    if (error) {
      toast.error('Failed to add expense')
    } else {
      toast.success('Expense added successfully!')
      setNewExpense({
        title: '',
        description: '',
        amount: 0,
        currency: 'PKR',
        category: 'other',
        paymentMethod: 'card',
        vendor: '',
        status: 'pending'
      })
      setShowExpenseForm(false)
    }
    setIsAddingExpense(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-gray-900 font-ephesis">Financial Management</h2>
          <p className="text-lg text-gray-600 mt-2 font-poiret-one">Track donations, expenses, and financial reports</p>
        </div>
        <div className="flex gap-3">
          {/* Add Expense Dialog */}
          <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 px-6 border-2 bg-transparent">
                <Receipt className="w-5 h-5 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Add New Expense
                </DialogTitle>
                <DialogDescription>
                  Record a new expense for your project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="expenseTitle">Expense Title</Label>
                    <Input
                      id="expenseTitle"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense(prev => ({...prev, title: e.target.value}))}
                      placeholder="Enter expense title"
                      required
                      disabled={isAddingExpense}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="expenseDescription">Description</Label>
                    <Textarea
                      id="expenseDescription"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({...prev, description: e.target.value}))}
                      placeholder="Describe the expense..."
                      rows={3}
                      required
                      disabled={isAddingExpense}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseAmount">Amount (PKR)</Label>
                    <Input
                      id="expenseAmount"
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                      placeholder="0.00"
                      required
                      disabled={isAddingExpense}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseVendor">Vendor</Label>
                    <Input
                      id="expenseVendor"
                      value={newExpense.vendor}
                      onChange={(e) => setNewExpense(prev => ({...prev, vendor: e.target.value}))}
                      placeholder="Vendor name"
                      disabled={isAddingExpense}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseCategory">Category</Label>
                                         <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({...prev, category: value as 'office_supplies' | 'equipment' | 'travel' | 'marketing' | 'utilities' | 'software' | 'other'}))}>
                       <SelectTrigger disabled={isAddingExpense}>
                         <SelectValue placeholder="Select category" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="office_supplies">Office Supplies</SelectItem>
                         <SelectItem value="equipment">Equipment</SelectItem>
                         <SelectItem value="travel">Travel</SelectItem>
                         <SelectItem value="marketing">Marketing</SelectItem>
                         <SelectItem value="utilities">Utilities</SelectItem>
                         <SelectItem value="software">Software</SelectItem>
                         <SelectItem value="other">Other</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div>
                    <Label htmlFor="expensePayment">Payment Method</Label>
                                         <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense(prev => ({...prev, paymentMethod: value as 'cash' | 'card' | 'bank_transfer' | 'check'}))}>
                       <SelectTrigger disabled={isAddingExpense}>
                         <SelectValue placeholder="Select payment method" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="cash">Cash</SelectItem>
                         <SelectItem value="card">Card</SelectItem>
                         <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                         <SelectItem value="check">Check</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-black hover:bg-gray-800 text-[#f5f8f3]"
                    disabled={isAddingExpense}
                  >
                    {isAddingExpense ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Expense'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowExpenseForm(false)}
                    disabled={isAddingExpense}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Donation Dialog */}
          <Dialog open={showDonationForm} onOpenChange={setShowDonationForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
                <CreditCard className="w-5 h-5 mr-2" />
                Add Donation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Add New Donation
                </DialogTitle>
                <DialogDescription>
                  Record a new donation to your project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDonation} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="donorName">Donor Name</Label>
                    <Input
                      id="donorName"
                      value={newDonation.donorName}
                      onChange={(e) => setNewDonation(prev => ({...prev, donorName: e.target.value}))}
                      placeholder="Donor&apos;s full name"
                      required
                      disabled={isAddingDonation}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donorEmail">Email (Optional)</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={newDonation.donorEmail}
                      onChange={(e) => setNewDonation(prev => ({...prev, donorEmail: e.target.value}))}
                      placeholder="donor@example.com"
                      disabled={isAddingDonation}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donationAmount">Amount (PKR)</Label>
                    <Input
                      id="donationAmount"
                      type="number"
                      step="0.01"
                      value={newDonation.amount}
                      onChange={(e) => setNewDonation(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                      placeholder="0.00"
                      required
                      disabled={isAddingDonation}
                    />
                  </div>
                  <div>
                    <Label htmlFor="donationPayment">Payment Method</Label>
                                         <Select value={newDonation.paymentMethod} onValueChange={(value) => setNewDonation(prev => ({...prev, paymentMethod: value as 'cash' | 'card' | 'bank_transfer' | 'online'}))}>
                       <SelectTrigger disabled={isAddingDonation}>
                         <SelectValue placeholder="Select payment method" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="cash">Cash</SelectItem>
                         <SelectItem value="card">Card</SelectItem>
                         <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                         <SelectItem value="online">Online Payment</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="donationPurpose">Purpose</Label>
                    <Input
                      id="donationPurpose"
                      value={newDonation.purpose}
                      onChange={(e) => setNewDonation(prev => ({...prev, purpose: e.target.value}))}
                      placeholder="e.g., Project development, Equipment purchase"
                      required
                      disabled={isAddingDonation}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="donationNotes">Notes (Optional)</Label>
                    <Textarea
                      id="donationNotes"
                      value={newDonation.notes}
                      onChange={(e) => setNewDonation(prev => ({...prev, notes: e.target.value}))}
                      placeholder="Additional notes about the donation..."
                      rows={3}
                      disabled={isAddingDonation}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
                    disabled={isAddingDonation}
                  >
                    {isAddingDonation ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Donation'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowDonationForm(false)}
                    disabled={isAddingDonation}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">PKR {donations.reduce((total, donation) => total + donation.amount, 0).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">{donations.length} donations received</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">PKR {expenses.reduce((total, expense) => total + expense.amount, 0).toLocaleString()}</p>
            <p className="text-sm text-red-600 mt-1">{expenses.length} expenses recorded</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">PKR {(donations.reduce((total, donation) => total + donation.amount, 0) - expenses.reduce((total, expense) => total + expense.amount, 0)).toLocaleString()}</p>
            <p className="text-sm text-blue-600 mt-1">Available for projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-black">{donation.donorName}</p>
                  <p className="text-sm text-gray-600">{donation.purpose}</p>
                </div>
                <p className="font-bold text-green-600">PKR {donation.amount.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-black">{expense.title}</p>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                </div>
                <p className="font-bold text-red-600">PKR {expense.amount.toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NotificationsContent() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-bold text-gray-900 font-ephesis">Notifications</h2>
          <p className="text-lg text-gray-600 mt-2 font-poiret-one">Send notifications to registered users</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6">
          <Plus className="w-5 h-5 mr-2" />
          Send Notification
        </Button>
      </div>
      {/* Enhanced notifications content */}
    </div>
  )
}
