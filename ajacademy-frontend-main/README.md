# AJ Academy Frontend

This is the frontend for AJ Academy, a learning platform.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm ci
```

### Development

To start the development server:

```bash
npm run dev
```

### Building for Production

To build the project for production:

```bash
npm run build
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
```

## Deployment

This project can be deployed on Vercel by connecting your GitHub repository. 