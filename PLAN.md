# Pawdise — Project Plan

## Context

10-hour hackathon MVP. Users upload a photo of their deceased pet, describe its personality, and then see their pet living happily in a virtual pixel-art world. **No chat, no dialogue** — the owner is a quiet observer. The emotional core is *seeing* your pet happy and at peace.

- Spec: `SPEC.md`
- Tech/team context: `CLAUDE.md`

---

## Task List


| ID                                    | Description                                                                                                                                                                                                                    | Owner            | Status |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------ |
| **SETUP**                             |                                                                                                                                                                                                                                |                  |        |
| T01                                   | Initialize Next.js 14 project with TypeScript + Tailwind CSS                                                                                                                                                                   | Person A         | DONE   |
| T02                                   | Install dependencies: `@supabase/supabase-js`, `@anthropic-ai/sdk`, `replicate`                                                                                                                                                | Person A         | DONE   |
| T03                                   | Create `.env.local` from `.env.example` (Supabase URL/key, Anthropic key, Replicate key)                                                                                                                                       | Person A         | DONE   |
| T04                                   | Create Supabase `pets` table (schema per SPEC.md §Data Models — includes `current_activity`, `current_scene`, `last_activity_at`)                                                                                              | Person C         | DONE   |
| T05                                   | Configure Supabase Storage bucket for pet photos and pixel art                                                                                                                                                                 | Person C         | DONE   |
| T06                                   | Enable Google OAuth in Supabase Auth dashboard                                                                                                                                                                                 | Person A         | TODO   |
| T07                                   | Deploy skeleton to Vercel + confirm Vercel → Supabase connection works (`GET /api/health`)                                                                                                                                     | Person A         | DONE   |
| **LIB / HELPERS**                     |                                                                                                                                                                                                                                |                  |        |
| T08                                   | `src/lib/supabase.ts` — Supabase client init (browser + server)                                                                                                                                                                | Person A         | DONE   |
| T09                                   | `src/lib/replicate.ts` — helpers: trigger pixel art job (img2img + text-only fallback), poll job status, save result to Storage                                                                                                | Person A         | DONE   |
| T10                                   | `src/lib/claude.ts` — generate activity description: given pet profile + time of day + random seed, return `{ activity, scene }`                                                                                               | Person A         | DONE   |
| **API ROUTES**                        |                                                                                                                                                                                                                                |                  |        |
| T11                                   | `POST /api/pets` — create pet record with `session_id`, return `{ id }`                                                                                                                                                        | Person A         | DONE   |
| T12                                   | `GET /api/pets/[id]` — fetch pet profile, `pixel_art_url`, `current_activity`, `current_scene`                                                                                                                                 | Person A         | DONE   |
| T13                                   | `POST /api/pets/[id]/upload-photo` — store original to Supabase Storage, kick off Replicate job, return `{ original_photo_url, replicate_job_id }`                                                                             | Person A         | DONE   |
| T14                                   | `GET /api/pets/[id]/pixel-art-status` — poll Replicate; on complete save image to Storage + update DB; on fail trigger retry/fallback logic                                                                                    | Person A         | DONE   |
| T15                                   | `GET /api/pets/[id]/activity` — call Claude to generate activity based on pet profile, time of day, random seed; save to `current_activity` + `current_scene`; return `{ activity, scene, generated_at }`                      | Person A         | DONE   |
| T16                                   | `POST /api/pets/[id]/claim` — verify `session_id`, set `user_id` on pet record                                                                                                                                                 | Person A         | DONE   |
| **FRONTEND — LANDING PAGE**           |                                                                                                                                                                                                                                |                  |        |
| T17                                   | `src/app/page.tsx` — hero section, tagline ("A place where your pet lives on"), "Create my pet" CTA                                                                                                                            | Person B         | DONE   |
| T18                                   | `tailwind.config.ts` — add design tokens; implement Cosmic palette (`#1A1035` bg, `#F5C842` gold, `#7C5CBF` accent) as primary; keep Warm Amber tokens as alternative                                                          | Person B         | DONE   |
| **FRONTEND — PET CREATION**           |                                                                                                                                                                                                                                |                  |        |
| T19                                   | `src/app/create/page.tsx` — 3-step form shell with step indicator                                                                                                                                                              | Person B         | DONE   |
| T20                                   | Step 1: pet name, species selector (Dog/Cat/Bird/Rabbit/Other), breed input                                                                                                                                                    | Person B         | DONE   |
| T21                                   | Step 2: personality traits textarea, favorite things & habits textarea                                                                                                                                                         | Person B         | DONE   |
| T22                                   | Step 3: bio textarea, photo drag-and-drop upload (JPG/PNG, max 5MB), "Bring [name] to life" submit                                                                                                                             | Person B         | DONE   |
| T23                                   | On submit: generate UUID `session_id` → localStorage, call `POST /api/pets`, conditionally `POST /api/pets/[id]/upload-photo`, redirect to `/pet/[id]`                                                                         | Person B         | DONE   |
| **FRONTEND — EMOTIONAL LOADING PAGE** |                                                                                                                                                                                                                                |                  |        |
| T24                                   | Emotional loading state on `/pet/[id]`: soft gradient background, floating particle/star animation, species-based placeholder sprite with shimmer/pulse                                                                        | Person B         | DONE   |
| T25                                   | Rotating warm messages (change every 3-4s), personalized with pet name: "正在为 [name] 搭建她的新家...", "[name] is exploring the meadow for the first time...", etc.                                                                   | Person B         | DONE   |
| T26                                   | Poll `GET /api/pets/[id]/pixel-art-status` every 3s; minimum 5s display time even if generation is instant; add reassurance message after 30s ("Still working on it — good things take time")                                  | Person B         | DONE   |
| T27                                   | Transition to ready state: loading messages fade out → scene fades in → first activity text appears ("*[name]* has arrived in their new world")                                                                                | Person B         | DONE   |
| **FRONTEND — MAIN PET PAGE**          |                                                                                                                                                                                                                                |                  |        |
| T28                                   | `src/app/pet/[id]/page.tsx` — ready state layout: navbar (Sign in), full-width scene image, pet name + species badge, activity text, scene details (time of day, weather, mood)                                                | Person B         | DONE   |
| T29                                   | Scene image: fade-in transition from loading → real pixel art; fallback to species sprite if generation failed (silent, no error shown)                                                                                        | Person B         | DONE   |
| T30                                   | Activity display: call `GET /api/pets/[id]/activity` on page load; show narrative and scene context below the image                                                                                                            | Person B         | DONE   |
| **AUTH**                              |                                                                                                                                                                                                                                |                  |        |
| T31                                   | Navbar "Sign in" button triggers Supabase Google OAuth flow                                                                                                                                                                    | Person B         | BLOCKED (T06) |
| T32                                   | Auth callback: if localStorage has `session_id`, call `POST /api/pets/[id]/claim`, clear `session_id`, redirect to `/pet/[id]`                                                                                                 | Person B         | BLOCKED (T06, T31) |
| **ASSETS**                            |                                                                                                                                                                                                                                |                  |        |
| T33                                   | Add fallback pixel art sprites to `public/sprites/`: `dog.png`, `cat.png`, `bird.png`, `rabbit.png`, `other.png`                                                                                                               | Person A         | DONE   |
| **PERSON C — ACTIVITY & DEMO**        |                                                                                                                                                                                                                                |                  |        |
| T34                                   | Claude activity prompt design: craft and test the prompt template for `GET /api/pets/[id]/activity` — incorporate pet traits, habits, bio, time-of-day, and random seed for variety                                            | Person C         | TODO   |
| T35                                   | Pre-generate demo data: run full pipeline for 2-3 pets (dog, cat, rabbit); store `pixel_art_url` + `current_activity` in Supabase; verify they load correctly on the pet page                                                  | Person C         | TODO   |
| T36                                   | Multi-layer failure handling in `GET /api/pets/[id]/pixel-art-status`: Layer 1 auto-retry (different seed), Layer 2 text-only prompt fallback, Layer 3 use species sprite — coordinate with Person A on `src/lib/replicate.ts` | Person C         | TODO   |
| **DEPLOYMENT & QA**                   |                                                                                                                                                                                                                                |                  |        |
| T37                                   | Smoke test end-to-end: create pet → upload photo → emotional loading page → pixel art ready → activity shown → sign in → claim                                                                                                 | Person A + B + C | TODO   |
| T38                                   | Mobile responsive check: test on iPhone SE (375px) and iPhone 14 (390px) viewport sizes                                                                                                                                        | Person B         | DONE   |


