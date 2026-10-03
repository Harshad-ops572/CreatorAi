---
trigger: always_on
---

# CreatorAi Project Rules

## About the user
- The user is a beginner with zero coding knowledge. Explain what you did in plain English after every task.
- Never ask the user to edit code manually. Make the changes yourself and tell them only what they must do (e.g., paste a key into .env).

## Workflow
- Make a short plan first, then build in small steps: backend → frontend → connect → test.
- After every major change, run the app and test it in the browser. Fix console errors and failed network calls before saying you're done.
- Do not rewrite working files unnecessarily. Change only what the task needs.
- No placeholders, fake data in production code, or "TODO" features.

## Stack (do not swap without asking)
- Frontend: React + Vite + TypeScript, Tailwind CSS, Framer Motion, react-three-fiber + drei
- Backend: Node.js + Express + TypeScript, Mongoose, Zod
- AI: Gemini API, called from the backend only

## UI smoothness
- Mobile-first, responsive at 360px, 768px, and 1280px+. No horizontal scrolling.
- Every async screen needs a loading skeleton, an empty state, and an error state with a retry button.
- Use optimistic updates for drag-and-drop (Kanban) and toggles; roll back on failure.
- Avoid layout shift: reserve space for images, videos, and charts.
- Debounce search and filter inputs (300ms). Paginate or virtualize any list over 50 items.
- Lazy-load heavy routes and the 3D scene (React.lazy + Suspense) with a lightweight fallback.
- Show a progress indicator for uploads and long AI tasks, and never freeze the UI while waiting.
- Disable buttons while a request is running to prevent double submits.
- Use toasts for success and errors, with plain-language messages and no raw error text.

## 3D element
- Keep it light: low-poly geometry, one canvas, capped pixel ratio (dpr max 1.5), no heavy textures.
- Pause rendering when the tab is hidden or the canvas is off-screen.
- Disable or simplify it on mobile and when the user prefers reduced motion.
- Dispose of geometries, materials, and textures on unmount. Wrap it in an error boundary so a 3D failure never breaks the page.

## Design system
- Define colors, spacing, radius, and fonts once as Tailwind tokens and reuse them everywhere.
- Build reusable components (Button, Card, Modal, Input, Skeleton, Toast) and don't copy-paste styles.
- Consistent dark theme with one accent color. Animations stay under 300ms and are subtle.
- Accessibility: visible focus states, aria labels, keyboard navigation, readable contrast.

## API and data
- All requests go through one API client file with centralized error handling.
- Validate every request body, query, and param with Zod. Return consistent JSON: { success, data, error }.
- Add database indexes for fields used in search and filters. Always scope queries to the logged-in user.
- Gemini calls: set timeouts, retry once on failure, validate the AI output against a schema before saving, and handle quota/rate-limit errors with a friendly message.

## Security (always enforce)
- Never hardcode secrets. Use .env, keep .env.example updated, and keep .env in .gitignore.
- Never expose GEMINI_API_KEY or MONGODB_URI to the frontend or logs.
- bcrypt for passwords, JWT in httpOnly secure cookies, helmet, strict CORS, rate limiting, NoSQL-injection and XSS sanitization.
- Uploads: whitelist file types, enforce size limits, randomize filenames.
- Run npm audit after installing packages and fix high-severity issues.

## Code quality
- TypeScript strict mode. No `any` unless unavoidable and commented.
- Small files with clear names. Comment complex logic in simple language.
- Keep README.md updated whenever setup steps, env variables, or features change.

## Before finishing any task
1. App runs with no console or terminal errors
2. Feature tested in the browser on desktop and mobile width
3. README updated if needed
4. Short summary for the user: what changed, what to test, and what they need to do (if anything)