import mongoose, { Schema, Document } from 'mongoose';

export interface IContactAccessLog extends Document {
  _id: any;
  viewerId: any;
  donorUserId: any;
  donorProfileId: any;
  purpose: 'blood_request' | 'emergency_search' | 'direct_request';
  relatedBloodRequestId?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ContactAccessLogSchema = new Schema<IContactAccessLog>(
  {
    _id: { type: String },
    viewerId: { 
      type: Schema.Types.Mixed, 
      required: true, 
      index: true 
    },
    donorUserId: { 
      type: Schema.Types.Mixed, 
      required: true, 
      index: true 
    },
    donorProfileId: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    purpose: { 
      type: String, 
      enum: ['blood_request', 'emergency_search', 'direct_request'], 
      default: 'emergency_search' 
    },
    relatedBloodRequestId: { type: Schema.Types.Mixed },
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

