import mongoose, { Document, Schema, Types } from 'mongoose';
import crypto from 'crypto';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED';

export interface IInvitation extends Document {
  project: Types.ObjectId;
  inviter: Types.ObjectId;
  inviteeEmail: string;
  role: 'EDITOR' | 'VIEWER';
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['EDITOR', 'VIEWER'],
      default: 'EDITOR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REVOKED'],
      default: 'PENDING',
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
