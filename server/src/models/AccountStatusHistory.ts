import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountStatusHistory extends Document {
  userId: mongoose.Types.ObjectId;
  targetUserName: string;
  targetUserPhone: string;
  oldStatus: string;
  newStatus: string;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  reason: string;
  expiryDate?: Date;
  createdAt: Date;
}

const AccountStatusHistorySchema = new Schema<IAccountStatusHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetUserName: { type: String, required: true },
    targetUserPhone: { type: String, required: true },
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

