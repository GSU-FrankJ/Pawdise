# CLAUDE.md — Pawdise Project Context

## What is this?

Pawdise is a web app for pet owners who have lost their pets. Users upload a photo of their pet, and we generate a pixel art version of the pet living happily in a virtual world ("Pawdise"). The owner can check in to see what their pet is doing — no chat, no dialogue, just quietly watching their pet live on.

**This is a 10-hour hackathon project. Speed over perfection.**

## Tech Stack

- **Frontend + API**: Next.js 14 (App Router), deployed on Vercel
- **Database + Storage + Auth**: Supabase (Postgres, Supabase Storage, Google OAuth)
- **Text AI**: Anthropic Claude API (claude-sonnet-4-6) — generates pet activity descriptions (no chat, observation only)
- **Image AI**: Replicate (nerijs/pixel-art-xl) — generates pixel art from pet photos
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/
│   │   └── page.tsx                # 3-step pet creation form
│   ├── pet/
│   │   └── [id]/
│   │       └── page.tsx            # Pet view (emotional loading → ready state)
│   └── api/
│       └── pets/
│           ├── route.ts            # POST /api/pets
│           └── [id]/
│               ├── route.ts        # GET /api/pets/[id]
│               ├── upload-photo/
│               │   └── route.ts    # POST — photo upload + trigger Replicate
│               ├── pixel-art-status/
│               │   └── route.ts    # GET — poll Replicate job
│               ├── activity/
│               │   └── route.ts    # GET — Claude generates activity
│               └── claim/
│                   └── route.ts    # POST — associate guest pet with user
├── components/
│   ├── EmotionalLoading.tsx        # Loading page: rotating warm messages, particle animation, shimmer sprite
│   ├── PetScene.tsx                # Ready state: pixel art + activity text + scene details
│   └── ...                         # Other shared UI components
├── lib/
│   ├── supabase.ts                 # Supabase client init
│   ├── replicate.ts                # Replicate API helpers
│   └── claude.ts                   # Claude API helpers
└── public/
    └── sprites/                    # Fallback pixel art sprites (dog.png, cat.png, etc.)
```

## File Ownership (Three Developers)

**Person A — Backend + AI** (macOS, Claude Code)
- `src/app/api/**` — all API routes
- `src/lib/**` — Supabase, Replicate, Claude helpers
- Supabase table setup and Storage config
- `public/sprites/` — fallback assets

**Person B — Frontend + UI** (macOS, Claude Code)
- `src/app/page.tsx` — landing page
- `src/app/create/**` — creation form
- `src/app/pet/**` — pet view page (emotional loading → ready state)
- `src/components/**` — all UI components (EmotionalLoading, PetScene, etc.)
- Styling, animations, responsive design

**Person C** (Windows, ChatGPT)
- 大部分代码手写，不绑定固定模块
- 修改文件前先和 A/B 确认，避免冲突

**Shared (coordinate before editing)**
- `CLAUDE.md`, `.env.example`, `package.json`, `tailwind.config.ts`

## API Contract

### POST /api/pets
```json
// Request
{ "name": "Mochi", "species": "cat", "breed": "orange tabby", "traits": "playful, stubborn", "habits": "loves tuna", "bio": "My best friend for 12 years", "session_id": "uuid" }
// Response
{ "id": "uuid" }
```

### GET /api/pets/[id]
```json
// Response
{ "id": "uuid", "name": "Mochi", "species": "cat", "breed": "orange tabby", "traits": "...", "habits": "...", "bio": "...", "original_photo_url": "https://...", "pixel_art_url": "https://..." | null, "replicate_job_id": "...", "current_activity": "Mochi is chasing butterflies...", "current_scene": "cosmic meadow", "last_activity_at": "2026-03-28T..." }
```

### POST /api/pets/[id]/upload-photo
```json
// Request: multipart form data with "photo" file field
// Response
{ "original_photo_url": "https://...", "replicate_job_id": "..." }
```

### GET /api/pets/[id]/pixel-art-status
```json
// Response
{ "status": "processing" | "complete" | "failed", "pixel_art_url": "https://..." | null }
```

### GET /api/pets/[id]/activity
```json
// Response
{ "activity": "Mochi found a sunny spot...", "scene": "cosmic meadow", "generated_at": "2026-03-28T..." }
```

### POST /api/pets/[id]/claim
```json
// Request
{ "session_id": "uuid" }
// Response
{ "success": true }
```

## Design Tokens

```
Background:    #1A1035 (cosmic-bg)
Surface:       #2D1B69 (cosmic-surface)
Gold accent:   #F5C842 (cosmic-glow)
Text:          #FAF7F2 (cosmic-text)
Muted text:    #B8A9D4 (cosmic-muted)
Interactive:   #7C5CBF (cosmic-accent)
```

## Code Style

- Format with Prettier before committing (config in `.prettierrc`)
- Use TypeScript for all files
- Use `async/await`, not `.then()` chains
- Components: PascalCase filenames (`PetCard.tsx`)
- Utilities/lib: camelCase filenames (`supabase.ts`)
- Keep components small — extract when >80 lines

## Important Rules

- **No `console.log` in committed code** — use proper error handling
- **Never commit `.env.local`** — use `.env.example` as reference
- **Always handle loading and error states** — no blank screens
- **Mobile-first** — design for 375px width first, then scale up
- **Pixel art multi-layer fallback** — Layer 1: auto-retry with different seed → Layer 2: text-only prompt fallback → Layer 3: species sprite from `/public/sprites/`
- **Emotional loading page** — rotating warm messages personalized with pet name, minimum 5s display even if generation is instant, reassurance message after 30s
- **Demo data** — pre-generate 2–3 pets (dog, cat, rabbit) with pixel art + activity stored in Supabase for reliable demo
