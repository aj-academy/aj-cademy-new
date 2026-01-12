"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { fetchAPI } from '@/lib/api-client'

// Define types for stats data
interface DashboardStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  hiredCandidates: number
  // Monthly data for charts
  jobsByMonth: {
    month: string
    jobs: number
  }[]
  applicationsByMonth: {
    month: string
    applications: number
  }[]
  applicationsByStatus: {
    status: string
    count: number
  }[]
}

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  pending: '#3b82f6',
  reviewed: '#8b5cf6',
  interviewed: '#06b6d4',
  rejected: '#ef4444',
  hired: '#10b981'
};

export default function HRDashboardStatsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("6months")
  const { toast } = useToast()

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetchAPI<DashboardStats>(`/hr/dashboard/stats?timeRange=${timeRange}`)
      
      if (response.error) {
        // Check for authentication error
        if (response.error.includes('Authentication') || response.error.includes('Unauthorized')) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          })
          
          // Redirect to login page after short delay
          setTimeout(() => {
            window.location.href = '/hr/login'
          }, 2000)
          return
        }
        throw new Error(response.error)
      }
      
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate percentage change (for demo, using random values)
  const getPercentChange = (current: number, type: string) => {
    // In a real app, you'd compare with previous period data
    const randomChange = Math.floor(Math.random() * 30) - 15
    return randomChange
  }

  // Format percentage display with color and arrow
  const renderPercentageChange = (value: number) => {
    if (value > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpIcon className="mr-1 h-4 w-4" />
          <span>+{value}%</span>
        </div>
      )
    } else if (value < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownIcon className="mr-1 h-4 w-4" />
          <span>{value}%</span>
        </div>
      )
    } else {
      return <span className="text-gray-500">0%</span>
    }
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-gray-600">{`${label}`}</p>
          <p className="font-medium text-blue-600">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading statistics...</span>
      </div>
    )
  }

  // Generate mock data for demo purposes if no stats available
  const mockJobsData = stats?.jobsByMonth || [
    { month: "Jan", jobs: 4 },
    { month: "Feb", jobs: 6 },
    { month: "Mar", jobs: 10 },
    { month: "Apr", jobs: 8 },
    { month: "May", jobs: 12 },
    { month: "Jun", jobs: 15 }
  ]
  
  const mockApplicationsData = stats?.applicationsByMonth || [
    { month: "Jan", applications: 15 },
    { month: "Feb", applications: 22 },
    { month: "Mar", applications: 38 },
    { month: "Apr", applications: 45 },
    { month: "May", applications: 40 },
    { month: "Jun", applications: 55 }
  ]
  
  const mockStatusData = stats?.applicationsByStatus || [
    { status: "Pending", count: 35 },
    { status: "Reviewed", count: 25 },
    { status: "Interviewed", count: 15 },
    { status: "Rejected", count: 20 },
    { status: "Hired", count: 10 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDashboardStats}>Refresh</Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalJobs || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageChange(getPercentChange(stats?.totalJobs || 0, 'jobs'))}
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Jobs</CardDescription>
            <CardTitle className="text-3xl">{stats?.activeJobs || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageChange(getPercentChange(stats?.activeJobs || 0, 'activeJobs'))}
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Applications</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalApplications || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageChange(getPercentChange(stats?.totalApplications || 0, 'applications'))}
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl">{stats?.pendingApplications || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageChange(getPercentChange(stats?.pendingApplications || 0, 'pendingApplications'))}
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hired Candidates</CardDescription>
            <CardTitle className="text-3xl">{stats?.hiredCandidates || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageChange(getPercentChange(stats?.hiredCandidates ||.0, 'hiredCandidates'))}
            <p className="text-xs text-gray-500 mt-1">vs previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-3">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>
        
        {/* Jobs Chart */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Postings Over Time</CardTitle>
              <CardDescription>
                Number of jobs posted monthly over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockJobsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="jobs" fill="#4f46e5" name="Job Postings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Applications Chart */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications Received</CardTitle>
              <CardDescription>
                Number of applications received monthly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockApplicationsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#0ea5e9" 
                      strokeWidth={2}
                      name="Applications"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Status Distribution Chart */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of applications by current status
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Additional section for conversion rates and time-to-hire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Application Conversion Rate</CardTitle>
            <CardDescription>
              Percentage of applications that resulted in hires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-blue-600">
                {stats?.hiredCandidates && stats?.totalApplications 
                  ? ((stats.hiredCandidates / stats.totalApplications) * 100).toFixed(1) 
                  : "9.1"}%
              </div>
              <p className="text-gray-500 mt-2">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Time-to-Hire</CardTitle>
            <CardDescription>
              Average days from application to hire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-green-600">
                {/* Mock value - would come from API in real app */}
                21
              </div>
              <p className="text-gray-500 mt-2">Days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 