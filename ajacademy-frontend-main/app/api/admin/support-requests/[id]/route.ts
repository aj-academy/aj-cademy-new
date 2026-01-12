import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../../backend-proxy';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return forwardToBackend(request, `/api/admin/support-requests/${id}`);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return forwardToBackend(request, `/api/admin/support-requests/${id}/status`);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return forwardToBackend(request, `/api/admin/support-requests/${id}`);
}

