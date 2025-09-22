import mongoose, { Document, Schema } from 'mongoose';

export interface IPricingSubscription extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageType: 'weekly' | 'monthly';
  status: 'pending' | 'active' | 'cancelled' | 'completed';
  startDate: Date;
  endDate?: Date;
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSubscriptionSchema = new Schema<IPricingSubscription>({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  packageType: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'completed'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'GHC'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
PricingSubscriptionSchema.index({ customerEmail: 1 });
PricingSubscriptionSchema.index({ status: 1 });
PricingSubscriptionSchema.index({ packageType: 1 });
PricingSubscriptionSchema.index({ createdAt: -1 });

export default mongoose.models.PricingSubscription || mongoose.model<IPricingSubscription>('PricingSubscription', PricingSubscriptionSchema);