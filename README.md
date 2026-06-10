# Crypto Trackr

**Crypto Trackr** is a full-featured cryptocurrency trading and portfolio management web application. Built with a modern React frontend and Firebase backend, it delivers real-time market data, paper trading, wallet management, and portfolio tracking — all in one seamless experience.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) (HashRouter) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (built on [Radix UI](https://www.radix-ui.com/)) |
| **Icons** | [lucide-react](https://lucide.dev/) |
| **Charts** | [ApexCharts](https://apexcharts.com/) via [react-apexcharts](https://www.npmjs.com/package/react-apexcharts) |
| **Forms & Validation** | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Backend / Auth / DB** | [Firebase](https://firebase.google.com/) (Auth + Firestore + Hosting) |
| **Market Data API** | [Binance Public API](https://api.binance.com/api/v3) |
| **Unit Testing** | [Vitest](https://vitest.dev/) |
| **E2E Testing** | [Playwright](https://playwright.dev/) |

---

## Live Demo

**Firebase Hosting:** [https://cryptotrading-b288a.web.app](https://cryptotrading-b288a.web.app)

---

## Features

### 📊 Market Dashboard
- Real-time cryptocurrency price table with live data from Binance
- Filter by category: **All Coins**, **Top 50**, **Top Gainers**, **Top Losers**
- Click any row to view its price chart (right panel)
- Sortable columns: price, 24h change, volume, market cap
- Real coin logos from CoinCap CDN with fallback to letter avatars

### 📈 Price Charts
- Interactive candlestick / line charts via ApexCharts
- Multiple timeframes: 1 day, 7 days, 30 days, 90 days, 1 year
- Detailed price info: current price, 24h high/low, volume, market cap

### 💰 Paper Trading
- **Buy** crypto with USD from your wallet (market orders)
- **Sell** crypto back to USD at current market price
- Weighted average cost basis tracking for accurate P&L
- Trade confirmation dialog with price preview

### 👛 Wallet System
- **Top-up**: Add virtual USD to your wallet (simulated payment gateway)
- **Withdraw**: Cash out to a bank account
- **Transfer**: Send money to another user by Wallet ID
- Real-time balance display with copyable Wallet ID

### 📋 Portfolio Tracking
- View all your crypto holdings with real-time valuation
- Columns: Asset, Amount Held, Avg Buy Price, Current Price, **P&L %**, Total Value (USD)
- Color-coded profit/loss indicators (green / red)

### ⭐ Watchlist
- Bookmark any coin to track it
- Optimistic UI updates (instant feedback, auto-rollback on error)
- Persisted to Firestore + localStorage backup
- Remove coins with one click

### 📜 Transaction History
- Complete activity log: Top-ups, Withdrawals, Transfers, Buys, Sells
- Color-coded transaction type badges
- Sorted by date (newest first)
- Dedicated Withdrawal History page with filtered view

### 🔍 Search
- Real-time coin search (300ms debounce)
- Search by coin name or symbol
- URL query parameter support (`?q=btc`)
- Click any result to navigate to the detail page

### 💳 Payment Details
- Save bank account information for withdrawals
- Secure display (account number masked, only last 4 digits shown)
- Edit / update saved details anytime

### 🔐 Authentication
- Email + password sign up / sign in (Firebase Auth)
- Password reset via email
- Persistent sessions (auto-restore on page reload)
- Protected routes: wallet, portfolio, watchlist require login

### 👤 User Profile
- Editable profile: name, date of birth, nationality, address, job
- Email displayed (read-only)

### 📱 Responsive Design
- Mobile-friendly layout with slide-out sidebar navigation
- Desktop: two-panel dashboard (table + chart side by side)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- A [Firebase](https://console.firebase.google.com/) project (for Auth + Firestore)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JinshuoDONG/CryptoTrade.git
cd CryptoTrade

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the project root with your Firebase config:
#   VITE_FIREBASE_API_KEY=your_api_key
#   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
#   VITE_FIREBASE_PROJECT_ID=your_project_id
#   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
#   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
#   VITE_FIREBASE_APP_ID=your_app_id

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run deploy:firebase` | Build and deploy to Firebase Hosting |
| `npm run deploy` | Deploy to GitHub Pages |

---

## User Guide

### 1. Create an Account
1. Click **Login** in the top-right corner, or navigate to `/signup`
2. Enter your name, email, and password
3. Click **Sign Up** — you'll be logged in automatically
4. Your account is created in Firebase Auth and Firestore

### 2. Add Money to Your Wallet
1. Go to **Wallet** from the sidebar or user menu
2. Click **Add Money**
3. Enter the amount (USD) and click **Submit**
4. The payment is processed (simulated with 1-second delay)
5. Your balance updates immediately

### 3. Buy Cryptocurrency
1. Browse coins on the **Home** page, or search for a specific one
2. Click a coin's **name** to open its detail page
3. Click the **Trade** button
4. Enter the USD amount you want to spend
5. Review the estimated coin amount and current price
6. Click **Buy** to execute the trade
7. Check your **Portfolio** to see the new holding

### 4. Sell Cryptocurrency
1. Open a coin's detail page (from Portfolio, Watchlist, or Home)
2. Click **Trade**
3. Switch to the **Sell** tab
4. Enter the amount of coins to sell
5. Review the estimated USD return
6. Click **Sell** to execute

### 5. Transfer Money to Another User
1. Go to **Wallet**
2. Click **Transfer**
3. Enter the recipient's **Wallet ID** (they can find it in their Wallet page)
4. Enter the amount to send
5. Click **Transfer**
6. Both your balance and the recipient's balance update instantly

### 6. Withdraw Money
1. First, set up your bank details in **Payment Details** page
2. Go to **Wallet** and click **Withdrawal**
3. Enter the amount
4. Click **Withdraw** — the request is recorded with "Pending" status

### 7. Manage Your Watchlist
1. On any coin's detail page, click the **bookmark icon** (🔖)
2. View all bookmarked coins in the **Watchlist** page
3. Click the bookmark icon again on a coin to remove it

---

## Project Structure

```
CryptoTrade/
├── src/
│   ├── components/ui/         # shadcn/ui components + CoinImage
│   ├── lib/                   # Core services
│   │   ├── api.js             # Binance market data API
│   │   ├── AuthContext.jsx     # Auth state + watchlist context
│   │   └── utils.js           # className merge utility
│   ├── page/
│   │   ├── Activity/          # Transaction history
│   │   ├── Auth/              # Sign in / sign up / forgot password
│   │   ├── Home/              # Market dashboard + chart
│   │   ├── Navbar/            # Top nav + sidebar
│   │   ├── Notfound/          # 404 fallback
│   │   ├── Payment_Details/   # Bank account management
│   │   ├── Portfolio/         # User's crypto holdings
│   │   ├── Profile/           # User profile editor
│   │   ├── Search/            # Coin search page
│   │   ├── Stock_Details/     # Single coin detail + trade form
│   │   ├── Wallet/            # Wallet + top-up/withdraw/transfer
│   │   ├── Watchlist/         # Bookmarked coins
│   │   └── Withdrawal/        # Withdrawal history
│   ├── App.jsx                # Route definitions
│   ├── main.jsx               # App entry point
│   ├── FirebaseConfig.js      # Firebase initialization
│   └── index.css              # Global styles + Tailwind
├── test/                      # Vitest unit tests + Playwright E2E tests
├── firebase.json              # Firebase Hosting config
├── firestore.rules            # Firestore security rules
├── playwright.config.js       # Playwright configuration
├── vitest.config.js           # Vitest configuration
└── package.json
```

---

## Testing

### Unit Tests (Vitest)
```bash
# Run API tests
npx vitest run test/api.test.js

# Run Wallet service tests
npx vitest run test/wallet.test.js
```

### E2E Tests (Playwright)
```bash
# Start the dev server first
npm run dev

# Run all E2E tests
npx playwright test test/e2e.spec.js --project=chromium

# Run multi-account trading flow
npx playwright test test/e2e-trading.spec.js --project=chromium
```

### Manual Console Tests
In development mode, open the browser console and paste the contents of `test/e2e-console-test.js`. All test results print directly in the console with ✅ / ❌ markers.

---

## Deployment

The app is deployed to **Firebase Hosting**.

```bash
npm run deploy:firebase
```

This builds the project and deploys it to Firebase. The live URL is [https://cryptotrading-b288a.web.app](https://cryptotrading-b288a.web.app).

> **Note:** If Firebase CLI asks you to re-authenticate, run:
> ```bash
> node node_modules/firebase-tools/lib/bin/firebase.js login --reauth
> ```

---

## License

This project is for educational purposes. Market data is provided by Binance public API. No real money is involved — all trading is simulated with virtual funds.
