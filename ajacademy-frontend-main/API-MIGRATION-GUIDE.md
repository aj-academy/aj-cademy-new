# API Migration Guide

## Overview

This guide outlines the process for migrating the frontend API routes from direct database access to using the backend API. This architectural change will:

1. Remove direct database dependencies from the frontend
2. Improve security by centralizing all database operations in the backend
3. Simplify deployment by reducing build dependencies
4. Fix issues with native modules like bcrypt causing build failures

## Steps for Migration

### 1. Remove Database Dependencies

The following dependencies have been removed from package.json:

- `mongoose`
- `bcrypt`
- `bcryptjs`
- And their corresponding type definitions

### 2. Replace Models with Type Definitions

Database models have been converted to simple TypeScript interfaces that only define types without including database logic:

```typescript
// Before:
import mongoose, { Document, Schema, Model } from 'mongoose';
import { hash, compare } from 'bcryptjs';

const StudentSchema = new Schema<StudentDocument, StudentModel>({ ... });

// After:
export interface StudentData {
  id?: string;
  name: string;
  email: string;
  // other fields...
}
```

### 3. Use the Existing Backend Proxy

The codebase already has a backend-proxy mechanism in place (`app/api/backend-proxy.ts`). 
This should be used instead of direct database access:

```typescript
import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../../backend-proxy';

export async function POST(request: Request) {
  return forwardToBackend(request, '/api/auth/students/login');
}
```

The `forwardToBackend` function forwards requests to the backend API, handles errors, and returns appropriate responses.

### 4. For Complex Logic: Use the API Client

For complex operations or when you need to enrich/transform data, you can use the API client in `lib/api-client.ts`:

```typescript
import apiClient from '@/lib/api-client';

// Example usage:
const response = await apiClient.students.getProfile(studentId, token);
```

### 5. Convert API Routes

API routes should be updated to use either the backend proxy or API client instead of accessing the database directly:

**Before:**
```typescript
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Student from '@/lib/models/student';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    // Database operations...
    const student = await Student.create(data);
    
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

**After (using backend proxy):**
```typescript
import { NextResponse } from 'next/server';
import { forwardToBackend } from '../../../backend-proxy';

export async function POST(request: Request) {
  return forwardToBackend(request, '/api/students');
}
```

**After (using API client):**
```typescript
import { NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Call the backend API
    const response = await apiClient.students.createStudent(data);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
```

## Example Implementations

The following routes have been converted as examples:

1. `app/api/auth/students/signup/route.ts` - Student signup (using API client)
2. `app/api/auth/students/login/route.ts` - Student login (using backend proxy)

## Environment Configuration

Make sure your environment variables are properly set:

```
# Frontend environment variables
NEXT_PUBLIC_API_URL=https://api.ajacademy.co.in/api
NEXT_PUBLIC_BACKEND_URL=https://api.ajacademy.co.in
BACKEND_API_URL=https://api.ajacademy.co.in
```

This way, your frontend will communicate with the backend API instead of trying to connect directly to the database. 