"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { X, Plus, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { fetchAPI, api } from '@/lib/api-client'
import { hrToasts, showErrorToast } from "@/lib/toast-utils"

// Define the form schema with Zod
const formSchema = z.object({
  title: z.string().min(5, "Job title must be at least 5 characters"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.enum([
    "Full-time", 
    "Part-time", 
    "Contract", 
    "Internship", 
    "Remote"
  ], {
    required_error: "Please select an employment type",
  }),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.array(z.string()).min(1, "Add at least one requirement"),
  responsibilities: z.array(z.string()).min(1, "Add at least one responsibility"),
  salary: z.string().optional(),
  applicationDeadline: z.date().optional(),
  status: z.enum(["draft", "active", "closed", "filled"], {
    required_error: "Please select a status",
  }).default("active")
})

// Infer the type from the schema
type FormValues = z.infer<typeof formSchema>

// Define props for the component
interface JobFormProps {
  jobId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface Job {
  title: string;
  company: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: string;
  applicationDeadline: string;
  status: "draft" | "active" | "closed" | "filled";
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export default function JobForm({ jobId, onSuccess, onCancel }: JobFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [newRequirement, setNewRequirement] = useState("")
  const [newResponsibility, setNewResponsibility] = useState("")
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      employmentType: "Full-time",
      description: "",
      requirements: [],
      responsibilities: [],
      salary: "",
      status: "active"
    }
  })
  
  // Fetch job data if editing
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
    if (jobId) {
      setIsLoading(true)
      api.hr.getJobById(jobId)
        .then(response => {
          if (!response.error && response.data) {
            const job = response.data
            form.reset({
              title: job.title,
              company: job.company,
              location: job.location,
              employmentType: job.employmentType as "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote",
              description: job.description,
              requirements: job.requirements || [],
              responsibilities: job.responsibilities || [],
              salary: job.salary || "",
              applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline) : undefined,
              status: job.status as "draft" | "active" | "closed" | "filled"
            })
          }
        })
        .catch(err => {
          console.error("Error fetching job:", err)
          toast({
            title: "Error",
            description: "Failed to load job data",
            variant: "destructive"
          })
        })
        .finally(() => setIsLoading(false))
    }
  }, [jobId, form, toast])
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    try {
      // Convert Date object to ISO string for API
      const formattedData = {
        ...data,
        applicationDeadline: data.applicationDeadline ? data.applicationDeadline.toISOString() : undefined,
        // Add a default for applicationsCount if creating a new job
        applicationsCount: 0
      };
      
      const response = jobId 
        ? await api.hr.updateJob(jobId, formattedData)
        : await api.hr.createJob(formattedData);

      if (response.error) {
        throw new Error(response.error)
      }

      // Show success notification using our toast utilities
      if (jobId) {
        hrToasts.jobs.updated();
      } else {
        hrToasts.jobs.created();
      }
      
      onSuccess?.()
    } catch (error) {
      console.error("Error saving job:", error)
      showErrorToast(
        "Error Saving Job", 
        error instanceof Error ? error.message : "Failed to save job"
      )
    } finally {
      setIsLoading(false)
    }
  }
  
  // Add a new requirement to the list
  const addRequirement = () => {
    if (newRequirement.trim() === "") return
    
    const currentRequirements = form.getValues("requirements") || []
    form.setValue("requirements", [...currentRequirements, newRequirement.trim()])
    setNewRequirement("")
  }
  
  // Remove a requirement from the list
  const removeRequirement = (index: number) => {
    const currentRequirements = form.getValues("requirements") || []
    form.setValue("requirements", currentRequirements.filter((_, i) => i !== index))
  }
  
  // Add a new responsibility to the list
  const addResponsibility = () => {
    if (newResponsibility.trim() === "") return
    
    const currentResponsibilities = form.getValues("responsibilities") || []
    form.setValue("responsibilities", [...currentResponsibilities, newResponsibility.trim()])
    setNewResponsibility("")
  }
  
  // Remove a responsibility from the list
  const removeResponsibility = (index: number) => {
    const currentResponsibilities = form.getValues("responsibilities") || []
    form.setValue("responsibilities", currentResponsibilities.filter((_, i) => i !== index))
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Company */}
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. AJ Academy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Bangalore, India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Employment Type */}
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Salary */}
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ₹10-15 LPA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Application Deadline */}
          <FormField
            control={form.control}
            name="applicationDeadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Application Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="filled">Filled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the job role, responsibilities, and what you&apos;re looking for in a candidate..."
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Requirements */}
        <FormField
          control={form.control}
          name="requirements"
          render={() => (
            <FormItem>
              <FormLabel>Requirements *</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a requirement"
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRequirement()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addRequirement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {form.watch("requirements")?.map((requirement, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span className="text-sm">{requirement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        {/* Responsibilities */}
        <FormField
          control={form.control}
          name="responsibilities"
          render={() => (
            <FormItem>
              <FormLabel>Responsibilities *</FormLabel>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a responsibility"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addResponsibility()
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addResponsibility}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {form.watch("responsibilities")?.map((responsibility, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span className="text-sm">{responsibility}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResponsibility(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : jobId ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 