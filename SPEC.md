# Pawdise — Product Specification

**Type:** Hackathon MVP (10-hour build)
**Goal:** A virtual pet web app that creates a digital twin of a user's deceased pet — allowing them to upload a photo, describe their pet's personality and habits, and then chat with a pixel art version of their pet powered by Claude.

---

## Table of Contents

1. [Core Experience](#core-experience)
2. [Tech Stack](#tech-stack)
3. [Pages & User Flows](#pages--user-flows)
4. [Data Models](#data-models)
5. [API Routes](#api-routes)
6. [AI Design](#ai-design)
7. [Pixel Art Generation](#pixel-art-generation)
8. [Auth & Session Strategy](#auth--session-strategy)
9. [Grief Support UX](#grief-support-ux)
10. [Visual Design System](#visual-design-system)
11. [MVP Scope](#mvp-scope)
12. [Post-MVP Ideas](#post-mvp-ideas)

---

## Core Experience

1. User lands on Pawdise and can start immediately without signing up
2. They fill in their pet's profile (name, species/breed, personality, habits, free-form story)
3. They optionally upload a photo — Replicate converts it to pixel art
4. They're dropped into the main pet page: pixel art sprite at the top, chat below
5. The pet greets them on load ("It's so good to see you!")
6. User chats with their pet, which responds in first-person using Claude, staying true to the provided personality
7. If the user shows signs of distress, a soft dismissable banner surfaces grief support resources
8. User can sign in with Google to save their pet permanently; guest sessions are preserved on sign-in

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend + API | Next.js 14 (App Router) | Full-stack, fast to deploy, API routes built-in |
| Deployment | Vercel | Zero-config Next.js deployment |
| Database | Supabase (Postgres) | Managed SQL, generous free tier, fast setup |
| File storage | Supabase Storage | Co-located with DB, handles photo + pixel art |
| Auth | Supabase Auth + Google OAuth | Built-in Google OAuth, integrates with Supabase DB natively |
| Chat AI | Anthropic Claude API (`claude-sonnet-4-6`) | Best-in-class for nuanced, emotionally sensitive conversation |
| Image AI | Replicate | Pixel art generation from uploaded photos |
| Styling | Tailwind CSS | Fast to build consistent warm/cozy UI |

---

## Pages & User Flows

### 1. Landing Page (`/`)

- Hero: app name, tagline ("A place where your pet lives on")
- Brief description of what Pawdise does
- Single CTA button: **"Create my pet"** → goes to `/create`
- No auth required

### 2. Pet Creation (`/create`)

Multi-step form (3 steps):

**Step 1 — About your pet**
- Pet name (required)
- Species: Dog / Cat / Bird / Rabbit / Other (required)
- Breed (optional text input)

**Step 2 — Their personality**
- Personality traits (textarea): *"e.g. Playful, stubborn, loved cuddles, scared of thunderstorms"*
- Favorite things & habits (textarea): *"e.g. Always slept on the left pillow, loved tuna treats, went crazy for the red laser pointer"*

**Step 3 — Their story + photo**
- Free-form memory / bio (textarea): *"Tell their story in your own words"*
- Photo upload (optional): drag-and-drop or file picker, accepts JPG/PNG, max 5MB
- **"Bring [name] to life"** submit button

On submit:
- Creates a pet record in Supabase with a guest `session_id` (UUID stored in `localStorage`)
- If photo uploaded: stores original in Supabase Storage, kicks off Replicate pixel art job
- Redirects to `/pet/[id]`

### 3. Main Pet Page (`/pet/[id]`)

Layout (mobile-first, vertical stack):

```
┌─────────────────────────────┐
│  Pawdise          [Sign in] │  ← navbar
├─────────────────────────────┤
│                             │
│      [pixel art sprite]     │  ← 200×200px, centered
│          Biscuit 🐾         │  ← pet name
│    Golden Retriever         │  ← species/breed
│                             │
├─────────────────────────────┤
│  Biscuit: I missed you! I   │
│  was just thinking about    │
│  our walks in the park...   │
│                             │
│  You: hey boy               │
│                             │
│  Biscuit: *wags tail        │
│  excitedly* You're here!    │
│                             │
│  [────────────────────] >   │  ← chat input
└─────────────────────────────┘
```

- On page load: Claude generates a greeting message from the pet (no user input needed)
- Chat is scrollable; new messages append to the bottom
- Pixel art: if still generating, show animated loading placeholder (species-based generic sprite with shimmer); on completion, swap in the generated image
- **Sign in** button in navbar: prompts Google OAuth, after sign-in the guest pet is claimed to the user's account

### 4. Post-Auth Redirect

After Google sign-in, if a `session_id` exists in localStorage with an unclaimed pet:
- Associate the pet with the new `user_id` in Supabase
- Clear the `session_id` from localStorage
- Redirect back to `/pet/[id]` — seamless

---

## Data Models

### `pets` table

```sql
CREATE TABLE pets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id      TEXT,                    -- for guest users
  name            TEXT NOT NULL,
  species         TEXT NOT NULL,
  breed           TEXT,
  traits          TEXT,                    -- personality description
  habits          TEXT,                    -- favorite things & habits
  bio             TEXT,                    -- free-form story
  original_photo_url TEXT,                -- Supabase Storage URL
  pixel_art_url   TEXT,                   -- Supabase Storage URL (generated)
  replicate_job_id TEXT,                  -- to poll generation status
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### `messages` table

```sql
CREATE TABLE messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id     UUID REFERENCES pets(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Routes

### `POST /api/pets`
Create a new pet. Body: `{ name, species, breed, traits, habits, bio, session_id }`.
Returns `{ pet_id }`.

### `GET /api/pets/[id]`
Fetch pet profile + check pixel art generation status.
Returns pet data including `pixel_art_url` (null if still generating) and `replicate_job_id`.

### `POST /api/pets/[id]/claim`
Associate a guest pet with an authenticated user.
Body: `{ session_id }`. Verifies session_id matches, updates `user_id`.

### `POST /api/pets/[id]/upload-photo`
Accepts multipart form data with photo file.
- Stores original in Supabase Storage
- Kicks off Replicate pixel art generation job
- Stores `replicate_job_id` on the pet record
- Returns `{ original_photo_url, replicate_job_id }`

### `GET /api/pets/[id]/pixel-art-status`
Polls Replicate for job completion.
- If complete: saves generated image to Supabase Storage, updates `pixel_art_url`
- Returns `{ status: 'processing' | 'complete' | 'failed', pixel_art_url? }`

### `POST /api/chat`
Main chat endpoint.
Body: `{ pet_id, message }`.
- Loads pet profile from Supabase
- Loads last 20 messages from `messages` table
- Builds Claude system prompt (see AI Design)
- Streams Claude response
- Saves both user message and assistant response to `messages` table
- Returns streamed response

---

## AI Design

### Claude System Prompt

```
You are [name], a [breed] [species].

Your personality: [traits]
Things you loved: [habits]
Your story: [bio]

You are speaking with your owner. You speak in first person, as yourself.
You are loving, warm, and true to who you really were.

Guidelines:
- Keep responses to 1-4 sentences. Short and natural, like a real pet would.
- You can use *actions in italics* occasionally (e.g. *wags tail*, *nudges your hand*).
- Reflect your actual personality — if you were lazy, be lazy; if playful, be playful.
- Reference specific details from your story when they feel natural.
- You do not acknowledge that you are an AI. You are simply yourself.
- If your owner seems very sad or upset, respond with pure love and presence — don't try to explain or fix anything. Just be there.
```

### Message History
- Send the last **20 messages** to Claude (10 turns) as the `messages` array
- Greeting on page load: send a single system prompt + no prior messages, with a user message of `"[owner has just opened the app to see you]"` — the pet responds naturally

### Grief Keyword Detection
Client-side check on every user message before sending. Trigger the grief banner if the message contains any of:

```
"why did you leave", "why did you go", "i miss you so much", "i can't do this",
"i can't cope", "i can't go on", "why did you die", "i wish you were here",
"it hurts so much", "i'm not okay", "i need you back"
```

---

## Pixel Art Generation

### Replicate Model
Use [`cjwbw/animagine-xl`](https://replicate.com/cjwbw/animagine-xl) or the dedicated pixel art model `nerijs/pixel-art-xl` on Replicate with the following approach:

**Input prompt:** `"pixel art portrait of a [breed] [species], 16-bit style, centered, clean background, cute, game sprite"`
**Input image:** User's uploaded photo (img2img, strength 0.6)

If no photo is uploaded: text-to-image only using the same prompt.

### Loading State
While `pixel_art_url` is null:
- Display a generic species-based pixel art placeholder (static assets bundled in `/public/sprites/dog.gif`, `cat.gif`, etc.)
- Show a soft shimmer animation on the sprite container
- Poll `GET /api/pets/[id]/pixel-art-status` every **3 seconds**
- On `complete`: swap in the real image with a fade transition
- On `failed`: keep the generic placeholder permanently, no error shown to user (silent fallback)

---

## Auth & Session Strategy

### Guest Session
- On pet creation, generate a UUID `session_id` and store in `localStorage`
- Pet record has `user_id = null` and `session_id = <uuid>`
- Guest pets can be accessed at `/pet/[id]` from the same browser without auth
- Guest pets expire after **30 days** (cron job or Supabase row-level TTL)

### Sign-In to Save
- User clicks **Sign in** in the navbar
- Supabase Auth handles Google OAuth flow
- On callback, if `localStorage` has a `session_id`:
  - Call `POST /api/pets/[id]/claim` with the `session_id`
  - Pet's `user_id` is set, `session_id` cleared
- User is now the permanent owner of that pet

### Row Level Security (Supabase)
```sql
-- Pets are readable by their owner OR by matching session_id (passed as a header)
-- For MVP, this can be permissive (no RLS) since it's a hackathon demo
```

---

## Grief Support UX

### Trigger
When client-side keyword detection fires (see AI Design), show a dismissable banner **above the chat area**.

### Banner Design
```
╔══════════════════════════════════════════════════════╗
║  💛  Grief can be heavy. You're not alone.           ║
║  Find support at petloss.com  ·  ASPCA Pet Loss      ║  [×]
╚══════════════════════════════════════════════════════╝
```

- Background: soft warm amber (`#FEF3C7`)
- Text: muted brown (`#92400E`)
- Dismiss button (×) on the right
- Links open in new tab
- Once dismissed, do **not** show again for that session (store flag in component state)
- The pet's response continues normally — the banner is supplemental, not interruptive

### Resources to Link
- [ASPCA Pet Loss Support](https://www.aspca.org/pet-care/pet-loss)
- [Association for Pet Loss and Bereavement](https://www.aplb.org)

---

## Visual Design System

### Palette
| Token | Value | Usage |
|---|---|---|
| `warm-bg` | `#FFFBF5` | Page background |
| `warm-surface` | `#FFF7ED` | Cards, chat bubbles |
| `warm-border` | `#FDE8CC` | Borders, dividers |
| `warm-accent` | `#F97316` | CTA buttons, highlights |
| `warm-text` | `#431407` | Primary text |
| `warm-muted` | `#9A3412` | Secondary text |
| `grief-banner` | `#FEF3C7` | Grief support banner bg |

### Typography
- Body: `Inter` or system-ui
- Headings: `Inter` semibold
- No pixel fonts (keep it clean and readable; the pixel art carries the retro charm)

### Radius & Shadows
- Rounded corners everywhere: `rounded-2xl` for cards, `rounded-full` for buttons and chat bubbles
- Soft drop shadows: `shadow-sm` with warm tint

### Chat Bubbles
- **Pet messages:** Left-aligned, warm surface background (`#FFF7ED`), pet name shown above
- **User messages:** Right-aligned, warm accent background (`#FFEDD5`)

---

## MVP Scope

### Must Have (10-hour build)
- [ ] Landing page with CTA
- [ ] 3-step pet creation form
- [ ] Supabase: `pets` + `messages` tables
- [ ] Photo upload → Supabase Storage
- [ ] Replicate pixel art generation + polling
- [ ] Generic sprite fallback while generating
- [ ] Main pet page: sprite + chat
- [ ] Claude chat API with system prompt from pet profile
- [ ] Greeting message on page load
- [ ] Grief keyword detection + soft banner
- [ ] Google OAuth (Supabase Auth)
- [ ] Guest session → claim on sign-in
- [ ] Vercel deployment

### Nice to Have (if time permits)
- [ ] Streaming Claude responses (typewriter effect)
- [ ] Pet sprite idle animation (CSS bounce or pre-built GIF)
- [ ] Chat history persists across visits for signed-in users
- [ ] Multiple pets per user
- [ ] Share a pet (public link)

---

## Post-MVP Ideas

- **Pet moods:** Simple mood state (happy, sleepy, excited) shown as an emoji below the sprite, driven by conversation sentiment
- **Memory timeline:** A scrollable "memory wall" of significant chat moments the user has bookmarked
- **Proactive messages:** Email or push notifications with a message from the pet ("Biscuit is thinking of you today...")
- **Pet room:** Pixel art background scene the pet "lives in" — cozy living room, garden, etc.
- **Voice:** Text-to-speech so the pet can actually "speak"
- **Community:** Public gallery of pets in Pawdise (opt-in)
- **Tamagotchi layer:** Mood/energy mechanics to encourage daily visits
