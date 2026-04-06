# Gewiss CRM — Electric Project Tracker

## Stack
- **Frontend:** Next.js 14 (Static Export), React 18, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Cloudflare Pages

## Setup
..
### 1. Supabase
1. Create project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in SQL Editor
3. Create admin user: Authentication → Users → Add User (email: `admin@gewiss.local`)
4. Run SQL: `UPDATE public.users SET username='admin', company_name='Gewiss Romania', role='admin' WHERE id='<uuid>';`

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in values from Supabase → Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Cloudflare Pages Deploy
1. Push code to GitHub
2. Cloudflare Pages → New Project → Connect GitHub repo
3. Build settings:
   - Framework: Next.js (Static HTML Export)
   - Build command: `npm run build`
   - Output directory: `out`
4. Add the 3 environment variables
5. Deploy

## Login
- Admin: username `admin`, password set in Supabase
- Designers: created by admin via "Add Designer" in sidebar
- Email format: `{username}@gewiss.local`
