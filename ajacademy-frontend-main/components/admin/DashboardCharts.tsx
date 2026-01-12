"use client"

import React from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  ArcElement,
  RadialLinearScale,
  Filler 
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Define color schemes
const colors = {
  blue: {
    primary: 'rgba(59, 130, 246, 1)',
    background: 'rgba(59, 130, 246, 0.1)',
  },
  green: {
    primary: 'rgba(16, 185, 129, 1)',
    background: 'rgba(16, 185, 129, 0.1)',
  },
  red: {
    primary: 'rgba(239, 68, 68, 1)',
    background: 'rgba(239, 68, 68, 0.1)',
  },
  purple: {
    primary: 'rgba(139, 92, 246, 1)',
    background: 'rgba(139, 92, 246, 0.1)',
  },
  orange: {
    primary: 'rgba(249, 115, 22, 1)',
    background: 'rgba(249, 115, 22, 0.1)',
  },
  indigo: {
    primary: 'rgba(99, 102, 241, 1)',
    background: 'rgba(99, 102, 241, 0.1)',
  }
}

// Chart options
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  applications: number;
  newApplications: number;
  hiredCandidates: number;
}

interface DashboardChartsProps {
  jobStats: JobStats;
  applicationsData?: number[];
  galleryStats?: { 
    totalImages: number; 
    byCategory: Record<string, number>;
  };
  hrStats?: {
    totalHRs: number;
    activeHRs: number;
  };
}

export function DashboardCharts({ 
  jobStats, 
  applicationsData = [], 
  galleryStats = { 
    totalImages: 0, 
    byCategory: {} 
  },
  hrStats = {
    totalHRs: 0,
    activeHRs: 0
  }
}: DashboardChartsProps) {
  
  // Job statistics data for bar chart
  const jobStatsData = {
    labels: ['Total Jobs', 'Active Jobs', 'Applications', 'New Applications', 'Hired'],
    datasets: [
      {
        label: 'Count',
        data: [
          jobStats.totalJobs, 
          jobStats.activeJobs, 
          jobStats.applications, 
          jobStats.newApplications, 
          jobStats.hiredCandidates
        ],
        backgroundColor: [
          colors.blue.primary,
          colors.green.primary,
          colors.purple.primary,
          colors.orange.primary,
          colors.indigo.primary,
        ],
        borderColor: [
          colors.blue.primary,
          colors.green.primary,
          colors.purple.primary,
          colors.orange.primary,
          colors.indigo.primary,
        ],
        borderWidth: 1,
      },
    ],
  }

  // Applications trend data for line chart
  const applicationsTrendData = {
    // Generate last 7 months labels
    labels: applicationsData.length > 0 ? Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - i));
      return date.toLocaleString('default', { month: 'short' });
    }) : [],
    datasets: [
      {
        label: 'Applications',
        data: applicationsData,
        borderColor: colors.blue.primary,
        backgroundColor: colors.blue.background,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Gallery categories data for pie chart
  const galleryCategoriesData = {
    labels: Object.keys(galleryStats.byCategory).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        label: 'Images',
        data: Object.values(galleryStats.byCategory),
        backgroundColor: [
          colors.blue.primary,
          colors.green.primary,
          colors.red.primary,
          colors.purple.primary,
          colors.orange.primary,
        ],
        borderWidth: 1,
      },
    ],
  }

  // HR statistics data for doughnut chart
  const inactiveHRs = Math.max(0, hrStats.totalHRs - hrStats.activeHRs); // Ensure we don't get negative values
  const hrStatsData = {
    labels: ['Active HRs', 'Inactive HRs'],
    datasets: [
      {
        label: 'HRs',
        data: [hrStats.activeHRs, inactiveHRs],
        backgroundColor: [
          colors.green.primary,
          colors.red.primary,
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Job Statistics</CardTitle>
            <CardDescription>Overview of job and application metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={jobStatsData} options={options} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Applications Trend</CardTitle>
            <CardDescription>Monthly application submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={applicationsTrendData} options={options} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Gallery Categories</CardTitle>
            <CardDescription>Distribution of images by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie data={galleryCategoriesData} options={options} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">HR Team Status</CardTitle>
            <CardDescription>Active vs. inactive HR accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={hrStatsData} options={options} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 