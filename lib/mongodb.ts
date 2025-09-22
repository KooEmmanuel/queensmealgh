import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'queensmealgh';

// Check if MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new connection with a timeout
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000, // 10 second timeout
    });

    await client.connect();
    const db = client.db(MONGODB_DB);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Add a ping function to test the connection
export async function pingDatabase() {
  try {
    const { client, db } = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log("MongoDB connection is alive");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // Reset the cached connection
    cachedClient = null;
    cachedDb = null;
    return false;
  }
} 