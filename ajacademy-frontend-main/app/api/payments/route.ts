import { NextResponse } from 'next/server';
import { forwardToBackend } from '../backend-proxy';


export async function GET(request: Request) {
  return forwardToBackend(request, `/api/payments`);
}

export async function POST(request: Request) {
  return forwardToBackend(request, `/api/payments`);
}

export async function PUT(request: Request) {
  return forwardToBackend(request, `/api/payments`);
}

export async function DELETE(request: Request) {
  return forwardToBackend(request, `/api/payments`);
}
