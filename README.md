# DataKeeper - Accounting System for Jay Durge Traders

A modern, full-stack accounting application built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**.

Perfect for managing inventory, recording sales, and tracking profit/loss for **Jasta Patta (Metal Sheet) trading businesses**.

---

## ✨ Features

### 📊 Dashboard
- Real-time stats: Total Revenue, Profit, Stock, Due Amounts
- Interactive charts: Daily sales, monthly revenue, stock overview
- Recent sales summary
- Low stock alerts

### 📦 Stock Management
- Add/Edit/Delete materials with KG-based tracking
- Track purchase price and selling price per KG
- Visual stock level indicators
- Low stock warnings (below 50% threshold)

### 💰 Sales Entry
- Quick sales recording with customer name and material
- Auto-calculate totals: Quantity × Rate = Total
- Partial payment support (track dues)
- Real-time material stock updates

### 📈 Reports
- Filter by period: Daily, Weekly, Monthly, Yearly
- Profit calculations
- Customer transaction history
- Exportable data

### 🔐 Security & Authentication
- Email/password signup & login
- Secure Supabase authentication
- Row-level security on all data
- Auto-user profile creation

### 🌙 Dark Mode
- Beautiful light & dark themes
- Persistent theme preference

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Supabase account (free at [supabase.com](https://supabase.com))

### Installation

1. **Clone & Setup**
   ```bash
   git clone https://github.com/Aryan8400/datakeeper-accounting-system.git
   cd datakeeper-accounting-system/frontend
   npm install
   ```

2. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a free project
   - Copy your **Project URL** and **Anon Key**

3. **Configure Environment**
   ```bash
   # Create .env.local in frontend/
   echo "VITE_SUPABASE_URL=YOUR_PROJECT_URL" > .env.local
   echo "VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY" >> .env.local
   ```

4. **Set Up Database**
   - In Supabase, go to **SQL Editor** → **New Query**
   - Copy contents of `sql/setup.sql` and run it
   - This creates all required tables and security policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Visit: **http://localhost:5173**

---

## 📚 Documentation

- **[BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)** - Step-by-step Supabase setup
- **[SUPABASE_SQL_SETUP.md](./SUPABASE_SQL_SETUP.md)** - Database schema details
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Quick reference guide

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Supabase Client SDK
    ↓
Supabase (PostgreSQL + Auth + API)
```

### Project Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── context/            # Auth & Data context providers
│   ├── hooks/              # Custom hooks (useAuth, useData, useTheme)
│   ├── layouts/            # Page layouts
│   ├── lib/                # Supabase client config
│   ├── pages/              # Route pages
│   ├── services/           # API service layer
│   ├── utils/              # Helpers (calculations, formatters)
│   ├── App.jsx             # Router config
│   └── main.jsx            # Entry point
├── .env.example            # Environment variable template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind styling
└── package.json
sql/
├── setup.sql               # Database schema & RLS policies
├── BACKEND_SETUP_GUIDE.md  # Detailed setup instructions
├── SUPABASE_SQL_SETUP.md   # Schema documentation
└── SUPABASE_SETUP.md       # Quick reference
```

---

## 🔑 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI framework |
| **Build** | Vite | Fast bundler |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Charts** | Recharts | Data visualization |
| **Routing** | React Router v7 | Page navigation |
| **Backend** | Supabase | PostgreSQL + Auth + API |
| **Database** | PostgreSQL | Data persistence |

---

## 🔐 Security

### Row-Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Users can only access their own data
- ✅ Policies enforce at database level

### Authentication
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens managed by Supabase
- ✅ Secure session management

### API Keys
- ✅ Anon key in frontend (safe - RLS enforced)
- ✅ Service role key secret (backend only)
- ✅ Environment variables never committed

---

## 📊 Database Schema

### Tables
- **users** - Extended user profiles (linked to auth.users)
- **materials** - Inventory items (with cost & selling price)
- **sales** - Transactions (with customer, quantity, payment status)

### Key Features
- **RLS Policies** - Automatic user data isolation
- **Auto Timestamps** - `created_at` & `updated_at` fields
- **Triggers** - Auto-create user profile on signup
- **Indexes** - Optimized queries by user_id, created_at

See [SUPABASE_SQL_SETUP.md](./SUPABASE_SQL_SETUP.md) for full schema details.

---

## 🚢 Deployment

### Frontend Deployment (Vercel - Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel/Netlify for auto-deployment.

### Backend
- No deployment needed! Supabase handles everything
- Automatic daily backups
- Global CDN included

---

## 📱 Usage Examples

### Sign Up
1. Click "Create account"
2. Enter name, email, password
3. Confirm email (immediate in dev mode)

### Add Material
1. Go to **Stock Management**
2. Click **+ Add Material**
3. Enter name, stock in KG, prices
4. Auto-tracks low stock (< 50% of initial)

### Record Sale
1. Go to **Sales Entry**
2. Select customer, material, quantity
3. Enter rate per KG (auto-fills from material)
4. System calculates total & due amount
5. Material stock auto-deducts

### View Reports
1. Go to **Reports**
2. Filter by period (Daily/Weekly/Monthly/Yearly)
3. See revenue, profit, transactions
4. Export data (manual CSV download)

---

## 🐛 Troubleshooting

### "Invalid API key"
- Verify `.env.local` has correct Supabase credentials
- Restart dev server after updating env

### "Permission denied" when saving
- Ensure SQL setup script was fully run
- Check Supabase Table Editor - tables should exist
- Log out and back in

### Materials/Sales not appearing
- Check you're logged in
- Verify data exists in Supabase Table Editor
- Check browser console for errors

### Environment variables not loading
- `.env.local` must be in `frontend/` folder
- Variable names must start with `VITE_`
- Restart dev server: `npm run dev`

---

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Authentication
- [x] Material management
- [x] Sales entry with dues tracking
- [x] Dashboard with analytics
- [x] Reports by period

### Phase 2: Planned
- [ ] Payment collection tracking
- [ ] SMS notifications for due amounts
- [ ] Supplier management
- [ ] Bulk import/export
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & ML predictions

### Phase 3: Enterprise
- [ ] Multi-user collaboration
- [ ] Role-based access control
- [ ] API for integrations
- [ ] Webhooks for custom workflows

---

## 💡 Development

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Code Quality
- ESLint-ready (add if needed)
- Component-driven development
- Context API for state management

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📧 Support

For issues or questions:
- Check the documentation files (BACKEND_SETUP_GUIDE.md, etc.)
- Review code comments
- Open an issue on GitHub

---

## 🙏 Credits

Built with ❤️ for Jay Durge Traders using:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

---

## 🎯 Business Focus

**DataKeeper** is specifically designed for:
- **Metal Sheet Trading** (Jasta Patta)
- **Small-to-medium businesses** (1-50 employees)
- **KG-based inventory**
- **Partial payment tracking**
- **Profit margin analysis**

Customize for other inventory-heavy businesses too!

---

Happy trading! 🚀

**Current Version:** 0.1.0
**Last Updated:** May 17, 2026
