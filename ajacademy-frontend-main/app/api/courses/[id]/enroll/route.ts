import { NextRequest } from 'next/server';
import { forwardToBackend } from '../../../backend-proxy';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return forwardToBackend(request, `/api/courses/${params.id}/enroll`);
} 