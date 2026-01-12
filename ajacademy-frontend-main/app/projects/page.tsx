"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Code2, CalendarClock, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Project } from "@/lib/types";
import { motion } from "framer-motion";

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.projects.listPublic();
        const r: any = res;
        const list = Array.isArray(r?.data?.data)
          ? r.data.data
          : Array.isArray(r?.data)
          ? r.data
          : Array.isArray(r)
          ? r
          : [];
        setProjects(list as Project[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso?: string): string => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const toExternal = (url?: string): string => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white">
      {/* What Our Students Build Section */}
      <section className="w-full py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-70"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-20 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div 
            className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Student Showcase
            </motion.div>
            <motion.h2 
              className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl text-blue-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Students Build
              </span>
            </motion.h2>
            <motion.p 
              className="max-w-[900px] text-blue-700/90 md:text-lg lg:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Showcase your projects, share your code, and inspire others. Build your portfolio and get recognized for your work.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Projects Grid Section */}
      <div className="container mx-auto px-4 md:px-6 pb-12 max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Showcase</CardTitle>
            <CardDescription>Explore projects published by our students</CardDescription>
          </CardHeader>
          <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects have been published yet.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="group rounded-2xl border border-blue-100 bg-white shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="h-14 w-full bg-gradient-to-r from-blue-50 via-blue-100 to-white" />
                  <div className="-mt-10 px-5 pb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md translate-y-[-4px]">
                          <Code2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-lg text-blue-900 translate-y-[-3px]">{p.projectName}</h3>
                      </div>
                      {/* empty right to keep spacing */}
                      <div />
                    </div>

                    <p className="text-sm text-blue-800/80 mt-3 line-clamp-3">{p.description}</p>

                    {p.technologies?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-b from-white to-blue-50 text-blue-800 border border-blue-200 shadow-sm"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center gap-2 text-xs text-blue-900/70">
                      <CalendarClock className="h-4 w-4" />
                      <span>Created {formatDate((p as any).createdAt)}</span>
                    </div>

                    {/* Actions footer */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={toExternal(p.githubUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 text-sm shadow-sm"
                        title="Open GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                      </a>
                      {p.readmeUrl ? (
                        <a
                          href={toExternal(p.readmeUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 text-sm shadow-sm"
                          title="Open README"
                        >
                          <ExternalLink className="h-4 w-4" />
                          README
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

