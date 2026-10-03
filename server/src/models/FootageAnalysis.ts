import mongoose, { Document, Schema } from 'mongoose';

export interface ISceneAnalysis {
  sceneId: string;
  sceneIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  thumbnailUrl?: string;
  summary: string;
  detectedObjects: string[];
  detectedActions: string[];
  speechTranscript?: string;
  cameraMotion: 'static' | 'pan' | 'tilt' | 'zoom' | 'handheld';
  qualityScore: number; // 0 - 100
  tags: string[]; // ['product', 'close-up', 'talking', 'demo', etc.]
  embedding?: number[];
}

export interface IProposedClip {
  clipId: string;
  title: string;
  hookText: string;
  startTime: number;
  endTime: number;
  duration: number;
  relevanceScore: number;
  status: 'proposed' | 'accepted' | 'rejected' | 'adjusted';
}

export interface IFootageAnalysis extends Document {
  projectId: mongoose.Types.ObjectId;
  assetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  scenes: ISceneAnalysis[];
  proposedClips: IProposedClip[];
  overallSummary: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const SceneAnalysisSchema = new Schema<ISceneAnalysis>(
  {
    sceneId: { type: String, required: true },
    sceneIndex: { type: Number, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    thumbnailUrl: { type: String, default: '' },
    summary: { type: String, required: true },
    detectedObjects: [{ type: String }],
    detectedActions: [{ type: String }],
    speechTranscript: { type: String, default: '' },
    cameraMotion: {
      type: String,
      enum: ['static', 'pan', 'tilt', 'zoom', 'handheld'],
      default: 'static',
    },
    qualityScore: { type: Number, default: 85 },
    tags: [{ type: String }],
    embedding: [{ type: Number }],
  },
  { _id: false }
);

const ProposedClipSchema = new Schema<IProposedClip>(
  {
    clipId: { type: String, required: true },
    title: { type: String, required: true },
    hookText: { type: String, default: '' },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    relevanceScore: { type: Number, default: 90 },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'rejected', 'adjusted'],
      default: 'proposed',
    },
  },
  { _id: false }
);

const FootageAnalysisSchema = new Schema<IFootageAnalysis>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assetId: { type: Schema.Types.ObjectId, ref: 'Asset', required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scenes: [SceneAnalysisSchema],
    proposedClips: [ProposedClipSchema],
    overallSummary: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const FootageAnalysis = mongoose.model<IFootageAnalysis>('FootageAnalysis', FootageAnalysisSchema);
