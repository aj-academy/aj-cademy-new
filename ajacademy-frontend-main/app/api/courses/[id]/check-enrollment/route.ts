import { forwardToBackend } from '../../../backend-proxy';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return forwardToBackend(request, `/api/courses/${params.id}/check-enrollment`);
} 