import mongoose, { Document, Schema } from 'mongoose';

export interface IScriptSection {
  id: string;
  order: number;
  type: 'hook' | 'problem' | 'product' | 'demo' | 'cta' | 'b-roll' | 'reaction';
  title: string;
  narration: string;
  onScreenText: string;
  durationSeconds: number;
  shotPlan: {
    shotType: 'close-up' | 'wide' | 'medium' | 'pov' | 'over-the-shoulder' | 'action';
    visualDescription: string;
    suggestedTags: string[];
    cameraMovement?: string;
  };
  audioNotes?: string;
}

export interface IScript extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ideaId?: mongoose.Types.ObjectId;
  title: string;
  version: number;
  format: string;
  totalDurationSeconds: number;
  sections: IScriptSection[];
  tone: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScriptSectionSchema = new Schema<IScriptSection>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    type: {
      type: String,
      enum: ['hook', 'problem', 'product', 'demo', 'cta', 'b-roll', 'reaction'],
      required: true,
    },
    title: { type: String, required: true },
    narration: { type: String, required: true },
    onScreenText: { type: String, default: '' },
    durationSeconds: { type: Number, default: 5 },
    shotPlan: {
      shotType: {
        type: String,
        enum: ['close-up', 'wide', 'medium', 'pov', 'over-the-shoulder', 'action'],
        default: 'medium',
      },
      visualDescription: { type: String, required: true },
      suggestedTags: [{ type: String }],
      cameraMovement: { type: String, default: 'static' },
    },
    audioNotes: { type: String, default: '' },
  },
  { _id: false }
);

const ScriptSchema = new Schema<IScript>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ideaId: { type: Schema.Types.ObjectId, ref: 'Idea' },
    title: { type: String, required: true },
    version: { type: Number, default: 1 },
    format: { type: String, default: 'Reel' },
    totalDurationSeconds: { type: Number, default: 30 },
    sections: [ScriptSectionSchema],
    tone: { type: String, default: 'high-energy' },
    isCurrent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Script = mongoose.model<IScript>('Script', ScriptSchema);
