import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
// Ensure no Mongoose model is imported here
// import SocialMetric from '@/models/SocialMetric'; 

// GET - Fetch all current metrics for public display
export async function GET() {
  try {
    const { db } = await connectToDatabase(); // Get db object
    // Use db.collection().find() - ensure collection name matches ('socialMetrics' or 'socialmetrics')
    const metricsCursor = db.collection('social_metrics').find({})
      // Note: .select() is a Mongoose helper, use .project() with native driver
      .project({ platform: 1, metricType: 1, value: 1, _id: 0 }) 
      .sort({ platform: 1, metricType: 1 });
      
    const metrics = await metricsCursor.toArray(); // Convert cursor to array
    
    console.log("=== PUBLIC SOCIAL METRICS API ===");
    console.log("Raw metrics from DB:", JSON.stringify(metrics, null, 2));

    // Structure the data for easier frontend consumption
    const structuredMetrics: { [platform: string]: { [metricType: string]: number } } = {};
    metrics.forEach((metric: any) => { // Use 'any' or define a simple interface here
      // Normalize platform names to match frontend expectations
      const normalizedPlatform = metric.platform.charAt(0).toUpperCase() + metric.platform.slice(1).toLowerCase();
      const normalizedMetricType = metric.metricType.charAt(0).toUpperCase() + metric.metricType.slice(1).toLowerCase();
      
      if (!structuredMetrics[normalizedPlatform]) {
        structuredMetrics[normalizedPlatform] = {};
      }
      structuredMetrics[normalizedPlatform][normalizedMetricType] = metric.value;
    });
    
    console.log("Structured metrics for frontend:", JSON.stringify(structuredMetrics, null, 2));
    console.log("=== END PUBLIC SOCIAL METRICS API ===");

    return NextResponse.json(structuredMetrics);
  } catch (error) {
    console.error("Error fetching public social metrics:", error);
    // Avoid exposing detailed errors publicly
    return NextResponse.json({ message: "Could not retrieve social metrics" }, { status: 500 });
  }
}

// Optional: Add revalidation logic if using ISR
export const revalidate = 600; // Revalidate data every 10 minutes (adjust as needed) 