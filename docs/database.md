# Pawdise Database Design

Database URL: https://xtegmvtawblidcsbzsgy.supabase.co

Publishable Key: sb_publishable_emH17D_LlilUR0viPFRDUw_epACGFg-

## Overview

Pawdise is a web application that allows pet owners who have lost their pets to upload a photo and see a pixel-art version of their pet living peacefully in a virtual world called **Pawdise**.

The backend uses **Supabase**, which provides:

* PostgreSQL database
* Authentication
* File storage
* Row Level Security (RLS)

The database is responsible for storing:

* user profiles
* pets
* generated images
* pet activities
* pet personality information

---

# Architecture

The system follows this relational structure:

```
auth.users
     │
     ▼
profiles
     │
     ▼
pets
     │
     │
     └── images (stored in Supabase Storage)
```

Supabase manages authentication internally through the `auth.users` table.
Application-specific user information is stored in the `profiles` table.

---

# Authentication

Authentication is handled using Supabase Auth with **Google OAuth**.

Supabase automatically maintains the following internal tables:

```
auth.users
auth.sessions
auth.identities
auth.refresh_tokens
```

Developers should **not modify these tables directly**.

A trigger automatically creates a corresponding profile when a user signs up.

---

# Tables

## profiles (Legacy)

Stores application-level user information.

| Column     | Type      | Description                |
| ---------- | --------- | -------------------------- |
| id         | uuid (PK) | References `auth.users.id` |
| username   | text      | User display name          |
| created_at | timestamp | Profile creation time      |

Example:

```
id: 4f23...
username: alice
created_at: 2026-03-27
```

---

## pets

Stores all pets belonging to users.

| Column             | Type      | Description                |
| ------------------ | --------- | -------------------------- |
| id                 | uuid (PK) | Pet ID                     |
| owner_id           | uuid (FK) | References `auth.users.id` |
| session_id         | uuid      | For guest                  |
| name               | text      | Pet name                   |
| species            | text      | Type of pet                |
| description        | text      | Description of pet         |
| breeds             | text      |                            |      
| traits             | text      | Personality description    |
| habits             | text      | Favorite habits            |
| bio                | text      | Story of the pet           |
| original_photo_url | text      | Supabase Storage URL       |
| pixel_art_url      | text      | generated pixel art URL    |
| current_activity   | text      | latest Claude-generated activity |
| current_scene      | text      | e.g. "cosmic meadow"       |
| replicate_job_id   | text      | Image generation job ID    |
| created_at         | timestamptz | Creation time            |
| last_activity_at   | timestamptz | Last activity            |

Example:

```
name: Luna
traits: Curious, gentle
```

---

# Storage

Images are stored in Supabase Storage rather than the database.

Two storage buckets are used:

```
pet-photos/
pixel-art/
```

Example path:

```
pet-photos/{pet_id}/pet.png
pixel-art/{pet_id}/pixel.png
```

The database stores only the **public URL**.

---

# Security

The database uses **Row Level Security (RLS)**.

Policies ensure users can only access their own data.

Example rule:

```
users can only view pets where owner_id = auth.uid()
```

This ensures that:

* users cannot see other users’ pets
* users cannot modify other users’ data

---

# Data Flow

Example workflow:

```
1. User logs in via Google OAuth
2. Supabase creates a record in auth.users
3. A profile is automatically created
4. User uploads a pet photo
5. Photo is stored in Supabase Storage
6. Pixel art is generated and stored
7. Pet activities are periodically updated
```

* pet friendships
* activity animations
* public Pawdise galleries
