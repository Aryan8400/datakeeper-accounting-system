# DataKeeper Architecture & Data Flow

Visual reference for understanding how DataKeeper works with Supabase.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICES                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐        ┌──────────────┐                   │
│  │  Browser 1   │        │  Browser 2   │                   │
│  │  (Desktop)   │        │  (Mobile)    │                   │
│  └──────────────┘        └──────────────┘                   │
│         │                       │                           │
│         └───────────┬───────────┘                           │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────┐
        │    React Frontend       │
        │  (http://localhost:5173)│
        │                         │
        │  • Dashboard            │
        │  • Stock Management     │
        │  • Sales Entry          │
        │  • Reports              │
        └──────────┬──────────────┘
                   │
        ┌──────────┴──────────┐
        │ React Context API   │
        │ • AuthContext       │
        │ • DataContext       │
        │ • ThemeContext      │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────────┐
        │  Supabase Client SDK    │
        │  (@supabase/supabase-js)│
        └──────────┬──────────────┘
                   │
                   ↓ (HTTPS Encrypted)
   ┌───────────────────────────────────────┐
   │      SUPABASE BACKEND SERVICES        │
   ├───────────────────────────────────────┤
   │                                       │
   │  ┌─────────────────────────────────┐ │
   │  │     Authentication Service      │ │
   │  │  (Supabase Auth)                │ │
   │  │  • Email/Password signup        │ │
   │  │  • JWT token management         │ │
   │  │  • Session handling             │ │
   │  └─────────────────────────────────┘ │
   │                                       │
   │  ┌─────────────────────────────────┐ │
   │  │     REST API / Realtime         │ │
   │  │  (Auto-generated from tables)   │ │
   │  │  • Query data                   │ │
   │  │  • Insert/Update/Delete         │ │
   │  │  • Real-time subscriptions      │ │
   │  └────────────────┬────────────────┘ │
   │                   │                  │
   │  ┌────────────────▼────────────────┐ │
   │  │   Row Level Security (RLS)      │ │
   │  │  • User data isolation          │ │
   │  │  • Policy enforcement           │ │
   │  └────────────────┬────────────────┘ │
   │                   │                  │
   │  ┌────────────────▼────────────────┐ │
   │  │     PostgreSQL Database         │ │
   │  │  • users table                  │ │
   │  │  • materials table              │ │
   │  │  • sales table                  │ │
   │  │  • Automatic backups            │ │
   │  │  • Triggers & indexes           │ │
   │  └─────────────────────────────────┘ │
   │                                       │
   └───────────────────────────────────────┘
```

---

## 🔄 Authentication Flow

```
USER LOGIN/SIGNUP
       │
       ├─ Sign Up Request
       │     └─→ frontend → supabaseService.signUp()
       │           ├─→ Supabase Auth
       │           │   • Create user (email/password)
       │           │   • Hash password
       │           │   • Create JWT token
       │           │
       │           ├─→ Trigger: handle_new_user()
       │           │   • Create profile in public.users
       │           │
       │           └─→ Return session with JWT
       │               └─→ Frontend stores in memory
       │
       └─ Sign In Request
             └─→ frontend → supabaseService.signIn()
                 ├─→ Supabase Auth
                 │   • Verify email/password
                 │   • Generate JWT token
                 │   • Create session
                 │
                 └─→ Return session with JWT
                     └─→ Frontend stores in memory
                         └─→ AuthContext syncs to all pages

Every API call includes JWT token
     ↓
Supabase validates token
     ↓
Checks RLS policies
     ↓
Returns only user's data
```

---

## 📦 Data Flow: Add Material

```
User adds material in Stock Management page
         │
         ├─→ Form validation (frontend)
         │   • Check required fields
         │   • Parse numbers
         │
         └─→ onClick: addMaterial()
             ├─→ supabaseService.addMaterial()
             │   ├─→ POST /materials (REST API)
             │   │
             │   ├─→ Supabase
             │   │   ├─ Check JWT token
             │   │   ├─ Verify auth.uid() = user_id
             │   │   ├─ Run INSERT trigger
             │   │   │  └─ Auto-set created_at, updated_at
             │   │   ├─ Validate data types
             │   │   └─ Save to PostgreSQL
             │   │
             │   └─→ Return created record
             │
             └─→ Frontend updates
                 ├─ Update materials state
                 ├─ Re-render Stock page
                 └─ Show success message

Database now has:
┌─────────────┬──────────┬──────────┬──────────────┐
│     id      │ user_id  │   name   │  stock_kg    │
├─────────────┼──────────┼──────────┼──────────────┤
│ mat-1234... │ uuid-... │ GI Sheet │ 1000.00      │
└─────────────┴──────────┴──────────┴──────────────┘
```

---

## 💰 Data Flow: Record Sale

```
User records sale in Sales Entry page
         │
         ├─→ Frontend calculations
         │   • Total = Quantity × Rate
         │   • Due = Total - Paid
         │   • Verify stock available
         │
         └─→ onClick: addSale()
             ├─→ supabaseService.addSale()
             │   ├─→ POST /sales (REST API)
             │   │
             │   ├─→ Supabase
             │   │   ├─ Check JWT token
             │   │   ├─ Verify auth.uid() = user_id
             │   │   ├─ Validate material exists & user owns it
             │   │   ├─ Run INSERT trigger
             │   │   │  └─ Auto-set created_at, updated_at
             │   │   └─ Save to PostgreSQL
             │   │
             │   └─→ Return created sale
             │
             ├─→ supabaseService.updateMaterial()
             │   ├─→ PATCH /materials/:id
             │   │
             │   ├─→ Supabase
             │   │   ├─ Check JWT token
             │   │   ├─ Verify auth.uid() = user_id
             │   │   ├─ Stock: 1000 - 100 = 900
             │   │   └─ Save updated material
             │   │
             │   └─→ Return updated material
             │
             └─→ Frontend updates
                 ├─ Update sales state
                 ├─ Update materials stock
                 ├─ Re-render Sales page
                 └─ Show success message

Database now has:
Sales table:                Materials table:
┌──────────┬───────────┐  ┌──────┬──────────┐
│ material │  total    │  │  id  │ stock_kg │
├──────────┼───────────┤  ├──────┼──────────┤
│ mat-1... │ 15,000    │  │ m... │ 900.00   │
└──────────┴───────────┘  └──────┴──────────┘
```

---

## 🔍 Data Flow: Generate Report

```
User views Reports page
         │
         └─→ useEffect on mount
             ├─→ supabaseService.getSales(userId)
             │   ├─→ GET /sales?user_id=eq.uuid (REST API)
             │   │
             │   ├─→ Supabase
             │   │   ├─ Check JWT token
             │   │   ├─ Apply RLS policy: user_id = auth.uid()
             │   │   ├─ Return only this user's sales
             │   │   └─ Sort by created_at DESC
             │   │
             │   └─→ Return array of sales
             │
             └─→ Frontend processing
                 ├─ Filter by date range
                 ├─ Calculate stats
                 │  • Total revenue (sum totalAmount)
                 │  • Total profit (using calcProfit())
                 │  • Total due (sum dueAmount)
                 │
                 ├─ Group by period (daily/monthly)
                 └─ Render charts & tables

Only this user's data is returned by database
(other users' data never even sent to frontend)

Example filtered data:
┌────────────────┬────────────┬──────────┐
│ created_at     │ amount     │ due      │
├────────────────┼────────────┼──────────┤
│ 2026-05-17     │ 15,000     │ 5,000    │
│ 2026-05-16     │ 24,750     │ 9,750    │
└────────────────┴────────────┴──────────┘
```

---

## 🔐 Security: RLS in Action

```
User A tries to view all materials
         │
         └─→ supabaseService.getMaterials(userA_id)
             ├─→ GET /materials
             │
             ├─→ Supabase receives request
             │   ├─ Extracts JWT token → user_id = userA
             │   ├─ Applies RLS policy:
             │   │  WHERE user_id = userA  ✓ APPROVED
             │   ├─ Queries database:
             │   │  SELECT * FROM materials
             │   │  WHERE user_id = userA  ← RLS added this
             │   │
             │   └─→ Returns only userA's materials
             │
             └─→ Frontend displays userA's data only

What if User B tries to cheat?
         │
         └─→ Even with modified API request
             ├─→ Forged: GET /materials?user_id=userA
             │
             ├─→ Supabase still enforces RLS
             │   ├─ Extracts JWT token → user_id = userB
             │   ├─ Applies RLS policy:
             │   │  WHERE user_id = userB  ← Always enforces this
             │   │  (user_id = userA is ignored)
             │   ├─ Returns only userB's materials
             │   │
             │   └─→ userB CANNOT see userA's data
             │
             └─→ Database enforces security, not frontend

Result: ✅ userA's data stays private
        ✅ userB's data stays private
        ✅ Impossible to hack even with API access
```

---

## 🔄 Real-time Sync (Optional)

```
Device 1: User adds material
         │
         └─→ INSERT into materials table
             ├─→ Database broadcasts change
             │   (websocket via Supabase)
             │
             └─→ Device 2 receives change
                 ├─→ subscribeMaterials() callback fires
                 ├─→ Frontend updates state
                 └─→ UI updates in real-time
                     (no page refresh needed)

Enable in Supabase:
Table Editor → materials → Replication → Enable Realtime

Code already supports it:
subscribeMaterials(userId, (payload) => {
  // This callback fires when materials change
});
```

---

## 📊 Database Schema Relationships

```
auth.users (managed by Supabase Auth)
    │
    │ (1:1 automatic via trigger)
    │
    ▼
public.users
    │
    │ (1:many)
    │
    ├────────────────────┬────────────────────┐
    ▼                    ▼
public.materials    public.sales
    │ (ID)              │ (material_id)
    │                   │
    └───────────────────┘
       (foreign key)

So:
• One user has many materials
• One user has many sales
• One sale references one material
• One material can have many sales

RLS ensures:
• User A's materials ✓ only user A can see
• User A's sales ✓ only user A can see
• User B's materials ✗ user A cannot see
• User B's sales ✗ user A cannot see
```

---

## ⚡ Performance Optimizations

```
Query: Get user's materials with filtering
         │
         └─→ SELECT * FROM materials
             WHERE user_id = $1
             ORDER BY created_at DESC

Optimizations:
├─ Index on user_id
│  └─ Fast lookup: O(log n) vs O(n)
│
├─ Index on created_at
│  └─ Fast sorting: pre-indexed
│
├─ RLS predicate pushdown
│  └─ WHERE user_id applied at database
│     (not fetched then filtered in app)
│
└─ Network compression
   └─ Gzip compression on REST API
      (API responses ~70% smaller)

Typical response times:
├─ Load materials: 20-50ms
├─ Add material: 50-150ms
├─ Record sale: 100-200ms
└─ Generate report: 200-500ms

Factors:
• Your internet speed
• Supabase server location
• Database load
• Data size
```

---

## 📱 Multi-Device Sync

```
Device 1 (Desktop)          Device 2 (Mobile)
┌──────────────┐           ┌──────────────┐
│  User logs in│           │   Same user  │
│  Adds material│          │   logs in    │
└──────┬───────┘           └──────┬───────┘
       │                          │
       ├─→ Supabase DB ←─────────┤
       │   (central source)       │
       │                          │
       ├─→ getMateri als()        │
       │   (fetch all)            │
       │                          │
       └─→ Dashboard             ├─→ Dashboard
           Shows material         │   Shows SAME material
                                  │   (real-time if enabled)

Benefit: Always in sync
• Desktop adds material
• Mobile immediately sees it
• (Or manually refresh if realtime disabled)
```

---

## 🚀 Deployment Architecture

```
Development (Local)
├─ Frontend: http://localhost:5173 (npm run dev)
├─ Backend: Supabase (cloud)
└─ Database: Supabase PostgreSQL (cloud)

Production (Deployed)
├─ Frontend: vercel.com or netlify.com
│  (Your React app deployed globally)
├─ Backend: Supabase (same, no redeploy needed)
└─ Database: Supabase PostgreSQL (same, no redeploy needed)

Advantages:
✅ No backend server to manage
✅ Auto-scales with traffic
✅ Global CDN for frontend
✅ Database backups automatic
✅ DDoS protection included
```

---

## 🔧 Debugging Flow

```
Error occurs in frontend
         │
         ├─→ Check browser console (F12)
         │   └─ Error message + stack trace
         │
         ├─→ Check Supabase logs
         │   └─ Dashboard → Logs
         │
         ├─→ Check RLS policies
         │   └─ If "Permission denied" error
         │
         ├─→ Check network tab
         │   └─ See API request/response
         │
         └─→ Check database
             └─ Supabase → Table Editor
                (is data there?)
```

---

## 📚 Key Concepts Summary

| Concept | What It Is | Why It Matters |
|---------|-----------|----------------|
| **JWT Token** | Encoded user ID + claim | Proves who you are to API |
| **RLS Policy** | Database permission rule | Enforces data isolation |
| **REST API** | HTTP endpoints for data | Standard way to query db |
| **Realtime** | WebSocket subscriptions | Live data updates |
| **Trigger** | Automatic database action | Auto-set timestamps etc |
| **Foreign Key** | Link between tables | Prevents orphaned data |
| **Index** | Pre-sorted database column | Fast lookups |

---

## 🎯 To Remember

1. **Frontend** asks for data via Supabase SDK
2. **Supabase** checks JWT token (proves you're logged in)
3. **RLS Policies** filter data (you only see your stuff)
4. **PostgreSQL** returns filtered results
5. **Frontend** displays in real-time

**The database says:** "Only show this user their own data"
**Not:** "Maybe the frontend will respect this 😊"

That's why Supabase is secure! 🔐

---

**Version:** 1.0
**Updated:** May 17, 2026

For more details, see the documentation files!
