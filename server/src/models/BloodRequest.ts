import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup, BLOOD_GROUPS } from '../data/bangladeshLocations.js';

export type RequestStatus = 
  | 'pending_verification'
  | 'open'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'cancelled'
  | 'expired'
  | 'rejected';

export type UrgencyLevel = 'emergency' | 'urgent' | 'standard';

export interface IBloodRequest extends Document {
  _id: any;
  requesterId: any;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  hospitalName: string;
  hospitalAddress: string;
  division: string;
  district: string;
  upazila: string;
  requiredDate: Date;
  requiredWithin?: string;
  urgencyLevel: UrgencyLevel;
  reason: string;
  contactNumber: string;
  alternativeContactNumber?: string;
  status: RequestStatus;
  moderationNotes?: string;
  institutionId?: any;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema = new Schema<IBloodRequest>(
  {
    _id: { type: String },
    requesterId: { 
      type: Schema.Types.Mixed, 
      required: true,
      index: true 
    },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { 
      type: String, 
      enum: BLOOD_GROUPS, 
      required: true, 
      index: true 
    },
    unitsRequired: { type: Number, required: true, min: 1, default: 1 },
    unitsFulfilled: { type: Number, default: 0, min: 0 },
    hospitalName: { type: String, required: true, trim: true },
    hospitalAddress: { type: String, required: true, trim: true },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    upazila: { type: String, required: true, index: true },
    requiredDate: { type: Date, required: true, index: true },
    requiredWithin: { type: String },
    urgencyLevel: { 
      type: String, 
      enum: ['emergency', 'urgent', 'standard'], 
      default: 'emergency',
      index: true 
    },
    reason: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    alternativeContactNumber: { type: String, trim: true },
    status: { 
      type: String, 
      enum: [
        'pending_verification', 
        'open', 
        'partially_fulfilled', 
        'fulfilled', 
        'cancelled', 
        'expired', 
        'rejected'
      ], 
      default: 'open',
      index: true 
    },
    moderationNotes: { type: String, trim: true },
    institutionId: { type: Schema.Types.Mixed, index: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  {
    timestamps: true
  }
);

BloodRequestSchema.index({ status: 1, requiredDate: -1 });
BloodRequestSchema.index({ division: 1, status: 1 });

export const BloodRequestModel = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);

