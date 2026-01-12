import { NextResponse } from 'next/server';
import { forwardToBackend } from '../backend-proxy';

export async function POST(request: Request) {
  return forwardToBackend(request, '/api/support');
}

