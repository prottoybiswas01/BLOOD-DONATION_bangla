import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountStatusHistory extends Document {
  _id: any;
  userId: any;
  targetUserName: string;
  targetUserPhone: string;
  oldStatus: string;
  newStatus: string;
  actorId: any;
  actorName: string;
  actorRole: string;
  reason: string;
  expiryDate?: Date;
  createdAt: Date;
}

const AccountStatusHistorySchema = new Schema<IAccountStatusHistory>(
  {
    _id: { type: String },
    userId: { type: Schema.Types.Mixed, required: true, index: true },
    targetUserName: { type: String, required: true },
    targetUserPhone: { type: String, required: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true, index: true },
    actorId: { type: Schema.Types.Mixed, required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    expiryDate: { type: Date }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

AccountStatusHistorySchema.index({ userId: 1, createdAt: -1 });

export const AccountStatusHistoryModel = mongoose.model<IAccountStatusHistory>(
  'AccountStatusHistory',
  AccountStatusHistorySchema
);

