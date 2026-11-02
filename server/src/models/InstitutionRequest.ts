import mongoose, { Schema, Document } from 'mongoose';

export type InstitutionRequestStatus = 
  | 'pending_review' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'suspended';

export interface IInstitutionRequest extends Document {
  _id: any;
  name: string;
  nameBn: string;
  code: string;
  type: 'university' | 'college' | 'school' | 'medical_college' | 'polytechnic' | 'other';
  division: string;
  district: string;
  upazila: string;
  address: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  applicantRole?: string;
  supportingDetails?: string;
  status: InstitutionRequestStatus;
  reviewedBy?: any;
  decisionReason?: string;
  reviewedAt?: Date;
  createdInstitutionId?: any;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionRequestSchema = new Schema<IInstitutionRequest>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: { 
      type: String, 
      enum: ['university', 'college', 'school', 'medical_college', 'polytechnic', 'other'],
      default: 'university'
    },
    division: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    upazila: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    applicantName: { type: String, required: true, trim: true },
    applicantPhone: { type: String, required: true, trim: true },
    applicantEmail: { type: String, trim: true },
    applicantRole: { type: String, trim: true },
    supportingDetails: { type: String, trim: true },
    status: { 
      type: String, 
      enum: ['pending_review', 'under_review', 'approved', 'rejected', 'suspended'],
      default: 'pending_review',
      index: true
    },
    reviewedBy: { type: Schema.Types.Mixed },
    decisionReason: { type: String, trim: true },
    reviewedAt: { type: Date },
    createdInstitutionId: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

InstitutionRequestSchema.index({ division: 1, status: 1 });

export const InstitutionRequestModel = mongoose.model<IInstitutionRequest>(
  'InstitutionRequest',
  InstitutionRequestSchema
);

