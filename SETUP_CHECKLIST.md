# DataKeeper - Setup Checklist

Complete this checklist to get your DataKeeper app fully connected to Supabase.

---

## ✅ Pre-Setup (5 minutes)

- [ ] You have a GitHub account (optional but recommended)
- [ ] You have access to create free Supabase projects
- [ ] You have Node.js 16+ installed locally

---

## ✅ Phase 1: Supabase Project Setup (10 minutes)

### Create Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or sign in
- [ ] Click "New Project"
- [ ] Fill in project details:
  - [ ] Project name: `datakeeper-accounting`
  - [ ] Set a strong database password
  - [ ] Select region closest to you
  - [ ] Keep pricing as "Free"
- [ ] Wait for project to deploy (2-3 minutes)

### Get Credentials
- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **Anon/Public Key** (long string under "public")
- [ ] ⚠️ Do NOT copy Service Role Key to frontend

---

## ✅ Phase 2: Database Setup (10 minutes)

### Run SQL Script
- [ ] In Supabase, open **SQL Editor**
- [ ] Click **New Query**
- [ ] Open the file: `sql/setup.sql` in this project
- [ ] Copy ALL contents
- [ ] Paste into Supabase query editor
- [ ] Click **Run** (blue play button)
- [ ] Wait for completion (should show multiple success messages)

### Verify Tables Created
- [ ] Go to **Table Editor** in Supabase
- [ ] You should see these tables:
  - [ ] `users`
  - [ ] `materials`
  - [ ] `sales`
- [ ] Click each table to verify columns exist

---

## ✅ Phase 3: Frontend Configuration (5 minutes)

### Create Environment File
- [ ] Open your project folder in VS Code
- [ ] Go to `frontend/` directory
- [ ] Create new file: `.env.local`
- [ ] Add these lines:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  ```
- [ ] Replace with your actual credentials from Phase 1
- [ ] ⚠️ DO NOT commit this file (already in .gitignore)

### Install Dependencies
- [ ] In terminal, go to `frontend/` folder
- [ ] Run: `npm install`
- [ ] Wait for all packages to install

---

## ✅ Phase 4: Test the Connection (10 minutes)

### Start Dev Server
- [ ] In `frontend/` folder, run: `npm run dev`
- [ ] You should see:
  ```
  VITE v8.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ```
- [ ] Leave the server running

### Test Sign Up
- [ ] Open **http://localhost:5173** in your browser
- [ ] You should see the Login page
- [ ] Click **"Create account"** (or "Sign up" link)
- [ ] Fill in:
  - [ ] Full Name: `Test User`
  - [ ] Email: `test@example.com`
  - [ ] Password: `TestPassword123`
  - [ ] Confirm Password: `TestPassword123`
- [ ] Click **Register**

### Verify Success
- [ ] ✅ You're logged in and see the Dashboard
- [ ] ✅ In Supabase **Authentication → Users**, see your test account
- [ ] ✅ In Supabase **Table Editor → users**, see your user profile

---

## ✅ Phase 5: Test Core Features (10 minutes)

### Add a Material
- [ ] Click **Stock** in sidebar
- [ ] Click **+ Add Material**
- [ ] Fill in:
  - [ ] Material Name: `Test Metal Sheet`
  - [ ] Stock (KG): `1000`
  - [ ] Purchase Price: `100`
  - [ ] Selling Price: `150`
- [ ] Click **Save**
- [ ] ✅ Material appears in Stock list
- [ ] In Supabase **materials** table, verify it's there

### Record a Sale
- [ ] Click **Sales Entry** in sidebar
- [ ] Fill in:
  - [ ] Customer Name: `Test Customer`
  - [ ] Material: `Test Metal Sheet`
  - [ ] Quantity (KG): `100`
  - [ ] Rate per KG: `150` (should auto-fill)
  - [ ] Paid Amount: `10000` (leave partial)
- [ ] Click **Record Sale**
- [ ] ✅ Sale is recorded successfully
- [ ] In Supabase **sales** table, verify it's there
- [ ] ✅ Material stock reduced (1000 - 100 = 900 KG)

### Check Dashboard
- [ ] Click **Dashboard**
- [ ] ✅ Stats show:
  - [ ] Total Sales: 1
  - [ ] Total Revenue: 15,000 (100 × 150)
  - [ ] Current Stock: 900 KG
- [ ] ✅ Charts and recent sales visible

---

## ✅ Phase 6: Production Prep (Optional)

### Clean Up Demo Data (Optional)
- [ ] In Supabase **Authentication → Users**, delete test user
- [ ] Data in tables will auto-delete (CASCADE)

### Enable Realtime (Optional)
- [ ] In Supabase **Table Editor**
- [ ] Select **materials** table
- [ ] Find **Replication** settings
- [ ] Toggle **Realtime** on
- [ ] Repeat for **sales** table
- [ ] Now data updates live across devices

### Set Up Backup (Recommended)
- [ ] In Supabase **Settings → Backups**
- [ ] Verify "Automatic Backups" is ON
- [ ] Review backup retention policy

---

## ✅ Phase 7: Deploy (Optional - Later)

When you're ready to go live:

### Frontend Deployment (Vercel)
- [ ] Push code to GitHub
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Import your repository
- [ ] Add environment variables:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy!
- [ ] Your app is now live on the internet

### Backend
- [ ] No additional deployment needed
- [ ] Supabase handles everything automatically
- [ ] Automatic scaling, backups, monitoring included

---

## ✅ Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check .env.local has correct credentials. Restart `npm run dev` |
| "Permission denied" | Verify SQL setup.sql was fully executed in Supabase |
| Signup not working | Check email is correct. Supabase allows signup by default |
| Data not saving | Ensure you're logged in. Check browser console for errors |
| No tables in Supabase | SQL script may have failed. Try running again step by step |

---

## 📞 Need Help?

Check these files in order:
1. **[BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)** - Detailed step-by-step guide
2. **[SUPABASE_SQL_SETUP.md](./SUPABASE_SQL_SETUP.md)** - Database schema explained
3. **[README.md](./README.md)** - General project overview

---

## 🎉 Success!

If you completed all checkboxes above, your app is fully operational! 

**Next steps:**
1. ✅ Customize with your business data
2. ✅ Invite team members (create their accounts)
3. ✅ Start tracking materials and sales
4. ✅ View reports and analytics

---

## 📋 Quick Commands

```bash
# In frontend/ folder

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Version:** 1.0
**Last Updated:** May 17, 2026
**Status:** Ready for Production ✅
