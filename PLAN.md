# Pawdise — Project Plan

## Context

10-hour hackathon MVP. Users upload a photo of their deceased pet, describe its personality, and chat with a pixel-art version powered by Claude. No source code exists yet — this covers full implementation from scratch.

- Spec: `SPEC.md`
- Tech/team context: `CLAUDE.md`

---

## Task List

| ID  | Description | Owner | Status |
|-----|-------------|-------|--------|
| **SETUP** ||||
| T01 | Initialize Next.js 14 project with TypeScript + Tailwind CSS | Person A | TODO |
| T02 | Install dependencies: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `replicate` | Person A | TODO |
| T03 | Create `.env.local` from `.env.example` (Supabase URL/key, Anthropic key, Replicate key) | Person A | TODO |
| T04 | Create Supabase `pets` table (schema per SPEC.md §Data Models) | Person A | TODO |
| T05 | Create Supabase `messages` table (schema per SPEC.md §Data Models) | Person A | TODO |
| T06 | Configure Supabase Storage bucket for pet photos and pixel art | Person A | TODO |
| T07 | Enable Google OAuth in Supabase Auth dashboard | Person A | TODO |
| **LIB / HELPERS** ||||
| T08 | `src/lib/supabase.ts` — Supabase client init (browser + server) | Person A | TODO |
| T09 | `src/lib/replicate.ts` — helpers: trigger pixel art job, poll job status, save result to Storage | Person A | TODO |
| T10 | `src/lib/claude.ts` — helpers: build system prompt from pet profile, call Claude chat API | Person A | TODO |
| **API ROUTES** ||||
| T11 | `POST /api/pets` — create pet record with `session_id`, return `{ id }` | Person A | TODO |
| T12 | `GET /api/pets/[id]` — fetch pet profile + current `pixel_art_url` | Person A | TODO |
| T13 | `POST /api/pets/[id]/upload-photo` — store original to Supabase Storage, kick off Replicate job, return `{ original_photo_url, replicate_job_id }` | Person A | TODO |
| T14 | `GET /api/pets/[id]/pixel-art-status` — poll Replicate, on complete save image to Storage + update DB, return `{ status, pixel_art_url }` | Person A | TODO |
| T15 | `POST /api/chat` — load pet + last 20 messages, stream Claude response, persist both messages to DB | Person C | TODO |
| T16 | `POST /api/pets/[id]/claim` — verify `session_id`, set `user_id` on pet record | Person A | TODO |
| **FRONTEND — LANDING PAGE** ||||
| T17 | `src/app/page.tsx` — hero section, tagline, "Create my pet" CTA button | Person B | TODO |
| T18 | Apply warm design tokens from SPEC.md (`#FFFBF5` bg, `#F97316` accent, etc.) in `tailwind.config.ts` | Person B | TODO |
| **FRONTEND — PET CREATION** ||||
| T19 | `src/app/create/page.tsx` — 3-step form shell with step indicator | Person B | TODO |
| T20 | Step 1: pet name, species selector (Dog/Cat/Bird/Rabbit/Other), breed input | Person B | TODO |
| T21 | Step 2: personality traits textarea, favorite things & habits textarea | Person B | TODO |
| T22 | Step 3: bio textarea, photo drag-and-drop upload (JPG/PNG, max 5MB), "Bring [name] to life" submit | Person B | TODO |
| T23 | On submit: generate UUID `session_id` → localStorage, call `POST /api/pets`, conditionally `POST /api/pets/[id]/upload-photo`, redirect to `/pet/[id]` | Person B | TODO |
| **FRONTEND — PET PAGE** ||||
| T24 | `src/app/pet/[id]/page.tsx` — layout: navbar (Sign in), sprite area, chat area | Person B | TODO |
| T25 | Sprite component: show species placeholder GIF from `/public/sprites/` while generating; poll `GET /api/pets/[id]/pixel-art-status` every 3s; swap in real image with fade on complete | Person B | TODO |
| T26 | Chat bubble components: left-aligned (pet), right-aligned (user), warm surface colors per design system | Person B | TODO |
| T27 | Chat input bar with send button | Person B | TODO |
| T28 | On page load: call `POST /api/chat` with `"[owner has just opened the app to see you]"` to generate greeting | Person B | TODO |
| T29 | Chat message send: call `POST /api/chat`, stream response, append bubbles | Person B | TODO |
| T30 | Grief keyword detection: client-side check on each user message before sending; trigger banner if matched | Person B | TODO |
| T31 | Grief support banner: amber bg (`#FEF3C7`), ASPCA + APLB links (new tab), dismiss button (×), show once per session | Person B | TODO |
| **AUTH** ||||
| T32 | Navbar "Sign in" button triggers Supabase Google OAuth flow | Person B | TODO |
| T33 | Auth callback: if localStorage has `session_id`, call `POST /api/pets/[id]/claim`, clear `session_id`, redirect to `/pet/[id]` | Person B | TODO |
| **ASSETS** ||||
| T34 | Add fallback pixel art sprites to `public/sprites/`: `dog.gif`, `cat.gif`, `bird.gif`, `rabbit.gif`, `other.gif` | Person A | TODO |
| **PERSON C — CROSS-CUTTING** ||||
| T37 | Grief keyword list: define and export keyword array (used by T30 client-side detection and T15 server-side) | Person C | TODO |
| T38 | Claude system prompt builder: given pet profile object, return formatted prompt string used by T15 — coordinate with Person A on `src/lib/claude.ts` interface before writing | Person C | TODO |
| T39 | Message history helper: query last 20 messages for a `pet_id` from Supabase, return in Claude `messages[]` format — depends on T08 | Person C | TODO |
| T40 | End-to-end integration test script: create pet via API → upload photo → poll status → send chat message → verify response saved in DB | Person C | TODO |
| **DEPLOYMENT** ||||
| T35 | Deploy to Vercel, set all env vars in Vercel dashboard | Person A | TODO |
| T36 | Smoke test end-to-end: create pet → upload photo → view pixel art → chat → sign in → claim | Person A + B + C | TODO |

