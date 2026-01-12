import { fetchAPI } from '@/lib/api-client'
import { Job } from '@/lib/types'

interface APIResponse<T> {
  data: T;
  error?: string;
}

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  try {
    const response = await fetchAPI<APIResponse<Job>>(`/jobs/${params.id}`)

    if (response.error) {
      throw new Error(response.error)
    }

    const job = response.data

    return (
      <div>
        {/* Render your job details component here */}
      </div>
    )
  } catch (error) {
    return (
      <div>
        {/* Render an error message here */}
      </div>
    )
  }
} 