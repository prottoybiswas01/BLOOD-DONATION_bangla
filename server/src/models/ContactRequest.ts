import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup, BLOOD_GROUPS } from '../data/bangladeshLocations.js';

export type ContactRequestStatus = 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';

export interface IContactRequest extends Document {
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  requesterPhone: string;
  institutionId: mongoose.Types.ObjectId;
  targetBloodGroup: BloodGroup;
  patientName: string;
  hospitalName: string;
  unitsRequired: number;
  urgency: 'emergency' | 'urgent' | 'standard';
  reason: string;
  status: ContactRequestStatus;
  assignedModeratorId?: mongoose.Types.ObjectId;
  moderatorNotes?: string;
  handledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requesterName: { type: String, required: true },
    requesterPhone: { type: String, required: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    targetBloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    patientName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    unitsRequired: { type: Number, default: 1, min: 1 },
    urgency: { type: String, enum: ['emergency', 'urgent', 'standard'], default: 'emergency' },
    reason: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'in_progress', 'fulfilled', 'cancelled'], 
      default: 'pending',
      index: true
    },
    assignedModeratorId: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatorNotes: { type: String, trim: true },
    handledAt: { type: Date }
  },
  {
    timestamps: true
  }
);

ContactRequestSchema.index({ institutionId: 1, status: 1 });

export const ContactRequestModel = mongoose.model<IContactRequest>(
  'ContactRequest',
  ContactRequestSchema
);

