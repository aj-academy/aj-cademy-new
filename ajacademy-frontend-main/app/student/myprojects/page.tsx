"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api-client"
import type { Project } from "@/lib/types"

export default function MyProjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({
    projectName: "",
    description: "",
    githubUrl: "",
    technologies: "",
    readmeUrl: "",
  })

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/student/login?returnUrl=/student/myprojects')
      return
    }
    const load = async () => {
      try {
        const res = await api.projects.listMine()
        if ((res as any).error) throw new Error((res as any).error)
        const maybe = (res as any)
        const list = Array.isArray(maybe?.data) ? maybe.data : (Array.isArray(maybe) ? maybe : [])
        setProjects(list as Project[])
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: "Failed to load your projects", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, toast])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectName || !form.description || !form.githubUrl) {
      toast({ title: "Missing fields", description: "Project name, description, and GitHub URL are required", variant: "destructive" })
      return
    }
    setCreating(true)
    try {
      const payload = {
        projectName: form.projectName,
        description: form.description,
        githubUrl: form.githubUrl,
        technologies: form.technologies,
        readmeUrl: form.readmeUrl || undefined,
      }
      const res = await api.projects.create(payload as any)
      if ((res as any).error) throw new Error((res as any).error)
      const created = ((res as any).data || res) as Project
      setProjects([created, ...projects])
      setForm({ projectName: "", description: "", githubUrl: "", technologies: "", readmeUrl: "" })
      toast({ title: "Project created", description: "Your project has been published" })
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">My Projects</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create a New Project</CardTitle>
          <CardDescription>Publish a project to showcase it publicly</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input id="projectName" value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="Awesome Portfolio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Briefly describe your project" className="min-h-[100px]" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/username/repo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="technologies">Technologies (comma separated)</Label>
              <Input id="technologies" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="readmeUrl">Project README URL (optional)</Label>
              <Input id="readmeUrl" value={form.readmeUrl} onChange={(e) => setForm({ ...form, readmeUrl: e.target.value })} placeholder="https://raw.githubusercontent.com/username/repo/main/README.md" />
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={creating}>{creating ? 'Publishing...' : 'Publish Project'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Published Projects</CardTitle>
          <CardDescription>Projects you have published</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not published any projects yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((p) => (
                <div key={p._id} className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
                  <div className="h-16 w-full bg-gradient-to-r from-blue-50 via-blue-100 to-white" />
                  <div className="-mt-6 px-5 pb-5">
                    <h3 className="font-semibold text-lg text-blue-900">{p.projectName}</h3>
                    <p className="text-sm text-blue-800/80 mt-1 line-clamp-3">{p.description}</p>
                  <div className="mt-2 text-sm">
                    <a href={p.githubUrl} className="text-blue-700 hover:text-blue-900" target="_blank" rel="noreferrer">GitHub</a>
                    {p.readmeUrl ? (
                      <>
                        <span className="mx-2">•</span>
                        <a href={p.readmeUrl} className="text-blue-700 hover:text-blue-900" target="_blank" rel="noreferrer">README</a>
                      </>
                    ) : null}
                  </div>
                  {p.technologies?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.technologies.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-b from-white to-blue-50 text-blue-800 border border-blue-200 shadow-sm">{t}</span>
                      ))}
                    </div>
                  ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


