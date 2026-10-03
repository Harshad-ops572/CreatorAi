import mongoose, { Document, Schema } from 'mongoose';

export interface IIdea extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  format: 'Reel' | 'Short' | 'YouTube video' | 'Ad' | 'Review' | 'Tutorial' | 'Unboxing' | 'Educational' | 'UGC';
  hook: string;
  angle: string;
  targetDurationSeconds: number;
  whyItWorks: string;
  callToAction: string;
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IdeaSchema = new Schema<IIdea>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    format: {
      type: String,
      enum: ['Reel', 'Short', 'YouTube video', 'Ad', 'Review', 'Tutorial', 'Unboxing', 'Educational', 'UGC'],
      required: true,
      index: true,
    },
    hook: { type: String, required: true },
    angle: { type: String, default: '' },
    targetDurationSeconds: { type: Number, default: 30 },
    whyItWorks: { type: String, default: '' },
    callToAction: { type: String, default: '' },
    selected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Idea = mongoose.model<IIdea>('Idea', IdeaSchema);
