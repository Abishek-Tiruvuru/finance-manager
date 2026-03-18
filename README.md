# 💎 FinanceFlow — Personal Finance Tracker

A full-stack personal finance tracker built with **Next.js**, **Supabase**, **TailwindCSS**, and **Chart.js**. Features a dark glassmorphism UI, real-time analytics, and secure per-user data.

![FinanceFlow Dashboard](https://placehold.co/1200x600/021024/C1E8FF?text=FinanceFlow+Dashboard)

---

## ✨ Features

- 🔐 **Authentication** — Supabase email/password auth, secure session handling
- 📊 **Dashboard** — Balance, income, expenses, savings rate at a glance
- 📈 **Charts** — Pie, bar, line, and donut charts with Chart.js
- 💳 **Transactions** — Add, edit, delete income & expenses
- 📋 **History** — Filter, sort, search, and export to CSV
- 🧠 **Analytics** — Monthly trends, category breakdowns, savings insights
- ⚙️ **Settings** — Monthly budget limits, savings goals, profile
- 📱 **Responsive** — Works on desktop, tablet, and mobile

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#021024` | Primary background |
| Dark Blue | `#052659` | Cards, sidebar |
| Mid Blue | `#5483B3` | Accents, buttons |
| Soft Blue | `#7DA0CA` | Secondary text |
| Light Accent | `#C1E8FF` | Primary text, highlights |

---

## 🏗️ Project Structure

```
finance-tracker/
├── app/
│   ├── layout.js              # Root layout with AuthProvider
│   ├── page.js                # Redirect to dashboard/auth
│   ├── auth/
│   │   └── page.js            # Login & Sign Up page
│   ├── dashboard/
│   │   └── page.js            # Main dashboard
│   ├── history/
│   │   └── page.js            # Transaction history
│   ├── analytics/
│   │   └── page.js            # Analytics & insights
│   └── settings/
│       └── page.js            # User settings
├── components/
│   ├── charts/
│   │   ├── SpendingPieChart.js
│   │   ├── MonthlyBarChart.js
│   │   └── TrendLineChart.js
│   └── ui/
│       ├── AppLayout.js        # Sidebar + layout wrapper
│       ├── StatCards.js        # Summary stat cards
│       ├── RecentTransactions.js
│       └── TransactionModal.js # Add/Edit modal
├── lib/
│   ├── supabase.js            # Supabase client
│   ├── authContext.js         # Auth context/hooks
│   └── constants.js           # Categories, colors, config
├── services/
│   └── transactionService.js  # All Supabase CRUD operations
├── styles/
│   └── globals.css            # Global CSS + custom classes
├── utils/
│   └── helpers.js             # Utility functions
├── supabase-schema.sql        # Database schema + RLS policies
├── .env.local.example         # Environment variables template
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works great)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd finance-tracker
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, name it "finance-tracker", set a database password
4. Wait for the project to be ready (~2 minutes)

### 3. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** — this creates:
   - `transactions` table with RLS policies
   - `user_profiles` table with RLS policies
   - All necessary indexes

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these values:**
- Supabase Dashboard → Settings → API
- Copy **Project URL** and **anon public** key

### 5. Configure Supabase Auth

1. Supabase Dashboard → **Authentication** → Settings
2. Under **Email Auth**, make sure it's enabled
3. For development, you can disable **Confirm email** to skip email verification
4. Add your local URL to **Site URL**: `http://localhost:3000`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

### Update Supabase Auth Settings for Production

1. Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 🗃️ Database Schema

### transactions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| amount | DECIMAL | Transaction amount (> 0) |
| type | VARCHAR | 'income' or 'expense' |
| category | VARCHAR | Category slug |
| description | TEXT | Optional notes |
| date | DATE | Transaction date |
| created_at | TIMESTAMPTZ | Auto-generated |

### user_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| display_name | VARCHAR | Optional display name |
| currency | VARCHAR | e.g. 'USD' |
| monthly_budget | DECIMAL | Optional budget limit |
| savings_goal | DECIMAL | Optional savings target |

---

## 🔒 Security

- **Row Level Security (RLS)** is enabled — users can only access their own data
- Auth tokens are handled by Supabase automatically
- Anon key is safe to expose in the frontend (RLS enforces security)
- Never expose your `SUPABASE_SERVICE_ROLE_KEY` in the frontend

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TailwindCSS | Utility-first styling |
| Supabase | Backend, Auth, PostgreSQL DB |
| Chart.js + react-chartjs-2 | Interactive charts |
| Poppins (Google Fonts) | Typography |
| react-hot-toast | Toast notifications |
| date-fns | Date utilities |
| lucide-react | Icons |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this for personal or commercial projects.
