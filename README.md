# CreatorAi — AI-Powered Creator Operating Platform

Welcome to **CreatorAi**! This platform unifies the entire content creator workflow into one context-aware system:
**Product Upload → AI Intelligence Profile → Viral Hooks & Ideation → Timed Script & Shot Plan → Footage Analysis → Script-to-Footage Vector Matching → Automated AI Editing → Chat-to-Edit → Manual Clip Tweaks & Replacement → 9:16 Video Export → Multi-Platform Publishing → Creator Analytics.**

---

## 1. What CreatorAi Is & What Each Feature Does (in Plain English)

Traditional video creation is fragmented: creators brainstorm in notes, write scripts in docs, hunt through hours of footage in folders, edit in complex timelines, reformat for different social apps, and guess what went wrong in analytics.

**CreatorAi solves this with a single "Product-Centric" workflow:**
Everything inside a project is aware of the product or content you upload. The AI first understands the product, and then every idea, script, shot requirement, clip match, edit, kinetic caption, and thumbnail is tailored to it.

### The 20 Core Features:
1. **Product Upload**: Upload images, video clips, user manuals, PDF brochures, or raw descriptions.
2. **Product Intelligence Profile**: Google Gemini extracts the product category, features, benefits, USP (Unique Selling Proposition), price tier, target audience, brand tone, and visual style. You can edit this anytime; it is saved directly to your project and injected into all subsequent AI generations.
3. **Content Ideation & Viral Hooks**: Choose a format (Reel, Short, YouTube video, Ad, Review, Tutorial, Unboxing, Educational, UGC). The AI generates 3+ high-converting ideas featuring 3-second psychological hooks. Select the one you like with one click.
4. **AI Script & Hook Generation**: Compiles a timed 5-section storyboard script (Hook, Problem, Product Reveal, Live Demo, CTA) with spoken voiceover and on-screen caption text.
5. **Visual Shot Plan**: Every script section specifies the visual requirement (camera shot type, visual description, camera movement, and required asset tags).
6. **Asset Management**: Upload raw video clips, photos, and B-roll. Auto-tagging assigns labels (`#product`, `#close-up`, `#talking`, `#demo`, `#hand`, `#face`, `#packaging`, `#indoor`, `#outdoor`). Search footage using semantic natural language ("show all product close-ups").
7. **Footage Analysis (Video Understanding)**: Automatically breaks down footage into scene segments, logs detected objects, creator actions, speech transcription, camera motion, and quality scores.
8. **Script-to-Footage Vector Matching**: Uses semantic vector search to compare your script shot requirements against all analyzed scenes. Surfaces the top 3 alternative footage clips with confidence percentages (e.g. 96% match).
9. **Automated Clip Generation**: Automatically proposes viral short clips with start/end timestamps, catchy titles, and hook text from your footage.
10. **Auto Draft (AI-Assisted Editing)**: In one click, assembles matching clips in script order, normalizes audio, adds kinetic on-screen captions, and generates an editable "Draft v1" JSON timeline. Nothing is locked.
11. **Chat-to-Edit**: Type plain English instructions into the AI assistant panel (e.g. *"make the intro faster"*, *"make it 15 seconds"*, *"remove scene 2"*, or *"make it feel more premium"*). The AI compiles your command into validated timeline operations and explains what changed.
12. **Manual Video Editor**: Center video preview player with timecodes, multi-track timeline (Video, B-Roll, AI Captions, Audio), playback controls, trim handles, speed adjustments (1.0x, 1.25x, 1.5x, 2.0x), and volume controls.
13. **Replace Clip in One Click**: Click on any clip on your timeline, tap "Replace This Clip", and the platform scans your footage library to recommend the best visual replacements with match explanations.
14. **Multi-Platform Adaptation**: Tailors your content for Instagram Reels, YouTube Shorts, TikTok, YouTube (Widescreen 16:9), and LinkedIn (1:1 Square) with platform-specific hooks, titles, hashtags, and optimal posting times.
15. **Viral Thumbnail Generator**: Generates 3 visual concept cards with bold text overlays, composition layouts, psychological curiosity triggers, and recommended color palettes.
16. **Caption and Post Generator**: Formulates copy-paste ready captions, hashtags, and CTAs grounded in your product intelligence profile.
17. **Content Workflow Kanban Board**: Interactive board with stages (*Idea → Scripting → Recording → Editing → Ready → Published*) featuring optimistic drag-and-drop updates and a 7-day publishing calendar view.
18. **Version Control**: Manage timeline drafts (*Draft 1 → Draft 2 → Final*) with one-click revert.
19. **Creator Intelligence Analytics**: Interactive dashboard tracking views, watch time, engagement rates, 3-second hook retention curves, and best-performing hook types, paired with Gemini AI observations surfacing patterns in your data.
20. **Permanent Project Cleanup**: Deleting a project completely removes all its documents, AI history, and physical media files from disk.

