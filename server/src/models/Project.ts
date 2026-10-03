import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: 'idea' | 'scripting' | 'recording' | 'editing' | 'ready' | 'published';
  targetPlatform: 'reels' | 'shorts' | 'tiktok' | 'youtube' | 'linkedin';
  aspectRatio: '9:16' | '16:9' | '1:1';
  currentDraft: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['idea', 'scripting', 'recording', 'editing', 'ready', 'published'],
      default: 'idea',
      index: true,
    },
    targetPlatform: {
      type: String,
      enum: ['reels', 'shorts', 'tiktok', 'youtube', 'linkedin'],
      default: 'reels',
    },
    aspectRatio: {
      type: String,
      enum: ['9:16', '16:9', '1:1'],
      default: '9:16',
    },
    currentDraft: { type: Number, default: 1 },
    thumbnailUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
