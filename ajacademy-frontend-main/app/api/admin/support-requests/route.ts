import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../backend-proxy';

export async function GET(request: Request) {
  return forwardToBackend(request, '/api/admin/support-requests');
}