---

## 2. Tech Stack & Why Each Tool Was Chosen

- **Frontend: React + Vite + TypeScript**: Blazing-fast development server, strict type-safety, and modular component architecture.
- **Styling: Tailwind CSS**: Custom dark theme design tokens (`#080A10` background, `#6366F1` electric indigo signature accent), glassmorphism panels, and responsive breakpoints (`360px`, `768px`, `1280px+`).
- **Interactive 3D: Three.js (React Three Fiber + Drei)**: Renders a lightweight, low-poly floating cluster of creator cards that react to your mouse pointer. Capped at `dpr: 1.5`, automatically pauses rendering when off-screen or when the browser tab is hidden, and simplifies cleanly on mobile and for reduced-motion users.
- **Backend: Node.js + Express (TypeScript)**: Clean RESTful API architecture with Zod request validation on every route and centralized error handling.
- **Database: MongoDB via Mongoose**: Flexible document model. Connects to MongoDB Atlas for production with Atlas Vector Search, and includes an embedded zero-config in-memory database fallback for instant local testing out of the box.
- **AI: Google Gemini API (`gemini-1.5-flash`)**: Server-side multimodal reasoning for product profile extraction, viral ideation, timed script creation, chat-to-edit compilation, and analytics observations. (Keys are never exposed to the browser).
- **Video Engine: FFmpeg (`ffmpeg-static` + `fluent-ffmpeg` + `ffprobe-static`)**: Cuts, joins, resizes (9:16, 16:9, 1:1), normalizes audio, burns kinetic captions, and exports MP4 video files locally.
- **Background Job Queue**: In-memory job worker with progress tracking (0–100%), atomic database updates, and automatic retries for video rendering and heavy analysis.

---

## 3. Folder Structure Explained

```text
CreatorAi/
├── package.json               # Root workspace scripts
├── README.md                  # Complete beginner documentation
│
├── server/                    # Node.js + Express + TypeScript Backend
│   ├── package.json           # Server dependencies (Express, Mongoose, FFmpeg, Gemini, Zod)
│   ├── tsconfig.json          # Server TypeScript configuration
│   ├── .env                   # Environment variables (secrets stay here)
│   ├── .env.example           # Example template for environment variables
│   ├── uploads/               # Local folder where uploaded media and rendered videos live
│   └── src/
│       ├── server.ts          # Express app entry point, security headers & route registration
│       ├── config/            # Database (db.ts), Environment (env.ts), FFmpeg (ffmpeg.ts)
│       ├── models/            # Mongoose schemas (User, Project, Product, Idea, Script, Asset, etc.)
│       ├── middleware/        # JWT Auth, Zod validation, Rate limiters, Multer upload, Error handler
│       ├── services/          # Gemini AI service, FFmpeg video service, Vector matching, Job queue, Storage
│       ├── routes/            # REST API endpoints (auth, projects, products, ideas, scripts, assets, editor, etc.)
│       └── utils/             # Auto-seed generator for zero-config demonstration
│
└── client/                    # React + Vite + TypeScript Frontend
    ├── package.json           # Client dependencies (React, Lucide, Tailwind, R3F, Drei, Framer Motion)
    ├── vite.config.ts         # Vite server configuration with /api and /uploads proxying
    ├── tailwind.config.js     # Custom dark theme tokens and glow utilities
    ├── index.html             # HTML entry point with Inter font & SEO meta tags
    └── src/
        ├── main.tsx           # React DOM mounting
        ├── App.tsx            # Main app router and provider orchestration
        ├── index.css          # Tailwind base, glassmorphism styles, custom scrollbars
        ├── types/             # TypeScript interfaces for all data structures
        ├── api/client.ts      # Centralized API client with typed methods
        ├── context/           # AuthContext, ToastContext, ProjectContext
        ├── hooks/             # useDebounce (300ms search), custom hooks
        ├── components/
        │   ├── common/        # Reusable Button, Card, Modal, Input, Skeleton, Toast, Badge, Tabs
        │   ├── layout/        # Navbar, Sidebar, responsive headers
        │   ├── 3d/            # HeroScene.tsx with R3F canvas and ThreeErrorBoundary
        │   └── project/       # OverviewTab, ProductTab, IdeasTab, ScriptTab, FootageTab, EditorTab, ExportTab
        └── pages/             # LandingPage, AuthPages, DashboardPage, ProjectWorkspacePage, WorkflowPage, AnalyticsPage, SettingsPage
```

