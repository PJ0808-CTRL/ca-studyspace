# CA Orbit (Next.js + Supabase)

This is the platform workspace. The code is already in place; you do not need to recreate the React files.

## Files that matter

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Main app and navigation |
| `app/globals.css` | Complete visual design |
| `components/Auth.tsx` | Supabase email and Google sign-in |
| `components/Landing.tsx` | Animated public homepage and product overview |
| `components/ThemeToggle.tsx` | Light/dark mode switch, saved on this device |
| `components/Dashboard.tsx` | Study logs, goals, streak, weekly chart |
| `components/Pomodoro.tsx` | Persistent focus timer with automatic study logging |
| `components/StudyPlan.tsx` | Daily planner, syllabus tracker, revisions, and flashcards |
| `components/Rooms.tsx` | Supabase Realtime chat rooms |
| `components/Community.tsx` | Discussions and replies |
| `components/Notes.tsx` | PDF/Word uploads, private/shared notes, and subject filters |
| `components/Resources.tsx` | Official ICAI resource links |
| `components/Settings.tsx` | Profile and daily goal |
| `lib/subjects.ts` | CA Foundation subject list |
| `lib/resources.ts` | Verified official ICAI links |
| `supabase/schema.sql` | Database tables, RLS policies, Realtime setup |
| `supabase/migrations/20261010_note_uploads.sql` | One-time upgrade for existing Supabase projects |
| `supabase/migrations/20261010_study_planning.sql` | One-time upgrade for planning tools |
| `.env.local.example` | Template for your Supabase URL and publishable key |

## First local setup

1. Create a Supabase project at <https://database.new>.
2. In its **SQL Editor**, open `supabase/schema.sql`, copy the entire file, and run it **once**. It creates the tables, security policies, and live chat publication.
3. In the project dashboard, click **Connect** and copy the **Project URL** and **publishable key**. Do not use the service-role or secret key.
4. In PowerShell, from `D:\ca studyspace`, run:

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

5. Edit `.env.local` and replace the two placeholders with your URL and publishable key:

   ```text
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
   ```

6. In Supabase **Authentication → URL Configuration**, set the Site URL to `http://localhost:3000` for local testing. Keep email confirmation enabled if you want students to verify their addresses.
7. Run:

   ```powershell
   npm install
   npm run dev
   ```

8. Open <http://localhost:3000>. Create an account, confirm its email if prompted, and log in.

## Enable Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/), create or select a project. In **Google Auth Platform**, configure the consent screen and create an **OAuth client ID** of type **Web application**.
2. Add `http://localhost:3000` to **Authorized JavaScript origins**. Under **Authorized redirect URIs**, paste the **Callback URL** shown in **Supabase → Authentication → Providers → Google**. For a hosted Supabase project it has the form `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`. The Google redirect goes to Supabase, not directly to localhost.
3. Copy the Google **Client ID** and **Client secret** into the same Supabase Google provider page, enable the provider, and save. Keep the client secret in Supabase; do not put it in `.env.local` or Git.
4. In **Supabase → Authentication → URL Configuration**, keep the Site URL as `http://localhost:3000` and add `http://localhost:3000` to the redirect allow list if needed. The app sends users back to that origin after Google sign-in.
5. On the CA Orbit login screen, choose **Continue with Google**. Google accounts use the same profile, notes, and community tables as email accounts. You do not need another SQL migration.

When deploying, add the production site origin to Google Authorized JavaScript origins and to Supabase redirect URLs; use the same Supabase callback URL in Google.

See [Supabase's Google setup guide](https://supabase.com/docs/guides/auth/social-login/auth-google) for current console screenshots and details.

## Appearance

Use the **Dark mode / Light mode** button on the login screen or in the app's top bar. The choice is saved in this browser, so it stays selected after refresh and sign-out.

## Enable PDF and Word note uploads in your existing project

Because your Supabase project already has the original tables, open [the note upload migration](supabase/migrations/20261010_note_uploads.sql), copy its full SQL, and run it **once** in **Supabase → SQL Editor**. This adds file details to existing notes, creates a **private** `study-notes` Storage bucket, sets a 10 MB limit for PDF/DOC/DOCX, and grants file access to the owner and to signed-in students when a note is shared. Existing text notes stay in place. New Supabase projects can run `supabase/schema.sql` instead.

After running the migration, refresh the app and open **Notes**. Choose **Upload a file**, add a title and subject, and select a PDF, DOC, or DOCX. Leave **Share with other aspirants** unchecked to keep it private. In **Shared notes**, use **Filter by subject** to browse student uploads. Downloads require a signed-in account.

## Enable Study Plan in your existing project

Open `supabase/migrations/20261010_study_planning.sql`, copy the full SQL, and run it once in **Supabase → SQL Editor**. This creates private tables for daily tasks, syllabus progress, spaced revisions, and flashcards. Refresh the app and open **Study plan**.

Marking a syllabus chapter **Completed** schedules revisions after 1, 3, 7, 15, and 30 days. In **Pomodoro**, select an unfinished planned task before starting; completed focus sessions add their minutes to that task and mark it complete when its target is reached.

## Quick test

- Log study time; the dashboard total and chart should update.
- Start a Pomodoro session with a subject and topic. When it finishes, confirm its minutes appear on the dashboard automatically.
- Add a task in Study plan, link it from Pomodoro, and confirm focused minutes update the task.
- Complete a syllabus chapter and confirm its first revision is scheduled for the next day.
- Create and review a flashcard in each subject.
- Open a room in two browsers signed in with different student accounts. A new message should appear in both without refreshing.
- Create a shared note and a discussion, then confirm another account can read and reply.
- Sign in with Google after enabling the provider, then sign out and log back in.
- Switch to dark mode, refresh, and check that it stays dark; switch back to light mode.
- Upload a PDF or Word note, then download it from **My notes**. Share a note and verify a second account can find it under its subject and download it. Confirm the second account cannot see your private note.

## Before putting it online

The resource library links to ICAI's official collections. ICAI's current Foundation archive does not provide 50 attempts per subject. Add community moderation before a public launch.
When local testing is finished, create a Git repository and push it to GitHub. `.env.local` is ignored by Git; set the same two public environment variables in your hosting service. Do not commit a Supabase secret or service-role key.
