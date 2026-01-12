import { MongoClient } from 'mongodb';

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aj-academy';

// Global variable to cache the MongoDB connection
let cachedClient: MongoClient | null = null;

/**
 * Connect to MongoDB and return the client
 */
export async function connectDB(): Promise<MongoClient> {
  // If we already have a connection, return it
  if (cachedClient) {
    return cachedClient;
  }

  // Otherwise, create a new connection
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Cache the client connection
    cachedClient = client;
    console.log('Connected to MongoDB');
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to database');
  }
}

/**
 * Close the MongoDB connection
 */
export async function closeDB(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    console.log('Disconnected from MongoDB');
  }
} 