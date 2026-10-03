import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflowTask extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  stage: 'idea' | 'scripting' | 'recording' | 'editing' | 'ready' | 'published';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedNotes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowTaskSchema = new Schema<IWorkflowTask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    stage: {
      type: String,
      enum: ['idea', 'scripting', 'recording', 'editing', 'ready', 'published'],
      default: 'idea',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    assignedNotes: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WorkflowTask = mongoose.model<IWorkflowTask>('WorkflowTask', WorkflowTaskSchema);
