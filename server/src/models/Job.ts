import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'footage_analysis' | 'clip_proposal' | 'auto_draft' | 'render_export' | 'platform_adaptation';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 - 100
  currentStepMessage: string;
  resultPayload?: any;
  errorMessage?: string;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['footage_analysis', 'clip_proposal', 'auto_draft', 'render_export', 'platform_adaptation'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    progress: { type: Number, default: 0 },
    currentStepMessage: { type: String, default: 'Task queued...' },
    resultPayload: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    retries: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
