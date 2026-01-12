"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api-client"
import { ClassicTemplate, type CertificateRenderData } from "@/components/certificates/ClassicTemplate"
import { downloadCertificate, type CertificateData } from "@/lib/certificate-download"

type Cert = {
  _id: string
  fullName: string
  phone: string
  email: string
  courseName: string
  completedDate: string
}

function CertificateView({ cert }: { cert: Cert }) {
  const data: CertificateRenderData = {
    recipientName: cert.fullName,
    courseName: cert.courseName,
    completionDate: cert.completedDate,
    certificateType: 'completion',
  }
  return <ClassicTemplate data={data} />
}

export default function CertificatesPage() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" })
  const [cert, setCert] = useState<Cert | null>(null)
  const [loading, setLoading] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCert(null)
    try {
      // Use direct fetch to our backend proxy
      const params = new URLSearchParams({ fullName: form.fullName, phone: form.phone, email: form.email })
      const res = await fetch(`/api/certificates/search?${params.toString()}`)
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Not found')
      setCert(data.data as Cert)
    } catch (err) {
      alert('Certificate not found. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (!cert) return
    
    try {
      const certificateData: CertificateData = {
        recipientName: cert.fullName,
        courseName: cert.courseName,
        completionDate: cert.completedDate,
        certificateType: 'completion',
      }
      
      await downloadCertificate(certificateData)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download certificate. Please try again.')
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Find Your Certificate</CardTitle>
          <CardDescription>Enter your details exactly as registered</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={search} className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {cert && (
        <div className="flex flex-col items-center gap-4">
          <div id="certificate">
            <CertificateView cert={cert} />
          </div>
          <Button onClick={downloadPdf}>Download PDF</Button>
        </div>
      )}
    </div>
  )
}


