import { NextResponse } from 'next/server';
import  { connectToDatabase } from '@/lib/mongodb';
// Remove the Mongoose model import
// import SocialMetric, { ISocialMetric } from '@/models/SocialMetric'; 
// Add authentication check if needed for admin routes

interface MetricInput {
  platform: string;
  metricType: string;
  value: number | string; // Accept string to handle empty inputs
}

// GET - Fetch all current metrics using native driver
export async function GET() {
  try {
    const { db } = await connectToDatabase(); // Get db object
    // Use db.collection().find() - ensure collection name matches ('socialMetrics' or 'socialmetrics')
    const metricsCursor = db.collection('socialmetrics').find({}).sort({ platform: 1, metricType: 1 });
    const metrics = await metricsCursor.toArray(); // Convert cursor to array
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching social metrics:", error);
    return NextResponse.json({ message: "Failed to fetch social metrics", error: (error as Error).message }, { status: 500 });
  }
}

// POST - Save or update multiple metrics using native driver
export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase(); // Get db object
    const body: MetricInput[] = await request.json();

    console.log("Received metrics payload:", JSON.stringify(body, null, 2)); // <-- ADD THIS LOG

    if (!Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid input format, expected an array of metrics." }, { status: 400 });
    }

    const operations = body.map(metric => {
      const numericValue = Number(metric.value);
      if (isNaN(numericValue)) {
        console.warn(`Skipping invalid value for ${metric.platform} - ${metric.metricType}: ${metric.value}`);
        return null;
      }
      
      const cleanPlatform = metric.platform.toLowerCase().trim();
      const cleanMetricType = metric.metricType.toLowerCase().trim();
      
      return {
        updateOne: {
          filter: { platform: cleanPlatform, metricType: cleanMetricType },
          update: {
            $set: {
              platform: metric.platform,
              metricType: metric.metricType,
              value: numericValue,
              lastUpdated: new Date(),
            },
          },
          upsert: true,
        },
      };
    }).filter(op => op !== null); 

    if (operations.length === 0) {
         return NextResponse.json({ message: "No valid metrics provided for update." }, { status: 400 });
    }

    // Use db.collection().bulkWrite() instead of SocialMetric.bulkWrite()
    // Ensure collection name matches ('socialMetrics' or 'socialmetrics')
    const result = await db.collection('socialmetrics').bulkWrite(operations as any); 

    return NextResponse.json({ message: "Social metrics updated successfully", result }, { status: 200 });

  } catch (error) {
    console.error("Error updating social metrics:", error);
    let errorMessage = "Failed to update social metrics";
    if (error instanceof Error) {
        errorMessage = error.message;
        // Check for native driver duplicate key error (code 11000)
        if ((error as any).code === 11000) {
             errorMessage = "Duplicate metric entry detected.";
        }
    }
    return NextResponse.json({ message: errorMessage, error: errorMessage }, { status: 500 });
  }
} 
