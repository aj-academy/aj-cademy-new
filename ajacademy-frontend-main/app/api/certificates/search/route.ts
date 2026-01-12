import { NextRequest } from 'next/server'
import { forwardToBackend } from '../../backend-proxy'

export async function GET(request: NextRequest) {
  return forwardToBackend(request, '/api/certificates/search')
}
