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
    
    // Use aggregation to get only the latest record for each platform/metricType combination
    const pipeline = [
      {
        $sort: { platform: 1, metricType: 1, lastUpdated: -1 }
      },
      {
        $group: {
          _id: { 
            platform: { $toLower: "$platform" }, 
            metricType: { $toLower: "$metricType" } 
          },
          latestDoc: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestDoc" }
      },
      {
        $sort: { platform: 1, metricType: 1 }
      }
    ];
    
    const metrics = await db.collection('social_metrics').aggregate(pipeline).toArray();
    
    console.log("=== ADMIN API GET REQUEST ===");
    console.log("Fetched metrics count:", metrics.length);
    console.log("Fetched metrics:", JSON.stringify(metrics, null, 2));
    console.log("=== END ADMIN API GET ===");
    
    // Add cache control headers to prevent caching
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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

    console.log("=== ADMIN API POST REQUEST ===");
    console.log("Received metrics payload:", JSON.stringify(body, null, 2));
    console.log("Payload length:", body.length);

    if (!Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid input format, expected an array of metrics." }, { status: 400 });
    }

    const operations = body.map(metric => {
      const numericValue = Number(metric.value);
      if (isNaN(numericValue) || numericValue < 0) {
        console.warn(`Skipping invalid value for ${metric.platform} - ${metric.metricType}: ${metric.value}`);
        return null;
      }
      
      const cleanPlatform = metric.platform.toLowerCase().trim();
      const cleanMetricType = metric.metricType.toLowerCase().trim();
      
      return {
        updateOne: {
          filter: { 
            platform: cleanPlatform, 
            metricType: cleanMetricType
          },
          update: {
            $set: {
              platform: cleanPlatform,
              metricType: cleanMetricType,
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
    const result = await db.collection('social_metrics').bulkWrite(operations as any); 

    console.log("=== DATABASE OPERATION RESULT ===");
    console.log("Bulk write result:", JSON.stringify(result, null, 2));
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);
    
    // Fetch the updated data to verify it was saved
    const updatedMetrics = await db.collection('social_metrics').find({}).sort({ platform: 1, metricType: 1 }).toArray();
    console.log("Updated metrics after save:", JSON.stringify(updatedMetrics, null, 2));
    console.log("=== END DATABASE OPERATION ===");

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

// DELETE - Delete all records in the social_metrics collection
export async function DELETE() {
  try {
    const { db } = await connectToDatabase();
    
    console.log("=== DELETE ALL SOCIAL METRICS ===");
    
    // Count existing records before deletion
    const countBefore = await db.collection('social_metrics').countDocuments();
    console.log(`Records before deletion: ${countBefore}`);
    
    // Delete all records in the collection
    const deleteResult = await db.collection('social_metrics').deleteMany({});
    
    console.log(`Deleted ${deleteResult.deletedCount} records`);
    console.log("=== END DELETE ALL ===");
    
    return NextResponse.json({ 
      message: `All social metrics deleted successfully. Removed ${deleteResult.deletedCount} records.`,
      deletedCount: deleteResult.deletedCount 
    });
    
  } catch (error) {
    console.error("Error deleting all social metrics:", error);
    return NextResponse.json({ 
      message: "Failed to delete all social metrics", 
      error: (error as Error).message 
    }, { status: 500 });
  }
} 
