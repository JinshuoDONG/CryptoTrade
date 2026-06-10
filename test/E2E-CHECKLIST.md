# CryptoTrade E2E Test Checklist

Run through these steps to verify every feature works end-to-end.

---

## Setup: Create Two Test Accounts

1. Open **two browser windows** (or one normal + one incognito)
2. Register Account A: `testuserA@test.com` / `123456`
3. Register Account B: `testuserB@test.com` / `123456`
4. Note Account B's Wallet ID (visible on Wallet page)

---

## Test 1: Market Data (No Login Required)

- [ ] Home page loads with coins in the table
- [ ] Click each category button: **All**, **Top 50**, **Top Gainers**, **Top Losers** — all show data
- [ ] Right panel shows chart after data loads
- [ ] Click a coin row (not the name) → right panel updates with that coin's chart + price
- [ ] **Trade** button in right panel navigates to detail page
- [ ] **Click blue coin name** in table → navigates to detail page
- [ ] Detail page shows chart, coin info, Trade button, Bookmark
- [ ] Bookmark prompts login if not logged in

---

## Test 2: Authentication

- [ ] Register new account: valid email format + 6+ char password
- [ ] Error shows for duplicate email
- [ ] Error shows for weak password
- [ ] Log in with registered account
- [ ] Log out
- [ ] "Forgot Password" sends reset email (check Firebase console if email not received)

---

## Test 3: Search (No Login Required)

- [ ] Type "bit" in Navbar search → dropdown shows results including Bitcoin
- [ ] Type "xyznotacoin" → shows "No results found"
- [ ] Click a search result → navigates to that coin's detail page
- [ ] Click outside search → dropdown closes

---

## Test 4: Watchlist (Login Required)

- [ ] Log in as Account A
- [ ] Navigate to a coin detail page
- [ ] Click bookmark icon → coin added to watchlist
- [ ] Navigate to **Watchlist** page → coin appears
- [ ] Click bookmark again on detail page → removes from watchlist
- [ ] **Log out** and **log back in** → watchlist persists
- [ ] Open second browser, log in as Account B → watchlist is **empty** (isolated)

---

## Test 5: Wallet — Top Up / Withdraw / Transfer (Login Required)

### 5a: Top Up
- [ ] Open **Wallet** page
- [ ] Click **Add Money** → enter $500 → click Top Up
- [ ] Balance updates to $500 after top-up
- [ ] **Refresh page** → balance still $500 (persistence)

### 5b: Withdraw
- [ ] Click **Withdrawal** → enter $200 → click Withdraw
- [ ] Balance updates to $300
- [ ] Refresh → balance persists

### 5c: Transfer (Account A → Account B)
- [ ] In Account B's Wallet page, copy the Wallet ID
- [ ] In Account A's Wallet, click **Transfer**
- [ ] Enter $100 in amount
- [ ] Paste Account B's Wallet ID
- [ ] Click Transfer
- [ ] Account A balance decreases by $100
- [ ] **Log in as Account B** → balance increases by $100 ✅

---

## Test 6: Trading — Buy / Sell (Login Required)

- [ ] Log in as Account A
- [ ] Note current wallet balance
- [ ] Navigate to any coin detail page
- [ ] Click **Trade** button
- [ ] Select **Buy** tab
- [ ] Enter $50 in USD field → crypto amount auto-calculates
- [ ] Click **Buy ETH** (or whichever coin)
- [ ] Wallet balance decreases by $50
- [ ] Navigate to **Portfolio** → shows the purchased coin
- [ ] Go back to same coin detail → click Trade → select **Sell**
- [ ] Sell half the amount
- [ ] Wallet balance increases accordingly
- [ ] Portfolio updates

---

## Test 7: Portfolio & Activity (Login Required)

- [ ] **Portfolio** page shows purchased coins with:
  - Amount, Avg Price, Current Price, P&L %, Value
- [ ] Green for profit, red for loss
- [ ] **Activity** page shows transaction history:
  - Top Up, Withdrawal, Transfer, Buy, Sell — all visible
- [ ] Each row shows date, type badge, amount, status

---

## Test 8: Profile (Login Required)

- [ ] Navigate to **Profile** page
- [ ] Click **Edit** → update Name, Job, etc.
- [ ] Click **Save**
- [ ] Refresh → data persists
- [ ] Profile data is **isolated** between accounts (verify with Account B)

---

## Test 9: Payment Details (Login Required)

- [ ] Navigate to **Payment Details** page
- [ ] Click **Add payment details**
- [ ] Fill in form → Submit
- [ ] Card updates with saved details
- [ ] Refresh → data persists
- [ ] Click **Update payment details** → modify → Submit → updates

---

## Test 10: Chatbot

- [ ] On Home page, click **Chat Bot** button (bottom-right)
- [ ] Type "hi" → bot responds with greeting
- [ ] Type "what's the price of bitcoin" → shows BTC price
- [ ] Type "top gainers" → shows top 5 gainers
- [ ] Type "market overview" → shows market summary
- [ ] Close chatbot via X button

---

## Test 11: Data Isolation

- [ ] Account A and Account B have **separate**:
  - Watchlists
  - Wallet balances
  - Portfolio holdings
  - Transaction histories
  - Profile data
  - Payment details
- [ ] One account cannot see the other's private data

---

## Test 12: Error Handling

- [ ] Navigate to `/market/nonexistent` → shows error message (no crash)
- [ ] Navigate to `/some-random-path` → shows 404 page
- [ ] Disconnect internet → try to load data → table shows empty (no fake data)
- [ ] Disconnect internet → chart shows "Chart data temporarily unavailable"
- [ ] Try to trade with insufficient balance → error message shown

---

## Test 13: Sidebar Navigation

- [ ] Click hamburger menu → sidebar opens
- [ ] Click each item in sidebar → navigates to correct page
- [ ] Sidebar **Logout** → logs out → navigates to auth page (not 404!)

---

## Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Market Data | ⬜ | |
| 2. Auth | ⬜ | |
| 3. Search | ⬜ | |
| 4. Watchlist | ⬜ | |
| 5. Wallet | ⬜ | |
| 6. Trading | ⬜ | |
| 7. Portfolio & Activity | ⬜ | |
| 8. Profile | ⬜ | |
| 9. Payment Details | ⬜ | |
| 10. Chatbot | ⬜ | |
| 11. Data Isolation | ⬜ | |
| 12. Error Handling | ⬜ | |
| 13. Sidebar | ⬜ | |
