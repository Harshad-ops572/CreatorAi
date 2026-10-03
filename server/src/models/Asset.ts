import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  folder: string;
  type: 'video' | 'image' | 'audio' | 'document';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  tags: string[]; // e.g. ['product', 'close-up', 'talking', 'demo', 'indoor', 'outdoor', 'hand', 'face', 'packaging']
  metadata: {
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
    bitrate?: number;
  };
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    folder: { type: String, default: 'Raw Footage', index: true },
    type: {
      type: String,
      enum: ['video', 'image', 'audio', 'document'],
      required: true,
      index: true,
    },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    url: { type: String, required: true },
    tags: [{ type: String, index: true }],
    metadata: {
      duration: { type: Number },
      width: { type: Number },
      height: { type: Number },
      fps: { type: Number },
      orientation: { type: String, enum: ['portrait', 'landscape', 'square'] },
      bitrate: { type: Number },
    },
    embedding: [{ type: Number }],
  },
  { timestamps: true }
);

AssetSchema.index({ tags: 'text', originalName: 'text' });

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);
