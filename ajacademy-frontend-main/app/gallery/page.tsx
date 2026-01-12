"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface GalleryItem {
  _id: string
  title: string
  description: string
  category: string
  featured?: boolean
  isGoogleDriveImage?: boolean
  googleDriveId?: string
  image?: string
  imageUrl?: string
}

/** ✅ SINGLE SOURCE OF TRUTH FOR IMAGE URL */
function getGalleryImageSrc(item: GalleryItem): string {
  // Best case: Google Drive ID
  if (item?.googleDriveId) {
    return `https://lh3.googleusercontent.com/d/${item.googleDriveId}`
  }

  // Extract ID from preview URL (fallback)
  if (item?.imageUrl?.includes("drive.google.com")) {
    const match = item.imageUrl.match(/\/d\/([^/]+)/)
    if (match?.[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`
    }
  }

  // Raw image field contains ID
  if (item?.image && /^[a-zA-Z0-9_-]{25,}$/.test(item.image)) {
    return `https://lh3.googleusercontent.com/d/${item.image}`
  }

  return "/placeholder.svg"
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load gallery")
        const data = await res.json()
        setItems(data.items || [])
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [])

  return (
    <>
      <Head>
        <title>Gallery | AJ Academy</title>
      </Head>

      <div className="min-h-screen bg-blue-950 p-6">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          AJ Academy Gallery
        </h1>

        {loading && (
          <p className="text-center text-blue-300">Loading gallery…</p>
        )}

        {error && (
          <p className="text-center text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-blue-900 rounded-lg overflow-hidden border border-blue-800 hover:scale-[1.02] transition"
              >
                <div className="aspect-[4/3] bg-black">
                  <img
                    src={getGalleryImageSrc(item)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Available")
                    }
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-white font-semibold truncate">
                    {item.title}
                  </h3>
                  <p className="text-blue-300 text-sm line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <Badge className="bg-indigo-600">
                      {item.category}
                    </Badge>

                    {item.featured && (
                      <Badge className="bg-yellow-600">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full text-blue-200 border-blue-700"
                    onClick={() =>
                      window.open(getGalleryImageSrc(item), "_blank")
                    }
                  >
                    View Image
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