---

## Owner Summary


| Owner    | Task IDs          | Focus                                                                      |
| -------- | ----------------- | -------------------------------------------------------------------------- |
| Person A | T01–T16, T33, T37 | Project setup, DB, lib helpers, all API routes                             |
| Person B | T17–T32, T38      | All frontend: landing, creation form, emotional loading, pet page, auth UI |
| Person C | T15, T34–T37      | Activity API, Claude prompt design, demo data, failure handling            |


---

## 10-Hour Timeline (from SPEC.md)


| Phase                              | Hours | Goals                                                                         | Checkpoint                                     |
| ---------------------------------- | ----- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 1 — Skeleton                 | 0–1   | T01–T07: Next.js init, Supabase tables, env vars, Vercel deploy, health check | Vercel page live + API can read/write Supabase |
| Phase 2 — Backend API              | 1–3   | T08–T16: All lib helpers + API routes                                         | Full API flow works via curl/Postman           |
| Phase 3 — Frontend                 | 3–6   | T17–T32: Landing, creation, loading page, pet page, mobile responsive         | Full user journey runs end-to-end              |
| Phase 4 — Polish + Auth + Fallback | 6–8   | T31–T36: Google OAuth, claim, visual polish, error handling, demo data        | Demo data ready, auth works                    |
| Phase 5 — Demo Prep                | 8–10  | T37–T38: QA, rehearsal, pitch script, backup screenshots                      | Smooth 2-min demo, fallback data 100% ready    |


