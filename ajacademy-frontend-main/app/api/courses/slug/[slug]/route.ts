import { forwardToBackend } from '../../../backend-proxy';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  return forwardToBackend(request, `/api/courses/slug/${params.slug}`);
}


