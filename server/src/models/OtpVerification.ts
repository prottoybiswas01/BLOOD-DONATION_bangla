import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  purpose: 'registration' | 'login' | 'reset_password';
  createdAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    phone: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    isUsed: { type: Boolean, default: false },
    purpose: { 
      type: String, 
      enum: ['registration', 'login', 'reset_password'], 
      default: 'registration' 
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// TTL index to automatically purge expired OTP documents after 10 minutes
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

export const OtpVerificationModel = mongoose.model<IOtpVerification>(
  'OtpVerification', 
  OtpVerificationSchema
);
