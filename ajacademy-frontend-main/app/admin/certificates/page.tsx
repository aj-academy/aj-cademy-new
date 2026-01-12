"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, UserPlus } from "lucide-react"

type Cert = {
  _id: string
  fullName: string
  phone: string
  email: string
  courseName: string
  completedDate: string
}

export default function AdminCertificatesPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [items, setItems] = useState<Cert[]>([])
  const [manualForm, setManualForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    courseName: '',
    completedDate: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminAuth') || localStorage.getItem('token')
    // basic presence check; real guard can be added
    if (!token) {
      router.push('/admin')
      return
    }
    load()
  }, [router])

  const load = async () => {
    try {
      const res = await fetch('/api/certificates', { headers: { 'Authorization': `Bearer ${getAdminToken()}` } })
      const data = await res.json()
      if (res.ok && data?.success) setItems(data.data)
    } catch {}
  }

  const getAdminToken = (): string => {
    try {
      const s = localStorage.getItem('adminAuth')
      if (s) { const a = JSON.parse(s); return a.token || '' }
    } catch {}
    return localStorage.getItem('token') || ''
  }

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/certificates/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload failed')
      await load()
      alert(`Uploaded ${data.count} certificates`)
      setFile(null)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const onManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manualForm),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Submission failed')
      await load()
      alert('Certificate added successfully')
      setManualForm({
        fullName: '',
        phone: '',
        email: '',
        courseName: '',
        completedDate: ''
      })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/certificate-template.xlsx'
    link.download = 'certificate-template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Certificate Management</CardTitle>
          <CardDescription>Add certificates via Excel upload or manual entry</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Excel Upload
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Excel/CSV Upload
                  </CardTitle>
                  <CardDescription>
                    Upload Excel/CSV with columns: Fullname, phone, email, coursename, completed date
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={downloadTemplate}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Download the Excel template to see the required format
                    </span>
                  </div>
                  
                  <form onSubmit={onUpload} className="flex items-end gap-4">
                    <div className="grid gap-2 flex-1">
                      <Label>Excel/CSV file</Label>
                      <Input 
                        type="file" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)} 
                      />
                    </div>
                    <Button type="submit" disabled={uploading || !file}>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Manual Certificate Entry
                  </CardTitle>
                  <CardDescription>
                    Add individual certificates manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onManualSubmit} className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={manualForm.fullName}
                        onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                        required
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                        required
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualForm.email}
                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="courseName">Course Name *</Label>
                      <Input
                        id="courseName"
                        value={manualForm.courseName}
                        onChange={(e) => setManualForm({ ...manualForm, courseName: e.target.value })}
                        required
                        placeholder="Enter course name"
                      />
                    </div>
                    
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="completedDate">Completion Date *</Label>
                      <Input
                        id="completedDate"
                        type="date"
                        value={manualForm.completedDate}
                        onChange={(e) => setManualForm({ ...manualForm, completedDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Button type="submit" disabled={submitting}>
                        {submitting ? 'Adding Certificate...' : 'Add Certificate'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Certificates</CardTitle>
          <CardDescription>Showing up to 200 most recent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-50 text-blue-900">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Course</th>
                  <th className="text-left p-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-b">
                    <td className="p-2">{c.fullName}</td>
                    <td className="p-2">{c.phone}</td>
                    <td className="p-2">{c.email}</td>
                    <td className="p-2">{c.courseName}</td>
                    <td className="p-2">{new Date(c.completedDate).toLocaleDateString()}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="p-2 text-muted-foreground" colSpan={5}>No certificates yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


