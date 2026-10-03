export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'idea' | 'scripting' | 'recording' | 'editing' | 'ready' | 'published';
  targetPlatform: 'reels' | 'shorts' | 'tiktok' | 'youtube' | 'linkedin';
  aspectRatio: '9:16' | '16:9' | '1:1';
  currentDraft: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductProfile {
  name: string;
  category: string;
  features: string[];
  benefits: string[];
  usp: string;
  price?: string;
  targetAudience: string[];
  brandTone: string[];
  keyClaims: string[];
  visualStyle: string;
}

export interface Product {
  _id: string;
  projectId: string;
  name: string;
  rawDescription: string;
  uploadedFiles: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    url: string;
  }>;
  profile: ProductProfile;
}

export interface Idea {
  _id: string;
  projectId: string;
  title: string;
  format: 'Reel' | 'Short' | 'YouTube video' | 'Ad' | 'Review' | 'Tutorial' | 'Unboxing' | 'Educational' | 'UGC';
  hook: string;
  angle: string;
  targetDurationSeconds: number;
  whyItWorks: string;
  callToAction: string;
  selected: boolean;
  createdAt: string;
}

export interface ScriptSection {
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

export interface Script {
  _id: string;
  projectId: string;
  ideaId?: string;
  title: string;
  version: number;
  format: string;
  totalDurationSeconds: number;
  sections: ScriptSection[];
  tone: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface Asset {
  _id: string;
  projectId: string;
  folder: string;
  type: 'video' | 'image' | 'audio' | 'document';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  tags: string[];
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    fps?: number;
    orientation?: 'portrait' | 'landscape' | 'square';
  };
  createdAt: string;
}

export interface SceneAnalysis {
  sceneId: string;
  sceneIndex: number;
  startTime: number;
  endTime: number;
  duration: number;
  summary: string;
  detectedObjects: string[];
  detectedActions: string[];
  speechTranscript?: string;
  cameraMotion: 'static' | 'pan' | 'tilt' | 'zoom' | 'handheld';
  qualityScore: number;
  tags: string[];
}

export interface ProposedClip {
  clipId: string;
  title: string;
  hookText: string;
  startTime: number;
  endTime: number;
  duration: number;
  relevanceScore: number;
  status: 'proposed' | 'accepted' | 'rejected' | 'adjusted';
}

export interface FootageAnalysis {
  _id: string;
  projectId: string;
  assetId: string;
  scenes: SceneAnalysis[];
  proposedClips: ProposedClip[];
  overallSummary: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TimelineClip {
  id: string;
  assetId: string;
  assetUrl: string;
  title: string;
  trackIndex: number;
  timelineStart: number;
  duration: number;
  sourceStart: number;
  sourceEnd: number;
  speed: number;
  volume: number;
  captionText?: string;
  transitionIn?: 'none' | 'fade' | 'dissolve' | 'wipe' | 'zoom';
  transitionDuration?: number;
  matchScore?: number;
  sectionType?: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'b-roll' | 'audio' | 'captions' | 'overlay';
  muted: boolean;
  locked: boolean;
}

export interface TimelineOperation {
  action: string;
  targetClipId?: string;
  params: Record<string, any>;
  description: string;
  timestamp: string;
}

export interface Timeline {
  _id: string;
  projectId: string;
  version: number;
  title: string;
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  totalDuration: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  operationsHistory: TimelineOperation[];
  isCurrent: boolean;
}

export interface WorkflowTask {
  _id: string;
  projectId: string;
  title: string;
  stage: 'idea' | 'scripting' | 'recording' | 'editing' | 'ready' | 'published';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedNotes?: string;
  order: number;
}

export interface JobStatus {
  id: string;
  type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStepMessage: string;
  resultPayload?: any;
  errorMessage?: string;
}