---

## Owner Summary

| Owner | Task IDs | Focus |
|-------|----------|-------|
| Person A | T01–T14, T16, T34, T35 | Project setup, Supabase DB/Storage, lib helpers, all API routes except `/api/chat` |
| Person B | T17–T33 | All frontend: landing page, creation form, pet page, auth UI, grief banner |
| Person C | T15, T37–T40 | `POST /api/chat`, grief keyword list, Claude prompt builder, message history helper, integration tests |
| All | T36 | Final smoke test |

---

## Dependencies & Coordination

- **T15 depends on T08, T38, T39** — Person C should not start T15 until Person A has merged `src/lib/supabase.ts`
- **T38** — Person C must agree on the `buildSystemPrompt()` interface with Person A before touching `src/lib/claude.ts`
- **T30 depends on T37** — Person B imports the keyword list from Person C's export
- **T23 depends on T11, T13** — frontend submit flow requires both API routes to be live
- **T28, T29 depend on T15** — greeting and chat sending require `/api/chat` to exist

---

## Critical Files

| File | Owner | Used By |
|------|-------|---------|
| `src/lib/supabase.ts` | Person A | All API routes, T39 |
| `src/lib/claude.ts` | Person A (interface) / Person C (prompt builder) | T15 |
| `src/lib/replicate.ts` | Person A | T13, T14 |
| `src/app/api/pets/route.ts` | Person A | T23 (frontend form submit) |
| `src/app/api/chat/route.ts` | Person C | T28, T29 (pet page) |
| `src/app/pet/[id]/page.tsx` | Person B | Core user experience |

---

## Verification

1. Run `npm run dev`, open `http://localhost:3000`
2. Click "Create my pet" → complete all 3 steps → upload a photo → submit
3. Confirm redirect to `/pet/[id]`, species placeholder GIF shows with shimmer
4. Wait up to ~30s → confirm sprite swaps to generated pixel art with fade
5. Confirm greeting message appears automatically on load
6. Send a chat message → confirm pet responds in character
7. Type a grief keyword (e.g. "i miss you so much") → confirm amber banner appears and can be dismissed
8. Click "Sign in" → complete Google OAuth → confirm pet is claimed (no duplicate record)
9. Check Supabase dashboard: `pets` row has `user_id` set, `messages` rows exist for the conversation

---

## Post-MVP (if time permits)

- Streaming Claude responses with typewriter effect
- Pet sprite idle animation (CSS bounce)
- Chat history persists across visits for signed-in users
