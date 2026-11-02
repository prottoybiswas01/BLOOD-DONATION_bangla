import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './User.js';

export type InstitutionChangeStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface IInstitutionChangeRequest extends Document {
  _id: any;
  userId: any;
  userName: string;
  phone: string;
  userRole: UserRole;
  currentInstitutionId?: any;
  currentInstitutionName?: string;
  targetInstitutionId: any;
  targetInstitutionName: string;
  division: string;
  district: string;
  studentOrStaffId?: string;
  department?: string;
  reason?: string;
  status: InstitutionChangeStatus;
  reviewedBy?: any;
  reviewedByName?: string;
  decisionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionChangeRequestSchema = new Schema<IInstitutionChangeRequest>(
  {
    _id: { type: String },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    userRole: { type: String, required: true },
    currentInstitutionId: { type: Schema.Types.Mixed },
    currentInstitutionName: { type: String },
    targetInstitutionId: { type: Schema.Types.Mixed, required: true, index: true },
    targetInstitutionName: { type: String, required: true },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true },
    studentOrStaffId: { type: String },
    department: { type: String },
    reason: { type: String },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: Schema.Types.Mixed },
    reviewedByName: { type: String },
    decisionReason: { type: String }
  },
  {
    timestamps: true
  }
);

export const InstitutionChangeRequestModel = mongoose.model<IInstitutionChangeRequest>(
  'InstitutionChangeRequest',
  InstitutionChangeRequestSchema
);

