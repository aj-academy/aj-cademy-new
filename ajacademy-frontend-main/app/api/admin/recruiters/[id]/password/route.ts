import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../../../backend-proxy';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/admin/recruiters/${id}/password`);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/admin/recruiters/${id}/password`);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/admin/recruiters/${id}/password`);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/admin/recruiters/${id}/password`);
}