---

## 4. Prerequisites (What You Need Before Starting)

You don't need any programming experience. Install these free tools:

1. **Node.js (v18 or higher)**:
   - Download the LTS version from [https://nodejs.org](https://nodejs.org).
   - Run the installer and click "Next" through the prompts.
   - Verify installation: Open PowerShell or Terminal and type:
     ```bash
     node -v
     npm -v
     ```
2. **Git**:
   - Download from [https://git-scm.com](https://git-scm.com) and install with default settings.
3. **Visual Studio Code (VS Code)**:
   - Download from [https://code.visualstudio.com](https://code.visualstudio.com) to view and edit files easily.
4. **FFmpeg**:
   - **Good news!** You do **not** need to install FFmpeg manually. CreatorAi includes `ffmpeg-static` and `ffprobe-static`, which automatically bundles pre-compiled FFmpeg binaries for Windows, macOS, and Linux!

---

## 5. Setting Up Free MongoDB Atlas (Optional, Cloud Production)

> **Note:** By default, CreatorAi starts an **in-memory database automatically** if `MONGODB_URI` is left blank, meaning the app works out of the box with zero setup! When you're ready to use MongoDB Atlas cloud storage:

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **"Create a Deployment"** and select the **M0 Free Tier**.
3. Choose a cloud provider and region close to you.
4. **Create a Database User**:
   - Username: `creator_admin`
   - Password: Click "Autogenerate Secure Password" (copy this password).
5. **Configure Network Access (IP Allowlist)**:
   - Click "Network Access" in the left sidebar.
   - Click "Add IP Address" → Choose **"Allow Access from Anywhere"** (`0.0.0.0/0`) for development.
6. **Get Connection String**:
   - Go to "Database" → click **"Connect"** → choose **"Drivers"** (Node.js).
   - Copy the connection string. It looks like:
     ```text
     mongodb+srv://creator_admin:<password>@cluster0.abcde.mongodb.net/creatorai?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database password.
   - Paste this into `server/.env` under `MONGODB_URI`.
7. **Atlas Vector Search Index (for vector footage matching)**:
   - In Atlas, go to "Atlas Search" → "Create Search Index" → choose **"JSON Editor"**.
   - Select collection `assets` or `footageanalyses`.
   - Index name: `vector_index`.
   - Configuration:
     ```json
     {
       "fields": [
         {
           "type": "vector",
           "path": "embedding",
           "numDimensions": 384,
           "similarity": "cosine"
         }
       ]
     }
     ```

---

## 6. Getting a Google Gemini API Key

1. Go to **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
2. Sign in with your Google account.
3. Click the blue button: **"Get API key"** (top left).
4. Click **"Create API key in new project"**.
5. Copy your API key (starts with `AIzaSy...`).
6. Open `server/.env` in VS Code, find `GEMINI_API_KEY=`, and paste your key:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
> **Tip:** If you don't add an API key right away, CreatorAi includes a built-in intelligent generator that produces realistic responses so you can still test every feature!

---

## 7. The `.env` File Explained Variable by Variable

Open `server/.env`. Here is what each line does:

| Variable | Example Value | Explanation |
| :--- | :--- | :--- |
| `PORT` | `5000` | The local port number the backend server runs on. |
| `NODE_ENV` | `development` | Set to `development` for local work, or `production` when deployed. |
| `CLIENT_URL` | `http://localhost:5173` | The web address of your frontend React app (allowed by CORS). |
| `MONGODB_URI` | *(blank or Atlas URL)* | Your MongoDB database address. Leave blank for instant zero-config in-memory database! |
| `JWT_SECRET` | `creatorai_dev_secret_...` | A secret password used to encrypt and sign your login sessions. |
| `JWT_EXPIRES_IN` | `7d` | How long a login session stays valid (7 days). |
| `GEMINI_API_KEY` | *(your Gemini key)* | Your private Google AI Studio key for Gemini calls (never sent to the browser). |
| `UPLOAD_DIR` | `./uploads` | The local folder where video clips and rendered MP4 files are stored. |

---

## 8. Install & Run Commands (Step-by-Step)

### Step 1: Open Terminal in the Project Folder
Open VS Code, press `Ctrl + ~` (or go to `Terminal` → `New Terminal`).

### Step 2: Start the Backend Server
```bash
cd server
npm run dev
```
You will see:
```text
=========================================
 CreatorAi Backend Server Running!
 URL: http://localhost:5000
 Client Origin: http://localhost:5173
 Health: http://localhost:5000/api/health
=========================================
```

### Step 3: Start the Frontend Client
Open a second terminal tab (click the `+` icon in the terminal panel) and type:
```bash
cd client
npm run dev
```
You will see:
```text
  VITE v6.x.x  ready in 1869 ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 9. Feature Walkthrough (How to Use Every Feature)

### 1. Landing Page & 3D Interactive Hero
- Visit `http://localhost:5173`.
- Move your mouse over the screen: the 3D floating creator cards smoothly rotate and track your pointer.
- Click **"One-Click Demo Launch"** to log in instantly as demo creator *Alex Rivera*.

### 2. Creator Dashboard
- View project cards and metrics (Total Projects, Average Retention, Export Engine status).
- Click the demo project: **"AuraPulse Pro Smart Mic Launch"**.

### 3. Stage 1: Product Intelligence
- See the extracted product profile: Name, Category, Features, Benefits, USP, Price, Target Audience, Brand Tone, and Claims.
- You can edit any field and click **"Save Edits"** or click **"Regenerate"** to have Gemini analyze it again.

### 4. Stage 2: Content Ideation
- Select a format (e.g. *Reel*, *TikTok*, *YouTube video*).
- Click **"Generate 3+ Ideas with Gemini"**.
- View each idea card with its 3-second hook, psychological angle, and CTA.
- Click **"Use This Idea"** to select it for the script.

### 5. Stage 3: Timed Script & Shot Plan
- View the 5-section storyboard:
  1. *The Hook*
  2. *Pain Point*
  3. *Product Reveal*
  4. *Live Proof Demo*
  5. *Call to Action*
- Notice each section has a voiceover script, bold kinetic captions, and a **Visual Shot Plan** with required asset tags.

### 6. Stage 4: Footage & Matching
- In the "All Footage Assets" tab, browse uploaded video clips.
- Type in the semantic search bar (e.g. *"product close-up"* or *"talking head"*) to filter footage.
- Switch to the **"Script-to-Footage Matches"** sub-tab to see how vector search paired each script section to the top 3 footage alternatives with confidence scores!

### 7. Stage 5: AI Video Editor
- **Center Preview**: Press Play to watch the assembled timeline with live captions.
- **Bottom Timeline**: View the Video Track, Captions Track, and Audio Track.
- **Chat-to-Edit**: In the right panel, click one of the quick prompt buttons (e.g. *"make the intro faster"*) or type your own command (e.g. *"make it 15 seconds"* or *"remove scene 2"*). The AI compiles the instruction into structured timeline operations and updates the video.
- **Replace Clip**: Tap on a clip on the left, click **"Replace This Clip"**, pick one of the recommended alternatives, and click **"Select & Swap"**.

### 8. Stage 6: Export & Publishing
- Choose an aspect ratio: **9:16** (Reels/Shorts/TikTok), **16:9** (YouTube), or **1:1** (LinkedIn).
- Click **"Render 9:16 Video"**. Watch the background queue encode frames and celebrate with confetti!
- Click **"Download Video (.MP4)"** to save your rendered video.
- Scroll down to view the **Multi-Platform Adaptation** cards and **Thumbnail Concepts** with one-click copy buttons for captions and hashtags.

### 9. Kanban Workflow
- Click **"Workflow"** in the top navigation bar.
- Drag tasks between stages (*Idea → Scripting → Recording → Editing → Ready → Published*).
- Click **"Calendar"** to view scheduled publishing dates.

### 10. Creator Intelligence Analytics
- Click **"Creator Intelligence"** in the top navigation bar.
- Inspect view counts, watch time, and the **3-Second Retention vs. Hook Types** chart.
- Read Gemini's observations highlighting data patterns.

---

## 10. Security Measures (Explained Simply)

- **Secrets Never Sent to Browser**: Your `GEMINI_API_KEY`, `JWT_SECRET`, and `MONGODB_URI` live exclusively on the backend server. The browser never sees them.
- **HttpOnly Secure Cookies**: User authentication tokens are stored in `httpOnly` cookies that JavaScript cannot steal, protecting against Cross-Site Scripting (XSS).
- **Owner Isolation**: Every query checks `userId: req.user.id`. Creators can only see and edit their own projects, clips, and scripts.
- **Strict Input Validation**: Every request is validated against Zod schemas before touching any service.
- **File Upload Safeguards**: Whitelist checks ensure only safe media files (images, video, audio, PDF) under 100MB are accepted. Uploaded filenames are randomized to prevent path traversal attacks.
- **No Stack Trace Leaks**: The server never displays internal error stack traces to clients, returning friendly, plain-language error messages.

---

## 11. Troubleshooting Common Errors

### Q: "Cannot connect to MongoDB"
- **Solution**: If you don't have a MongoDB Atlas connection string yet, simply leave `MONGODB_URI=` blank in `server/.env`. CreatorAi will automatically launch its built-in in-memory database!

### Q: "Port 5000 is already in use"
- **Solution**: Change `PORT=5001` in `server/.env` and update `vite.config.ts` proxy to `http://localhost:5001`.

### Q: "Failed to render video"
- **Solution**: Ensure your timeline has at least one clip. CreatorAi's built-in sample generator can create test clips automatically.

---

## 12. Deployment Guide

### Deploying Frontend to Vercel or Netlify:
1. Push your repository to GitHub.
2. In Vercel or Netlify, select the `client` directory as the root.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Deploying Backend to Render:
1. Create a **Web Service** on [https://render.com](https://render.com).
2. Set root directory to `server`.
3. Build command: `npm install && npm run build`
4. Start command: `node dist/server.js`
5. In Render's "Environment" tab, add your `.env` variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`).

---

## 13. Demo Walkthrough Script (for Presentations or Videos)

1. *"Welcome to CreatorAi! Today I'm going to take you from a raw product to a published 9:16 Reel in under 2 minutes."*
2. *"First, we click One-Click Demo Launch to enter our project: AuraPulse Pro Smart Mic."*
3. *"Notice Stage 1: Product Intelligence. Gemini analyzed the product and established our USP: 'Instant studio-grade broadcast clarity with one-tap AI acoustic cancellation.' Every idea and cut we make will now be aligned to this."*
4. *"In Stage 2, Gemini gave us 3 viral hooks. We selected: 'If your videos sound like you recorded inside a submarine, watch this right now.'"*
5. *"In Stage 3, the AI generated a 5-section timed script with exact camera shot plans."*
6. *"In Stage 4, vector search matched each line of our script with our uploaded B-roll clips, ranking the top 3 visual alternatives."*
7. *"In Stage 5, the AI Editor assembled Draft v1. I can preview it, or simply tell the AI: 'make the intro faster' — and it adjusts the speed to 1.25x instantly."*
8. *"Finally, in Stage 6, we click Render 9:16 Video. FFmpeg encodes the vertical reel with kinetic captions burned in. We download the MP4, copy our Instagram caption, and view our 3-second retention analytics."*

---

## 14. Known Limitations & Future Improvements

- **Cloud Storage**: Development currently uses local `/uploads/`. The storage abstraction (`storage.service.ts`) is designed so AWS S3 or Google Cloud Storage (GCS) can be swapped in for production with zero changes to business logic.
- **Waveform scrubbing**: Real-time canvas audio waveforms can be expanded with Web Audio API peaks.
- **Direct social publishing**: Social API webhooks (YouTube Data API, Meta Graph API, TikTok Creator API) can be connected to publish rendered videos directly without manual downloading.

---

*Built with ❤️ for Creators everywhere.*
