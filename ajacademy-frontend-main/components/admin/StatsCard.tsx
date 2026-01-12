import { ReactNode } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { cva, type VariantProps } from "class-variance-authority"

// Define variants for stats cards
const statsCardVariants = cva("rounded-md p-1", {
  variants: {
    variant: {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      green: "bg-green-100 text-green-700 border-green-200",
      red: "bg-red-100 text-red-700 border-red-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
  },
  defaultVariants: {
    variant: "blue",
  },
})

export interface StatsCardProps extends VariantProps<typeof statsCardVariants> {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant, 
  className 
}: StatsCardProps) {
  return (
    <Card className="shadow-sm overflow-hidden border">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {trend && (
              <div className="flex items-center mt-1">
                {trend.isPositive ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span className={`text-xs ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend.value)}% {trend.isPositive ? 'increase' : 'decrease'}
                </span>
              </div>
            )}
          </div>
          
          <div className={`${statsCardVariants({ variant })} p-3 rounded-full h-12 w-12 flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 