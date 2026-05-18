# DataKeeper - Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or sign in if you have an account
3. Create a new organization
4. Create a new project:
   - **Project name:** `datakeeper-accounting` (or your choice)
   - **Database password:** Create a strong password and save it
   - **Region:** Choose closest to your location
   - **Pricing plan:** Free tier is sufficient for development

## Step 2: Get Your Credentials

Once project is created:

1. Go to **Settings → API**
2. Copy your credentials:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon key** (public, safe to use in frontend)
   - **service_role key** (keep secret, use only in backend)

## Step 3: Create Database Tables

The SQL script below creates all required tables. Follow these steps:

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the SQL from `sql/setup.sql` (see Step 6 below)
4. Click **Run**

Or use the direct SQL commands listed in `SUPABASE_SQL_SETUP.md`

## Step 4: Configure Frontend

1. Update `.env.local` file (create if doesn't exist):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. The app will automatically use Supabase instead of localStorage

## Step 5: Enable Authentication

1. Go to **Authentication → Providers**
2. Ensure **Email** provider is enabled (default)
3. Go to **Email Templates** and customize if needed

## Step 6: Set Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

Policies are automatically created via SQL script.

## Step 7: Enable Realtime (Optional)

For live data updates:
1. Go to **Replication** in table settings
2. Enable Realtime for: `materials`, `sales`

## Troubleshooting

**"Invalid API key"?**
- Verify you're using the `anon` key, not `service_role`
- Check URL format (should start with https://)

**"Permission denied"?**
- Ensure RLS policies are created correctly
- Check user is authenticated

**Signup not working?**
- Go to **Authentication → Email Templates → Confirm Signup**
- Ensure email is configured

---

**Next Steps:**
1. Create the project on supabase.com
2. Get your credentials
3. Run the SQL setup script
4. Update .env.local
5. Restart the dev server
