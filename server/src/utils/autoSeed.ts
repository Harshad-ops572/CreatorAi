import bcrypt from 'bcryptjs';
import path from 'path';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Product } from '../models/Product';
import { Idea } from '../models/Idea';
import { Script } from '../models/Script';
import { Asset } from '../models/Asset';
import { FootageAnalysis } from '../models/FootageAnalysis';
import { Timeline } from '../models/Timeline';
import { WorkflowTask } from '../models/WorkflowTask';
import { AnalyticsEntry } from '../models/Analytics';
import { storageService } from '../services/storage.service';
import { ffmpegService } from '../services/ffmpeg.service';
import { vectorService } from '../services/vector.service';

export async function ensureSeedData(): Promise<void> {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('Database is empty. Auto-seeding initial demo creator workspace...');

    // 1. User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('creator123', salt);
    const user = await User.create({
      email: 'creator@creatorai.io',
      name: 'Alex Rivera',
      passwordHash,
    });

    // 2. Project
    const project = await Project.create({
      userId: user._id,
      title: 'AuraPulse Pro Smart Mic Launch',
      description: 'Unified TikTok & Instagram Reels campaign highlighting real-time AI acoustic noise cancellation.',
      status: 'editing',
      targetPlatform: 'reels',
      aspectRatio: '9:16',
      currentDraft: 1,
    });

    const projectId = project._id.toString();
    const projectDir = storageService.getProjectDir(projectId);

    // 3. Product
    await Product.create({
      projectId: project._id,
      userId: user._id,
      name: 'AuraPulse Pro Smart Mic',
      rawDescription: 'Studio-grade USB-C microphone featuring proprietary on-capsule AI acoustic noise reduction and dynamic halo RGB indicator.',
      uploadedFiles: [
        {
          filename: 'brochure.pdf',
          originalName: 'AuraPulse_Product_Brochure.pdf',
          mimeType: 'application/pdf',
          path: path.join(projectDir, 'brochure.pdf'),
          url: storageService.getPublicUrl(`${projectId}/brochure.pdf`),
        },
      ],
      profile: {
        name: 'AuraPulse Pro Smart Mic',
        category: 'Creator Audio Hardware',
        features: [
          'Proprietary on-capsule AI acoustic noise cancellation',
          'Zero-latency 3.5mm direct monitoring port',
          'Plug-and-play USB-C with 24-bit/96kHz high-resolution sound',
          'Dynamic RGB halo showing volume and mute status',
        ],
        benefits: [
          'Record studio-clean audio in noisy bedrooms or coffee shops',
          'Saves 5+ hours per week of tedious post-production audio cleanup',
          'Instantly doubles video watch time and perceived creator authority',
        ],
        usp: 'Instant studio-grade broadcast clarity with one-tap AI acoustic cancellation.',
        price: '$129',
        targetAudience: ['TikTok/Reel Creators', 'YouTubers', 'Podcasters', 'Remote Tech Executives'],
        brandTone: ['Modern', 'Bold', 'Clean', 'Punchy'],
        keyClaims: [
          'Eliminates 98% of ambient room noise instantly',
          'Zero software or drivers required on any OS',
        ],
        visualStyle: 'Sleek matte obsidian hardware with vibrant electric blue accents and macro close-ups.',
      },
    });

    // 4. Ideas
    const ideasData = [
      {
        title: 'Stop Making This Massive Audio Mistake',
        hook: 'If your videos sound like you recorded inside a submarine, watch this right now.',
        format: 'Reel' as const,
        angle: 'Problem-Agitation-Solution Contrast',
        targetDurationSeconds: 30,
        whyItWorks: 'Direct callout triggers FOMO and pain identification within first 1.5 seconds.',
        callToAction: 'Tap the link in bio to upgrade your sound.',
        selected: true,
      },
      {
        title: 'Vacuum Cleaner ON vs Whisper Quiet',
        hook: 'I turned a vacuum cleaner on 1 foot away from this mic. Can you hear it?',
        format: 'Reel' as const,
        angle: 'Extreme Live Demonstration',
        targetDurationSeconds: 24,
        whyItWorks: 'Auditory contrast shocks scroller and drives high comment rates.',
        callToAction: 'Check out the AuraPulse link before it sells out.',
        selected: false,
      },
      {
        title: 'Why I Sold My $800 Studio Rig',
        hook: 'I boxed up my $800 audio gear for this $129 mic. Hear the blind test.',
        format: 'YouTube video' as const,
        angle: 'Contrarian Value Comparison',
        targetDurationSeconds: 45,
        whyItWorks: 'Contrarian financial claim builds massive curiosity.',
        callToAction: 'Drop a comment if you want the sample raw audio file.',
        selected: false,
      },
    ];

    for (const item of ideasData) {
      await Idea.create({
        projectId: project._id,
        userId: user._id,
        ...item,
      });
    }

    // 5. Script
    const script = await Script.create({
      projectId: project._id,
      userId: user._id,
      title: 'Stop Making This Massive Audio Mistake',
      version: 1,
      format: 'Reel',
      totalDurationSeconds: 27,
      tone: 'Punchy, confident and relatable',
      isCurrent: true,
      sections: [
        {
          id: 'sec_1_hook',
          order: 1,
          type: 'hook',
          title: '01. The Hook',
          narration: 'If your videos sound like you recorded inside a submarine, watch this right now.',
          onScreenText: 'STOP RUINING YOUR VIDEOS 🛑',
          durationSeconds: 4,
          shotPlan: {
            shotType: 'close-up',
            visualDescription: 'Creator leaning directly into camera with expressive disbelief, gesturing to audio device.',
            suggestedTags: ['talking', 'face', 'close-up'],
            cameraMovement: 'zoom',
          },
        },
        {
          id: 'sec_2_problem',
          order: 2,
          type: 'problem',
          title: '02. Pain Point',
          narration: 'Most people spend hours editing out background hum, fan noise, and harsh echoes.',
          onScreenText: 'HOURS WASTED ON AUDIO? ⏳',
          durationSeconds: 5,
          shotPlan: {
            shotType: 'medium',
            visualDescription: 'Frustrated creator at desk scrubbing audio waveforms on laptop screen.',
            suggestedTags: ['indoor', 'demo', 'talking'],
            cameraMovement: 'pan',
          },
        },
        {
          id: 'sec_3_product',
          order: 3,
          type: 'product',
          title: '03. Product Reveal',
          narration: 'Meet the AuraPulse Pro. It does real-time AI noise cancellation right inside the capsule.',
          onScreenText: 'AURAPULSE PRO 🔥',
          durationSeconds: 6,
          shotPlan: {
            shotType: 'close-up',
            visualDescription: 'Dynamic 360-degree rotating beauty shot of the product highlighting premium finish and glowing LED rim.',
            suggestedTags: ['product', 'close-up', 'packaging'],
            cameraMovement: 'pan',
          },
        },
        {
          id: 'sec_4_demo',
          order: 4,
          type: 'demo',
          title: '04. Live Proof',
          narration: 'Watch: I turn the noise suppression on, and even with loud clatter, my voice stays crystal clear.',
          onScreenText: 'LISTEN TO THIS DIFFERENCE 🎧',
          durationSeconds: 7,
          shotPlan: {
            shotType: 'pov',
            visualDescription: 'POV hand pressing the AI toggle button, followed by finger snapping and clapping next to mic.',
            suggestedTags: ['demo', 'hand', 'product', 'close-up'],
            cameraMovement: 'static',
          },
        },
        {
          id: 'sec_5_cta',
          order: 5,
          type: 'cta',
          title: '05. Call to Action',
          narration: 'Upgrade your content quality instantly. Tap the link in bio to grab yours today.',
          onScreenText: 'TAP LINK IN BIO 🚀',
          durationSeconds: 5,
          shotPlan: {
            shotType: 'action',
            visualDescription: 'Creator smiling with product in hand, pointing down towards the caption link area.',
            suggestedTags: ['talking', 'face', 'product'],
            cameraMovement: 'zoom',
          },
        },
      ],
    });

    // 6. Footage Assets (Sample MP4 clips)
    const assetPresets = [
      { filename: 'clip_01_hook_talking.mp4', title: 'Hook Talking Head', tags: ['talking', 'face', 'close-up'], color: '#3b82f6', duration: 5 },
      { filename: 'clip_02_frustrated_desk.mp4', title: 'Frustrated at Desk', tags: ['talking', 'indoor', 'demo'], color: '#6366f1', duration: 6 },
      { filename: 'clip_03_product_closeup.mp4', title: 'AuraPulse Macro Product Reveal', tags: ['product', 'close-up'], color: '#10b981', duration: 7 },
      { filename: 'clip_04_hand_demo_button.mp4', title: 'Hand Pressing AI Button', tags: ['hand', 'demo', 'product'], color: '#f59e0b', duration: 6 },
      { filename: 'clip_05_packaging_unboxing.mp4', title: 'Retail Box Packaging Unbox', tags: ['packaging', 'product'], color: '#ec4899', duration: 5 },
      { filename: 'clip_06_cta_point.mp4', title: 'Creator Smiling CTA Point', tags: ['talking', 'face', 'product'], color: '#8b5cf6', duration: 5 },
    ];

    const createdAssets = [];
    for (const preset of assetPresets) {
      const filePath = path.join(projectDir, preset.filename);
      await ffmpegService.generateSampleVideo(filePath, preset.duration, preset.title, preset.color);
      const url = storageService.getPublicUrl(`${projectId}/${preset.filename}`);
      const embeddingText = `${preset.title} ${preset.tags.join(' ')}`;
      const embedding = vectorService.generateFallbackEmbedding(embeddingText);

      const assetDoc = await Asset.create({
        projectId: project._id,
        userId: user._id,
        folder: 'Raw Footage',
        type: 'video',
        filename: preset.filename,
        originalName: preset.title + '.mp4',
        mimeType: 'video/mp4',
        size: 512000,
        path: filePath,
        url,
        tags: preset.tags,
        metadata: {
          duration: preset.duration,
          width: 1080,
          height: 1920,
          fps: 30,
          orientation: 'portrait',
        },
        embedding,
      });

      createdAssets.push(assetDoc);
    }

    // 7. Footage Analyses
    for (const asset of createdAssets) {
      const scenes = [
        {
          sceneId: `scene_${asset._id}_1`,
          sceneIndex: 1,
          startTime: 0,
          endTime: asset.metadata?.duration || 5,
          duration: asset.metadata?.duration || 5,
          summary: `${asset.originalName} scene with clear visual focus and dialogue.`,
          detectedObjects: ['product', 'creator', 'desk'],
          detectedActions: ['talking', 'demonstration'],
          speechTranscript: 'Clean dialogue demonstration.',
          cameraMotion: 'static' as const,
          qualityScore: 92,
          tags: asset.tags,
          embedding: asset.embedding,
        },
      ];

      await FootageAnalysis.create({
        projectId: project._id,
        assetId: asset._id,
        userId: user._id,
        scenes,
        proposedClips: [
          {
            clipId: `prop_${asset._id}`,
            title: `Viral Clip - ${asset.originalName}`,
            hookText: 'You will not believe this sound comparison! 🔥',
            startTime: 0,
            endTime: 5,
            duration: 5,
            relevanceScore: 95,
            status: 'proposed',
          },
        ],
        overallSummary: `Scene analysis for ${asset.originalName}`,
        status: 'completed',
      });
    }

    // 8. Timeline (Draft v1)
    const clips = createdAssets.slice(0, 5).map((asset, idx) => {
      const scriptSec = script.sections[idx] || { durationSeconds: 5, onScreenText: 'PRO SOUND' };
      return {
        id: `clip_timeline_${idx + 1}`,
        assetId: asset._id.toString(),
        assetUrl: asset.url,
        title: asset.originalName,
        trackIndex: 0,
        timelineStart: idx * 5,
        duration: 5,
        sourceStart: 0,
        sourceEnd: 5,
        speed: 1.0,
        volume: 1.0,
        captionText: scriptSec.onScreenText || 'STUDIO CLARITY 🎙️',
        transitionIn: idx > 0 ? ('fade' as const) : ('none' as const),
        transitionDuration: 0.3,
        matchScore: 96 - idx * 2,
        sectionType: scriptSec.type,
      };
    });

    await Timeline.create({
      projectId: project._id,
      userId: user._id,
      version: 1,
      title: 'Draft v1',
      tracks: [
        { id: 'track_video_1', name: 'Main Video', type: 'video', muted: false, locked: false },
        { id: 'track_broll_1', name: 'B-Roll & Overlays', type: 'b-roll', muted: false, locked: false },
        { id: 'track_captions_1', name: 'AI Captions', type: 'captions', muted: false, locked: false },
        { id: 'track_audio_1', name: 'Background Music', type: 'audio', muted: false, locked: false },
      ],
      clips,
      totalDuration: clips.length * 5,
      aspectRatio: '9:16',
      operationsHistory: [
        {
          action: 'reorder',
          description: 'Auto Draft assembled from script shot plan matches with kinetic captions.',
          params: { clipsCount: clips.length },
          timestamp: new Date(),
        },
      ],
      isCurrent: true,
    });

    // 9. Kanban Workflow Tasks
    const tasks = [
      { stage: 'idea' as const, title: 'Brainstorm Hooks & Angles', priority: 'high' as const, order: 0 },
      { stage: 'scripting' as const, title: 'Generate 5-Section Timed Script', priority: 'high' as const, order: 1 },
      { stage: 'recording' as const, title: 'Record Product A-Roll and Close-ups', priority: 'medium' as const, order: 2 },
      { stage: 'editing' as const, title: 'Chat-to-Edit Pacing & Replace Clip 2', priority: 'high' as const, order: 3 },
      { stage: 'ready' as const, title: 'Export 9:16 Reel for Instagram & TikTok', priority: 'medium' as const, order: 4 },
      { stage: 'published' as const, title: 'Review 3-Second Retention Analytics', priority: 'low' as const, order: 5 },
    ];

    for (const t of tasks) {
      await WorkflowTask.create({
        projectId: project._id,
        userId: user._id,
        ...t,
      });
    }

    // 10. Analytics Samples
    const analyticsSamples = [
      {
        videoTitle: 'Stop Ruining Your Sound (Microphone Mistake)',
        platform: 'reels' as const,
        hookType: 'visual_shock' as const,
        views: 64200,
        watchTimeSeconds: 178000,
        avgWatchPercentage: 76,
        engagementRate: 7.4,
        shares: 1840,
        saves: 2950,
        retentionAt3s: 84,
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'The $129 vs $800 Audio Battle',
        platform: 'shorts' as const,
        hookType: 'contrarian' as const,
        views: 112000,
        watchTimeSeconds: 310000,
        avgWatchPercentage: 71,
        engagementRate: 8.8,
        shares: 4100,
        saves: 6200,
        retentionAt3s: 81,
        date: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'Vacuum Cleaner ON vs Whisper Test',
        platform: 'tiktok' as const,
        hookType: 'question' as const,
        views: 148500,
        watchTimeSeconds: 412000,
        avgWatchPercentage: 83,
        engagementRate: 9.6,
        shares: 6800,
        saves: 8900,
        retentionAt3s: 91,
        date: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      },
      {
        videoTitle: 'AuraPulse Pro Full Studio Breakdown',
        platform: 'youtube' as const,
        hookType: 'problem_solution' as const,
        views: 24300,
        watchTimeSeconds: 119000,
        avgWatchPercentage: 62,
        engagementRate: 5.6,
        shares: 510,
        saves: 1120,
        retentionAt3s: 69,
        date: new Date(Date.now() - 11 * 24 * 3600 * 1000),
      },
    ];

    for (const item of analyticsSamples) {
      await AnalyticsEntry.create({
        projectId: project._id,
        userId: user._id,
        ...item,
      });
    }

    console.log('Auto-seed completed successfully!');
  } catch (err) {
    console.error('Auto-seed warning:', err);
  }
}
