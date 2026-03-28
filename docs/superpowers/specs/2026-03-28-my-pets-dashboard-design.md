# My Pets Dashboard — Design Spec

## Overview

Add a `/dashboard` page that displays all pets belonging to the signed-in user as a card grid. This replaces the current post-login redirect (which goes to `/pet/[id]`) and gives returning users a central hub for all their pets.

## New Page: `/dashboard`

- **Route**: `/dashboard` (`src/app/dashboard/page.tsx`)
- **Auth**: Requires signed-in user. If not authenticated, redirect to `/`.
- **Title**: `"{firstName}'s Pawdise"` — extract first name from Supabase user metadata.
- **Layout**: Card grid, responsive (1 col mobile, 2 col tablet, 3 col desktop).
- **Card content**: Pixel art image + pet name. If `pixel_art_url` is null, show species emoji as placeholder.
- **Card interaction**: Click → navigate to `/pet/[id]`.
- **Empty state**: "You don't have any pets yet" + "Create my first pet" button → `/create`.
- **Styling**: Cosmic design tokens, Starfield background, fade-in animations consistent with existing pages.

## New API: `GET /api/pets/mine`

- **Location**: `src/app/api/pets/mine/route.ts`
- **Auth**: Extract user from Authorization Bearer token (or Supabase session). Return 401 if unauthenticated.
- **Query**: `SELECT id, name, species, pixel_art_url FROM pets WHERE user_id = :userId ORDER BY created_at DESC`
- **Response**: `{ pets: [{ id, name, species, pixel_art_url }] }`

## Modify: `/auth/callback`

- **Current behavior**: Claim pet → redirect to `/pet/[id]`.
- **New behavior**: Claim pet (if `pawdise_pet_id` exists in localStorage) → redirect to `/dashboard`.
- If no pet to claim, still redirect to `/dashboard`.

## Modify: Landing page `/`

- Add a "Login" button alongside the existing "Create my pet" CTA.
- Login triggers `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })`.
- Already-authenticated users who land on `/` could optionally be redirected to `/dashboard`, but not required for MVP.

## File Ownership

- `/dashboard` page + components → Person B (Frank, frontend)
- `/api/pets/mine` route → Person A (backend) — but Frank can create it since it's a simple query
- `/auth/callback` changes → Person B (Frank, frontend)
- Landing page login button → Person B (Frank, frontend)

## Out of Scope

- Edit/delete pets from dashboard
- Sorting or filtering
- Pagination (unlikely to have enough pets to need it in hackathon context)
