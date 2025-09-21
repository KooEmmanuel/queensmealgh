import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ISocialMetric extends Document {
  platform: string; // e.g., 'Instagram', 'TikTok', 'YouTube'
  metricType: string; // e.g., 'Followers', 'EngagementRate', 'Subscribers', 'TotalViews'
  value: number;
  lastUpdated: Date;
}

// We'll store each metric as a separate document, identified by platform and type.
// This allows flexibility if you want to add more platforms/metrics later.
const SocialMetricSchema: Schema = new Schema({
  platform: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for faster lookups
  },
  metricType: {
    type: String,
    required: true,
    trim: true,
    index: true, // Index for faster lookups
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  // Ensure unique combination of platform and metricType
  unique: [['platform', 'metricType']] 
});

// Ensure the unique index is created
SocialMetricSchema.index({ platform: 1, metricType: 1 }, { unique: true });

const SocialMetric: Model<ISocialMetric> = models.SocialMetric || mongoose.model<ISocialMetric>('SocialMetric', SocialMetricSchema);

export default SocialMetric; 