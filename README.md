# Professor website

React + TypeScript site with a hidden editing area, dark/light mode, and English/Nepali.
Hosting: Vercel. Login, database, and file storage: Supabase.

Defaults: Teal theme, Traditional (Merriweather) font. Nepali text uses Noto Serif Devanagari automatically.

## 1. Run it on your computer

```bash
npm install
cp .env.example .env     # then fill in the two values (step 2)
npm run dev
```

Open http://localhost:5173

## 2. Set up Supabase (about 15 minutes)

1. Go to https://supabase.com, sign in, click **New project**, and save the database password.
2. **Project Settings → API**: copy the **Project URL** and the **anon public key** into `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. **SQL Editor → New query**: open `supabase/schema.sql`, change the two emails near the bottom
   (`professor@example.com` and `you@example.com`) to the real Google emails, paste the whole file, and click **Run**.
   - Only these two emails can ever edit the site. This is enforced by the database itself.
   - To change the emails later, run in the SQL Editor:
     `delete from allowlist; insert into allowlist (email) values ('a@gmail.com'), ('b@gmail.com');`

## 3. Turn on Google sign-in

1. Go to https://console.cloud.google.com, create a project, then **APIs and Services → OAuth consent screen**
   (External, add your app name and email).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
   Under **Authorized redirect URIs** add the callback URL shown in Supabase at
   **Authentication → Providers → Google** (looks like `https://YOUR-REF.supabase.co/auth/v1/callback`).
3. Copy the **Client ID** and **Client secret** into Supabase at **Authentication → Providers → Google**, enable it, and save.
4. In Supabase, go to **Authentication → URL Configuration**:
   - **Site URL**: your live site address (for example `https://professor.vercel.app`)
   - **Redirect URLs**: add `https://professor.vercel.app/scholar-desk` and `http://localhost:5173/scholar-desk`

## 4. Deploy on Vercel

1. Push this folder to a GitHub repository.
2. At https://vercel.com click **Add New → Project**, import the repository (Vite is detected automatically).
3. Under **Environment Variables** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**. `vercel.json` already makes page links like `/research` work after a refresh.
5. Put the final Vercel address in Supabase's **Site URL** (step 3.4).

## How the professor edits the site

1. Open `your-site.com/scholar-desk`. There is no link to it anywhere on the site.
2. Click **Continue with Google** and use an allowed email. Any other account is signed out immediately.
3. Use the tabs:
   - **Profile**: name, job title, bio, office, photo (upload from phone or computer)
   - **Research, Publications, Awards, Courses**: **Add new**, **Edit**, or **Delete**. Publications accept a PDF upload.
   - **Appearance**: color theme, font, order of sections, and show/hide switches. Changes preview right away. Click **Save appearance** to publish.
4. Every text field has an **English** box and a **Nepali** box. If the Nepali box is empty, visitors reading in Nepali see the English text.
5. Visitors can switch language and dark/light mode from the top bar. Their choice is remembered.

## Security notes

- Hiding `/scholar-desk` is only convenience. The real protection is the allowlist plus Row Level Security in `schema.sql`:
  anyone can read the content, but only the two emails can add, change, delete, or upload.
- The `anon` key in the site is meant to be public. Never put the `service_role` key in this project.
- Uploaded files go to a public Supabase bucket named `media` (10 MB limit per file in the app). Don't upload anything private.
- Deleting an item does not delete its uploaded photo or PDF from storage. Clear old files in Supabase **Storage** if needed.

## Project layout

```
supabase/schema.sql     tables, security rules, storage, placeholder content
src/i18n/               English and Nepali text for menus, buttons, messages
src/contexts/           site settings, dark mode, language, login state
src/pages/              public pages
src/admin/              hidden dashboard (forms, uploads, appearance)
src/index.css           the six themes (light and dark) and fonts
```

## Adding a theme or font later

Add a color block in `src/index.css`, then add it to `src/lib/themes.ts` and to the `themes` list in both files in `src/i18n/`.
