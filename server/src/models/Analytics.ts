import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEntry extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  videoTitle: string;
  platform: 'youtube' | 'reels' | 'shorts' | 'tiktok' | 'linkedin';
  hookType: 'question' | 'contrarian' | 'problem_solution' | 'story' | 'visual_shock' | 'numbers';
  views: number;
  watchTimeSeconds: number;
  avgWatchPercentage: number;
  engagementRate: number; // likes + comments + shares / views %
  shares: number;
  saves: number;
  retentionAt3s: number; // percentage hook retention
  date: Date;
  notes?: string;
  createdAt: Date;
}

const AnalyticsEntrySchema = new Schema<IAnalyticsEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    videoTitle: { type: String, required: true },
    platform: {
      type: String,
      enum: ['youtube', 'reels', 'shorts', 'tiktok', 'linkedin'],
      required: true,
      index: true,
    },
    hookType: {
      type: String,
      enum: ['question', 'contrarian', 'problem_solution', 'story', 'visual_shock', 'numbers'],
      required: true,
      index: true,
    },
    views: { type: Number, default: 0 },
    watchTimeSeconds: { type: Number, default: 0 },
    avgWatchPercentage: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    retentionAt3s: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export const AnalyticsEntry = mongoose.model<IAnalyticsEntry>('AnalyticsEntry', AnalyticsEntrySchema);
