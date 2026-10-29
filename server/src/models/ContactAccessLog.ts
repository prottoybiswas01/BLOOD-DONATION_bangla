import mongoose, { Schema, Document } from 'mongoose';

export interface IContactAccessLog extends Document {
  viewerId: mongoose.Types.ObjectId;
  donorUserId: mongoose.Types.ObjectId;
  donorProfileId: mongoose.Types.ObjectId;
  purpose: 'blood_request' | 'emergency_search' | 'direct_request';
  relatedBloodRequestId?: mongoose.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ContactAccessLogSchema = new Schema<IContactAccessLog>(
  {
    viewerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    donorUserId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    donorProfileId: { 
      type: Schema.Types.ObjectId, 
      ref: 'DonorProfile', 
      required: true 
    },
    purpose: { 
      type: String, 
      enum: ['blood_request', 'emergency_search', 'direct_request'], 
      default: 'emergency_search' 
    },
    relatedBloodRequestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Index to quickly count a viewer's access attempts in the past 24 hours
ContactAccessLogSchema.index({ viewerId: 1, createdAt: -1 });

export const ContactAccessLogModel = mongoose.model<IContactAccessLog>(
  'ContactAccessLog', 
  ContactAccessLogSchema
);

