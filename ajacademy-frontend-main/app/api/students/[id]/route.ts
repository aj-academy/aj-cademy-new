import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../backend-proxy';

interface Params {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/students/${id}`);
}

export async function POST(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/students/${id}`);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/students/${id}`);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  return forwardToBackend(request, `/api/students/${id}`);
}
