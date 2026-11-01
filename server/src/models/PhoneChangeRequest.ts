import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoneChangeRequest extends Document {
  _id: any;
  userId: any;
  userName: string;
  userRole: string;
  currentPhone: string;
  newPhone: string;
  reason: string;
  division?: string;
  district?: string;
  institutionId?: string;
  institutionName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: any;
  reviewedByName?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneChangeRequestSchema = new Schema<IPhoneChangeRequest>(
  {
    _id: { type: String },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    currentPhone: { type: String, required: true },
    newPhone: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    division: { type: String },
    district: { type: String },
    institutionId: { type: String },
    institutionName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: Schema.Types.Mixed },
    reviewedByName: { type: String },
    reviewedAt: { type: Date },
    reviewNotes: { type: String }
  },
  {
    timestamps: true
  }
);

PhoneChangeRequestSchema.index({ status: 1, createdAt: -1 });
PhoneChangeRequestSchema.index({ division: 1, status: 1 });
PhoneChangeRequestSchema.index({ institutionId: 1, status: 1 });

export const PhoneChangeRequestModel = mongoose.model<IPhoneChangeRequest>(
  'PhoneChangeRequest',
  PhoneChangeRequestSchema
);
