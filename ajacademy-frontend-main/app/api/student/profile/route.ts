import { NextRequest, NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/backend-proxy";

export async function GET(request: NextRequest) {
  return forwardToBackend(request, '/api/student/profile');
}

export async function PUT(request: NextRequest) {
  return forwardToBackend(request, '/api/student/profile');
} 