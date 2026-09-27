# Lighter DB v10 — Cloud setup

v10 is local-first. If cloud is not configured, the app continues to work exactly like v9.

## Supabase
1. Create a Supabase project.
2. In SQL Editor, run `supabase-setup.sql` once.
3. In Project settings / API keys, copy:
   - Project URL
   - Publishable key (`sb_publishable_...`). Legacy anon key also works, but publishable key is preferred.
4. In Lighter DB > 雲端, paste both values and save.
5. Sign in with Email magic link, or enable Google provider first and use Google login.
6. Press `立即備份到雲端` once. The first sync uploads collection photos; later syncs only changed photos.

## Google login (optional)
Supabase Google sign-in needs Google OAuth configuration. Add your GitHub Pages origin and redirect URL in both Google and Supabase Auth redirect settings.
For the current app, the redirect URL is your normal Lighter DB GitHub Pages URL.

## Cloudflare Worker AI protection
After Supabase login works, update the Cloudflare Worker with v10 `cloudflare-worker.js`, then add these Worker variables:
- `SUPABASE_URL` = your Supabase Project URL
- `SUPABASE_PUBLISHABLE_KEY` = your Supabase publishable key

Keep the existing `OPENAI_API_KEY` as a Secret.
When both Supabase variables exist, `/analyze` requires a valid signed-in user's Bearer token. `/health` remains public.

## Security notes
- `OPENAI_API_KEY` stays only in Cloudflare Secret. Never put it in GitHub or the browser.
- Supabase publishable key is intentionally safe to ship in a browser **only when RLS policies are correct**.
- `supabase-setup.sql` enables RLS so each authenticated user can read/write only their own row and photo folder.
- Keep JSON export backups even after cloud sync.