---

## Dependencies & Coordination

- **T15 depends on T08, T10** — Person C's activity route needs Supabase client and Claude helper from Person A
- **T34 informs T15** — finalize the Claude prompt before wiring T15
- **T36 depends on T09** — failure handling extends Person A's replicate lib; coordinate before editing
- **T26, T30 depend on T15** — frontend polling and activity display need the activity endpoint live
- **T23 depends on T11, T13** — form submit requires both API routes deployed

---

## Critical Files


| File                                      | Owner                                       | Used By                         |
| ----------------------------------------- | ------------------------------------------- | ------------------------------- |
| `src/lib/supabase.ts`                     | Person A                                    | All API routes, T15             |
| `src/lib/replicate.ts`                    | Person A (base) / Person C (failure layers) | T13, T14, T36                   |
| `src/lib/claude.ts`                       | Person A (helper) / Person C (prompt)       | T15                             |
| `src/app/api/pets/[id]/activity/route.ts` | Person C                                    | T30 (pet page activity display) |
| `src/app/pet/[id]/page.tsx`               | Person B                                    | Core experience                 |


---

## Pitfall Reminders (from SPEC.md)


| Risk                                        | Mitigation                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------ |
| Pixel art looks nothing like the real pet   | Test many prompt variants; prepare pre-generated fallback (T35)                      |
| API latency kills the experience            | Emotional loading page is the mitigation (T24–T27); parallel image + text generation |
| Integration "glue work" eats time           | Confirm Vercel → Supabase connection by Hour 1 (T07)                                 |
| Style inconsistency across generated images | Lock Replicate model params (seed, strength, guidance_scale) in T09                  |
| Supabase cold start delays                  | Wake DB manually 5 min before demo                                                   |
| Mobile layout breaks                        | Mobile-first from day one; test at 375px (T38)                                       |


---

## Verification (End-to-End)

1. `npm run dev` → open `http://localhost:3000`
2. Click "Create my pet" → complete 3 steps → upload photo → submit
3. Confirm emotional loading page with rotating messages and sprite animation
4. Wait min 5s → pixel art fades in; activity text appears below scene
5. Confirm activity text is coherent with pet's personality/habits
6. Click "Sign in" → Google OAuth → confirm pet is claimed (user_id set in Supabase)
7. Reload page → pet page still shows correctly for signed-in user
8. Test fallback: simulate Replicate failure → confirm species sprite shows, no error displayed

