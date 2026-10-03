import mongoose, { Document, Schema } from 'mongoose';

export interface ITimelineClip {
  id: string;
  assetId: string;
  assetUrl: string;
  title: string;
  trackIndex: number;
  timelineStart: number; // In seconds on the timeline
  duration: number; // Duration on timeline
  sourceStart: number; // Trim start in original media
  sourceEnd: number; // Trim end in original media
  speed: number; // 1.0, 1.25, etc.
  volume: number; // 0.0 - 1.0
  captionText?: string;
  transitionIn?: 'none' | 'fade' | 'dissolve' | 'wipe' | 'zoom';
  transitionDuration?: number;
  matchScore?: number;
  sectionType?: string;
  notes?: string;
}

export interface ITimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'b-roll' | 'audio' | 'captions' | 'overlay';
  muted: boolean;
  locked: boolean;
}

export interface ITimelineOperation {
  action: 'trim' | 'speed' | 'remove' | 'reorder' | 'replace' | 'add_caption' | 'adjust_duration' | 'style_change';
  targetClipId?: string;
  params: Record<string, any>;
  description: string;
  timestamp: Date;
}

export interface ITimeline extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  version: number;
  title: string; // e.g. "Draft v1"
  tracks: ITimelineTrack[];
  clips: ITimelineClip[];
  backgroundMusic?: {
    assetId?: string;
    url?: string;
    name?: string;
    volume: number;
  };
  captionsStyle?: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor?: string;
    position: 'bottom' | 'center' | 'top';
  };
  totalDuration: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  operationsHistory: ITimelineOperation[];
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineClipSchema = new Schema<ITimelineClip>(
  {
    id: { type: String, required: true },
    assetId: { type: String, required: true },
    assetUrl: { type: String, required: true },
    title: { type: String, required: true },
    trackIndex: { type: Number, default: 0 },
    timelineStart: { type: Number, required: true },
    duration: { type: Number, required: true },
    sourceStart: { type: Number, required: true },
    sourceEnd: { type: Number, required: true },
    speed: { type: Number, default: 1.0 },
    volume: { type: Number, default: 1.0 },
    captionText: { type: String, default: '' },
    transitionIn: {
      type: String,
      enum: ['none', 'fade', 'dissolve', 'wipe', 'zoom'],
      default: 'none',
    },
    transitionDuration: { type: Number, default: 0.3 },
    matchScore: { type: Number },
    sectionType: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const TimelineTrackSchema = new Schema<ITimelineTrack>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['video', 'b-roll', 'audio', 'captions', 'overlay'],
      required: true,
    },
    muted: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
  },
  { _id: false }
);

const TimelineOperationSchema = new Schema<ITimelineOperation>(
  {
    action: {
      type: String,
      enum: ['trim', 'speed', 'remove', 'reorder', 'replace', 'add_caption', 'adjust_duration', 'style_change'],
      required: true,
    },
    targetClipId: { type: String },
    params: { type: Schema.Types.Mixed, default: {} },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TimelineSchema = new Schema<ITimeline>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    version: { type: Number, default: 1 },
    title: { type: String, default: 'Draft v1' },
    tracks: [TimelineTrackSchema],
    clips: [TimelineClipSchema],
    backgroundMusic: {
      assetId: String,
      url: String,
      name: String,
      volume: { type: Number, default: 0.3 },
    },
    captionsStyle: {
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: Number, default: 28 },
      color: { type: String, default: '#FFFFFF' },
      backgroundColor: { type: String, default: 'rgba(0, 0, 0, 0.6)' },
      position: { type: String, enum: ['bottom', 'center', 'top'], default: 'bottom' },
    },
    totalDuration: { type: Number, default: 0 },
    aspectRatio: {
      type: String,
      enum: ['9:16', '16:9', '1:1'],
      default: '9:16',
    },
    operationsHistory: [TimelineOperationSchema],
    isCurrent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Timeline = mongoose.model<ITimeline>('Timeline', TimelineSchema);
