# Lighter DB PWA v10 — Cloud Lighter DB

v10 focuses on cloud backup, account security and UI cleanup rather than adding more collector gimmicks.

## New in v10
- Supabase cloud backup / restore with local-first operation
- Google login + Email magic-link login UI
- Automatic sync after local changes (optional)
- Private cloud backup of collection photos
- Supabase RLS setup SQL: each user can access only their own data
- Cloudflare Worker can require Supabase login before OpenAI `/analyze`, preventing strangers from spending your API credits
- Reference links moved into Knowledge
- Four scattered web-search buttons merged into one `網路研究` section
- `品牌辨識筆記` renamed / consolidated as `品牌研究筆記`
- AI result actions consolidated into one `加入資料庫` action with a mode selector
- AI history no longer saves new duplicate full-resolution photo copies
- API UI keeps per-request estimate and links to official Usage instead of pretending to be a monthly bill

## Important migration behavior
- v10 still works without Supabase. Your existing local data remains available.
- Do **not** update the Cloudflare Worker with Supabase auth variables until your Supabase login works in the app.
- Once configured, the Worker checks the signed-in user's access token before calling OpenAI.

See `CLOUD_SETUP.md` and `supabase-setup.sql`.
