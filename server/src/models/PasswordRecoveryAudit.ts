import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordRecoveryAudit extends Document {
  _id: any;
  requestId: any;
  userId: any;
  userName: string;
  phone: string;
  issuedBy: any;
  issuedByName: string;
  issuerRole: string;
  action: 'REQUEST_SUBMITTED' | 'OTP_GENERATED' | 'LOGIN_USED' | 'REQUEST_REJECTED';
  reason?: string;
  notes?: string;
  createdAt: Date;
}

const PasswordRecoveryAuditSchema = new Schema<IPasswordRecoveryAudit>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    requestId: { type: Schema.Types.Mixed, required: true, index: true },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    issuedBy: { type: Schema.Types.Mixed, required: true },
    issuedByName: { type: String, required: true },
    issuerRole: { type: String, required: true },
    action: {
      type: String,
      enum: ['REQUEST_SUBMITTED', 'OTP_GENERATED', 'LOGIN_USED', 'REQUEST_REJECTED'],
      required: true
    },
    reason: { type: String },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

export const PasswordRecoveryAuditModel = mongoose.model<IPasswordRecoveryAudit>(
  'PasswordRecoveryAudit',
  PasswordRecoveryAuditSchema
);

