import mongoose, { Schema, Document } from 'mongoose';

export type ReportReason = 
  | 'false_information'
  | 'fake_request'
  | 'harassment'
  | 'commercial_solicitation'
  | 'impersonation'
  | 'spam'
  | 'other';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  reportedBy: mongoose.Types.ObjectId;
  targetType: 'donor_profile' | 'blood_request' | 'institution' | 'user';
  targetId: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reportedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    targetType: { 
      type: String, 
      enum: ['donor_profile', 'blood_request', 'institution', 'user'], 
      required: true,
      index: true 
    },
    targetId: { type: String, required: true, index: true },
    reason: { 
      type: String, 
      enum: [
        'false_information',
        'fake_request',
        'harassment',
        'commercial_solicitation',
        'impersonation',
        'spam',
        'other'
      ], 
      required: true 
    },
    description: { type: String, required: true, trim: true },
    status: { 
      type: String, 
      enum: ['pending', 'under_review', 'resolved', 'dismissed'], 
      default: 'pending',
      index: true 
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);

