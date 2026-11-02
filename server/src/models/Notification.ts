import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  _id: any;
  userId: any;
  title: string;
  message: string;
  type: 'request_match' | 'contact_revealed' | 'status_update' | 'institution_update' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { 
      type: Schema.Types.Mixed, 
      required: true,
      index: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['request_match', 'contact_revealed', 'status_update', 'institution_update', 'system'], 
      default: 'system' 
    },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);

