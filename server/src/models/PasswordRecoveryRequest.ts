import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './User.js';

export type PasswordRecoveryStatus = 'pending' | 'approved' | 'rejected' | 'used' | 'expired';

export interface IPasswordRecoveryRequest extends Document {
  _id: any;
  userId: any;
  userName: string;
  phone: string;
  userRole: UserRole;
  division: string;
  district: string;
  institutionId?: any;
  institutionName?: string;
  status: PasswordRecoveryStatus;
  reason?: string;
  temporaryPasswordHash?: string;
  expiresAt?: Date;
  isUsed: boolean;
  approvedBy?: any;
  approvedByName?: string;
  approvedByRole?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordRecoveryRequestSchema = new Schema<IPasswordRecoveryRequest>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    userRole: { type: String, required: true },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true },
    institutionId: { type: Schema.Types.Mixed, index: true },
    institutionName: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'used', 'expired'],
      default: 'pending',
      index: true
    },
    reason: { type: String },
    temporaryPasswordHash: { type: String },
    expiresAt: { type: Date },
    isUsed: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.Mixed },
    approvedByName: { type: String },
    approvedByRole: { type: String },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  {
    timestamps: true
  }
);

export const PasswordRecoveryRequestModel = mongoose.model<IPasswordRecoveryRequest>(
  'PasswordRecoveryRequest',
  PasswordRecoveryRequestSchema
);

