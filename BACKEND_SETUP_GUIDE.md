# DataKeeper Backend Setup - Complete Guide

## Overview

Your DataKeeper app now uses **Supabase** as the backend. This guide walks you through setting it up.

---

## Part 1: Create Supabase Project

### Step 1.1: Sign up on Supabase
1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with:
   - Email
   - GitHub (recommended for integration)
   - Google

### Step 1.2: Create a Project
1. After signing in, click **"New Project"**
2. Fill in the form:
   - **Organization**: Create new or select existing
   - **Project name**: `datakeeper-accounting`
   - **Database password**: Create a strong password (save it!)
   - **Region**: Select closest to your location (e.g., Asia, US East)
   - **Pricing plan**: Free tier is perfect for development

3. Click **"Create new project"** and wait for deployment (2-3 minutes)

---

## Part 2: Get Your API Credentials

### Step 2.1: Navigate to API Settings
1. In Supabase dashboard, click **Settings** (gear icon, bottom left)
2. Select **API** from the left sidebar
3. You'll see three important keys:

```
Project URL:     https://xxxxxxxxxxxxx.supabase.co
Anon/Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (KEEP SECRET!)
```

**IMPORTANT:**
- ✅ Use **Anon/Public Key** in frontend (.env.local)
- 🔒 Keep **Service Role Key** secret (never share or commit)

### Step 2.2: Copy Credentials
- Copy the **Project URL** (full HTTPS URL)
- Copy the **Anon/Public Key** (the long string under "public")

---

## Part 3: Set Up Database Tables

### Step 3.1: Open SQL Editor
1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**

### Step 3.2: Run Setup Script
1. Copy the entire contents of `sql/setup.sql`
2. Paste it into the query editor
3. Click **"Run"** (blue play button, top right)

You should see:
```
CREATE TABLE
CREATE POLICY
... (multiple success messages)
```

If you see errors, ensure:
- You're in the correct project
- You're in the "public" schema
- You have admin access

### Step 3.3: Verify Tables Were Created
1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - `users` ✓
   - `materials` ✓
   - `sales` ✓

---

## Part 4: Configure Frontend

### Step 4.1: Create .env.local File
1. In your frontend folder, create a new file: `.env.local`
2. Add these lines:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Replace with your actual credentials from Step 2.2

### Step 4.2: Restart Dev Server
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v8.x.x  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Part 5: Test the Setup

### Step 5.1: Sign Up
1. Open **http://localhost:5173**
2. Go to **Sign up** page
3. Create a test account:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: Any strong password

4. Click **Register**

**Expected Result**: You're logged in and see the Dashboard

### Step 5.2: Verify in Supabase
1. In Supabase, go to **Authentication** (left sidebar)
2. Click **Users**
3. You should see your test account ✓

### Step 5.3: Add Test Data
1. In the app, go to **Stock Management**
2. Click **+ Add Material**
3. Fill in:
   - Material Name: `Test Material`
   - Stock: `1000`
   - Purchase Price: `100`
   - Selling Price: `150`
4. Click **Save**

### Step 5.4: Verify in Database
1. In Supabase, go to **Table Editor**
2. Click **materials** table
3. You should see your test material ✓

**If it shows:** You're all connected! 🎉

---

## Part 6: Enable Real-time Sync (Optional)

For live updates when data changes:

1. In Supabase, go to **Replication** (in Table Editor)
2. Select a table (e.g., `materials`)
3. Toggle **Realtime** on
4. Repeat for `sales` table

Now when you add data on one device, it updates instantly on another.

---

## What Changed in the Code?

| Component | Change | Why |
|-----------|--------|-----|
| **AuthContext** | Now uses Supabase Auth | Secure, built-in authentication |
| **DataContext** | Now queries Supabase DB | Data persisted on backend |
| **Storage** | Removed localStorage | Data is now remote |
| **Services** | New `supabaseService.js` | API layer for Supabase |

---

## Troubleshooting

### ❌ "Invalid API key" error
**Solution**: 
- Double-check you copied the **Anon Key** (not Service Role Key)
- Verify no extra spaces were added
- Restart dev server after updating .env.local

### ❌ "Permission denied" when adding data
**Solution**:
- Ensure SQL setup script was fully executed
- Check that RLS policies were created
- Log out and log back in

### ❌ Signup redirect to login
**Solution**:
- It's normal! Supabase Auth requires email confirmation
- Check **Authentication → Email** settings
- By default, it allows signup without email verification (for dev)

### ❌ Data not appearing in Supabase
**Solution**:
1. Verify you're logged in (check top right)
2. Go to **Authentication → Users** and confirm user exists
3. In Table Editor, check that records were inserted
4. Ensure RLS policies allow read access

### ❌ .env.local not being picked up
**Solution**:
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Variable names must start with `VITE_`
- Use exact names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Next Steps (Optional)

1. **Delete Demo Accounts** (optional)
   - Go to Supabase → Authentication
   - Delete test users you created

2. **Customize Email Templates**
   - Go to Authentication → Email Templates
   - Customize confirmation, reset password emails

3. **Backup Your Database**
   - Go to Settings → Backups
   - Enable automatic backups

4. **Set Up a Custom Domain** (later)
   - Go to Settings → Custom Domain

5. **Deploy to Production**
   - Use Vercel, Netlify, or GitHub Pages for frontend
   - Supabase handles the backend automatically

---

## Security Checklist

- ✅ Never commit `.env.local` to Git
- ✅ Anon key is safe in frontend
- ✅ Service Role key is secret (use only in backend)
- ✅ RLS policies protect user data
- ✅ Passwords are hashed by Supabase Auth

---

## File Structure

```
datakeeper-accounting-system/
├── frontend/
│   ├── .env.local                    ← ADD THIS FILE
│   ├── .env.example                  ← Reference
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       ← Updated (Supabase Auth)
│   │   │   └── DataContext.jsx       ← Updated (Supabase DB)
│   │   ├── lib/
│   │   │   └── supabaseClient.js     ← Updated (env vars)
│   │   └── services/
│   │       ├── supabaseService.js    ← NEW (API layer)
│   │       └── storageService.js     ← Kept (optional)
├── sql/
│   └── setup.sql                     ← Database schema
└── SUPABASE_SETUP.md                 ← This file
```

---

## Questions?

- **Supabase Docs**: https://supabase.com/docs
- **This Project**: Check SUPABASE_SETUP.md and SUPABASE_SQL_SETUP.md
- **Troubleshooting**: See Troubleshooting section above

Happy coding! 🚀
