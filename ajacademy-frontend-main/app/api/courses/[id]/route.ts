import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../backend-proxy';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToBackend(request, `/api/courses/${params.id}`);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToBackend(request, `/api/courses/${params.id}`);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return forwardToBackend(request, `/api/courses/${params.id}`);
} 