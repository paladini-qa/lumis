# 🛠️ Functional Specifications: Lumis

This document provides a highly detailed breakdown of Lumis' features. For each epic, we define the **User Stories (Acceptance Criteria)**, the **UI/UX Flow & Animations**, the **State & Data Transitions**, and critical **Edge Cases** to ensure a high-fidelity implementation.

---

## 📅 Roadmap for Feature Documentation
We will co-create and refine this document epic by epic before writing code:
* **[COMPLETE] Epic 1: Financial Management** (Dashboard, Transactions, Recurring/Installments, Hybrid Splits)
* **[COMPLETE] Epic 2: Organization & Categorization** (Accounts & Credit Cards, Custom tags, Auto-categorization)
* **[COMPLETE] Epic 3: Planning & Analytics** (Savings Goals, Statement-based Reporting)
* **[COMPLETE] Epic 4: Artificial Intelligence** (Lumis Chatbot secure context, Multimodal Smart Input Draft Card)

---

## 🎨 Premium Design System & UI/UX Guidelines

Lumis features a highly aesthetic, responsive user interface inspired by **Nubank's** clean layout and dynamic interactions, utilizing a luxurious dynamic color palette.

![Lumis Premium Responsive Mockup](file:///home/paladiini/projects/finance-manager/docs/lumis_responsive_ui_mockup.png)

### 1. Dynamic Color Tokens
To guarantee AA contrast accessibility and maximum luxury appeal:
* **Gold Highlights (Accent):**
  * *Dark Mode Accent:* `#E6C687` (Glowing warm honey-gold)
  * *Light Mode Accent:* `#AA7C11` (Deep luxury bronze-gold for accessibility compliance)
* **Backgrounds:**
  * *Obsidian Dark Theme:* `#08090A` (Deep velvet black) with card overlays at `#131416`
  * *Ivory Light Theme:* `#F9FAFB` (Soft linen white) with card overlays at `#FFFFFF`
* **Text Contrast:**
  * *Dark Mode Primary:* `#F3F4F6` (Cool gray-50) | Secondary: `#9CA3AF` (Gray-400)
  * *Light Mode Primary:* `#111827` (Slate-900) | Secondary: `#4B5563` (Gray-600)

### 2. UI Layout Patterns (Nubank-Inspired)
* **frosted glass balance Card:** The top of the dashboard displays a unified glassmorphic card showing the Primary Balance, containing a toggle eye icon for "Privacy Mode" to blur the digits instantly.
* **Quick Actions Row:** A horizontal, swipeable carousel containing circular outline buttons (Transfer, Log transaction, Pay card, Goals) with spring scale-up micro-interactions on tap.
* **Navigation Bar:** A clean, bottom-anchored custom floating tab bar with a minimalist visual footprint.

### 3. Currency & Localization Rules (BRL Reais)
* Lumis features a strictly **English interface** (all headings, buttons, notifications, and AI chatbot chats).
* However, all financial and monetary values are displayed and formatted using the **Brazilian Real (BRL - R$)** standard:
  * **Prefix:** `R$ ` (with a trailing space before figures).
  * **Decimal Separator:** Comma `,` for cents (e.g. `,72`).
  * **Thousands Separator:** Dot `.` (e.g. `18.450`).
  * *Example Layout:* `R$ 18.450,72` instead of `$18,450.72`.

---

## 💰 Epic 1: Financial Management & Transactions

### 1.1 The Dashboard Hub
* **Description:** A premium, interactive home screen showing financial summaries, balance forecasts, dynamic charts, and active subscriptions.
* **User Stories:**
  * As a user, I want to see my net monthly balance, total income, and total expenses dynamically updated.
  * As a user, I want a visual projection of my end-of-month balance based on recurring transactions.
  * As a user, I want the dashboard aggregates and reports to automatically calculate credit card transactions inside their respective **statement month** instead of literal purchase date (so that if I buy something after the card's closing date, it correctly shows in next month's statement).
  * As a user, I want a toggleable "Privacy Mode" to blur all financial figures with a glassmorphic overlay.
* **UI/UX Flow & Reanimated Animations:**
  * **Card Hover/Press:** High-fidelity 3D tilt effects using `react-native-reanimated` when tapping balance cards.
  * **Privacy Blur:** Dynamic canvas filter or overlay that transitions with a 200ms ease-in-out opacity and blur-radius curve.
* **State & Data Transitions:**
  * Pulls from Zustand cash-store, merging local transaction caches with real-time Supabase fetches.
  * Displays the single, consolidated **Primary Balance** (representing all liquid checking, savings, and cash consolidated).
  * Filters and groups card transactions dynamically based on their calculated `statement_month` rather than literal calendar date to show active card statement commitments.
  * **Offline Sync & Caching**: Tracks network connection state. When offline, displays cached balances, transactions, and goals instantly from local MMKV storage via Zustand Persist. Disables transaction write forms and AI features, presenting a friendly notice toast explaining that an internet connection is required to log changes.

### 1.2 Core Transactions (CRUD)
* **Description:** Quick entry, editing, and deletion of standard cash flows.
* **User Stories:**
  * As a user, I want to log a transaction with an amount, category, date, payment method (debit/credit card), notes, and payment status (`isPaid`).
  * As a user, I want to filter and search transaction lists by dates, categories, and payment methods.
* **Edge Cases & Error Handling:**
  * **Future-Dated Entries:** Transactions scheduled for the future should be flagged as pending and not calculated in the *current* active balance, but factored into the end-of-month forecast.
  * **Negative Values:** Prevent entering negative numbers for amounts; transaction type (Income vs. Expense) is determined explicitly by a toggle.
  * **Statement Month Boundary Formula:**
    * When registering a transaction, `statement_month` is calculated instantly:
      * **Cash/Debit**: `statement_month = transaction_date` (same month/year).
      * **Credit Card**:
        * If `transaction_date.day >= card.closure_day`, then `statement_month = transaction_date.month + 1`.
        * Else, `statement_month = transaction_date.month`.
      * *Note: Year rollover is handled automatically if month addition exceeds 12.*

### 1.3 Complex Transactions: Recurring & Installments
* **Description:** Tracking monthly/yearly subscriptions and installment-based purchases.
* **User Stories:**
  * As a user, I want to log a purchase split into $N$ monthly installments (e.g., "R$ 300 split in 3 installments of R$ 100").
  * As a user, I want to log a recurring monthly expense (e.g., Netflix subscription) and have the option to edit "This instance only", "All future instances", or "All instances".
* **State & Data Transitions:**
  * **Installments Schema:** Handled via a single parent transaction with an `installment_id`, `total_installments`, and auto-generated child rows for each month marked with `installment_number` (e.g., `1/3`, `2/3`, `3/3`).
  * **Recurring Editing Logic:**
    * *This instance only:* Creates an exception entry in a `transaction_exceptions` table or detaches the row from the recurring series.
    * *All future instances:* Updates the base pattern and applies changes to all unpaid/future occurrences.

### 1.4 Hybrid Shared Expenses
* **Description:** 50/50 expense splitting with registered or unregistered friends.
* **User Stories:**
  * As a user, I want to split a transaction 50/50 with a friend by typing their name (local-only tracker).
  * As a user, I want to link a local-only friend to a registered Lumis user so that debts are synced automatically in real-time.
* **UI/UX Flow:**
  * A "Split Expense" slider in the transaction creation modal. Dragging it right opens a list of friends with a dynamic "You owe / They owe" visual badge.
* **State & Data Transitions:**
  * **Local Mode:** Inserts a row in the `debts` table with the friend's name and `linked_user_id = NULL`.
  * **Synced Mode:** Sets `linked_user_id = friend_auth_id`. Supabase triggers automatically create a pending credit transaction on the friend's account.

---

## 🗂️ Epic 2: Organization & Categorization

### 2.1 Payment Methods & Unified Cash Balance
* **Description:** A screen allowing users to view and update their single unified liquid cash balance and manage their multiple credit cards and debit payment methods.
* **User Stories:**
  * As a user, I want to view my overall checking/debit balance (Primary Balance) as a single liquid pocket amount and edit it.
  * As a user, I want to add/edit/delete payment methods of type `debit` or `credit` with custom icons, colors, names, and limits.
  * As a user, I want to set a **Closure Day** (e.g., 10th of the month) and a **Due Day** (e.g., 20th of the month) specifically for Credit Card payment methods.
  * As a user, I want to see active statement details and dynamic billing cycles for each credit card.
* **UI/UX Flow & Animations:**
  * **Unified Summary Card:** The top displays a glowing, glassmorphic HSL card showing the single liquid "Primary Balance". Tapping on it slides open an edit panel.
  * **Visual Credit Card Mockup:** Displays editable digital credit cards on the screen with three luxurious pre-built styles (Noir Reserve, Gold, and Platinum). Users can tap a card to trigger a custom 3D card flip, showing its Closure day, Due day, credit limit, and current statement balance on the back.
* **State & Data Transitions / Calculations:**
  * **Unified Primary Balance**: Represents overall liquid funds ($CurrentPrimary = InitialPrimary + \sum DebitIncomes - \sum DebitExpenses - \sum CreditBillsPaid$).
  * **Credit Card Statement Balance**: Represents the accumulated charges for each card ($StatementTotal = \sum CreditExpenses \text{ in } statement\_month$).
  * **Statement Date Calculations**:
    * Any transaction linked to a credit card is automatically assigned a calculated `statement_month` using the boundary formula.
    * This allows the reporting layer to easily run queries like:
      `SELECT sum(amount) FROM transactions WHERE payment_method_id = :id AND statement_month = :target_month`

### 2.2 Categories, Tags, and Auto-Categorization
* **Description:** A system that turns categories into first-class database entities, enabling users to fully customize their taxonomy and automatically map incoming transactions.
* **User Stories:**
  * As a user, I want to create, read, update, and delete (CRUD) custom categories with personalized HSL colors and distinctive icons.
  * As a user, I want to create custom transaction tags to group special activities (e.g. #vacation2026).
  * As a user, I want to define auto-categorization rules (e.g., "Any transaction containing the description 'Uber' should automatically map to the 'Transport' category").
* **UI/UX Flow & Animations:**
  * **Category Customizer Palette:** An HSL slider and dynamic icon picker panel that animates a preview card in real-time with smooth spring physics when adding or editing categories.
* **Edge Cases & Error Handling:**
  * **Rule Collisions:** If a transaction description matches multiple rules, apply the most recently created rule or let the user choose in an undo-popup.
  * **Cascade Updates:** When creating a new auto-categorize rule, ask the user: *"Do you want to apply this retroactively to all past transactions?"*

---

## 📊 Epic 3: Planning & Analytics

### 3.1 Savings Goals
* **Description:** Savings objectives (e.g. emergency fund, vacation) with custom deadlines and progress tracking.
* **User Stories:**
  * As a user, I want to create a savings goal with a target amount, deadline, custom icon, and color.
  * As a user, I want to manually contribute funds to a savings goal (transferring money from an account balance into the goal).
  * As a user, I want a visual progress indicator showing the percentage completed and estimated time remaining.
* **UI/UX Flow & Animations:**
  * **Savings Tank Animation:** A gorgeous circular fluid progress bar powered by `react-native-reanimated`. When contributing funds, a subtle wave/fluid animation fills the tank dynamically.
* **State & Data Transitions:**
  * Transferring funds to a goal inserts a transaction of type `'transfer'` that reduces the unified `primary_balance` and increases the goal's `current_savings`.

### 3.2 Statement-Based Reporting & Analytics (Clear Vision)
* **Description:** Total visibility of spending distributions and cash flow cycles, grouping credit transactions strictly by their due month and allowing cross-dimensional analysis.
* **User Stories:**
  * As a user, I want to see a donut chart breakdown of my expenditures by category for any selected month.
  * As a user, I want to cross-analyze transactions by category and payment method (e.g., tap a category to see which cards paid for it, or filter the category spending donut by a specific payment method).
  * As a user, I want a Year-over-Year (YoY) comparison of my monthly cash inflows vs. credit card statement outflows.
  * As a user, I want to filter charts by specific payment methods (e.g., viewing spending *only* on a specific credit card vs overall debit purchases).
  * As a user, I want to export a clean Monthly Statement report in CSV or PDF.
* **UI/UX Flow & Animations:**
  * **Interactive Donut Chart:** Built using Victory Native. Tapping a category slice scale-animates the slice outwards and filters/highlights the corresponding transaction list below.
  * **Cross-Dimensional Drill-Down:** Double-tapping a category slice performs a smooth 3D card flip animation, transforming the donut chart into a payment-method distribution chart for that specific category.
* **Calculation Rules:**
  * Queries for reports must filter transaction dates of credit cards using their calculated `statement_month` to guarantee transactions post-closure fall into the correct cycle.
  * Database queries leverage category foreign keys to enable join-based aggregations:
    `SELECT category_id, payment_method_id, sum(amount) FROM transactions WHERE statement_month = :target_month GROUP BY category_id, payment_method_id`

---

## 🤖 Epic 4: Artificial Intelligence

### 4.1 Lumis AI Chatbot (Financial Co-Pilot)
* **Description:** A highly secure, conversational co-pilot that helps users gain profound financial visibility based on their financial data.
* **User Stories:**
  * As a user, I want to ask natural language questions about my spending habits (e.g. *"How much did I spend on restaurants this month vs. last month?"*).
  * As a user, I want to ask projection-based questions (e.g. *"If I buy a new phone for R$ 8.000, how does that affect my July credit card statement and checking liquidity?"*).
* **AI Context Pipeline (Security & Privacy):**
  * Conversations are handled via a Supabase Edge Function.
  * The Edge Function validates the user's auth token, then securely queries and aggregates the user's data to feed into the Gemini prompt:
    * **Sanitized Financial Status:** Single `primary_balance` total, lists of payment methods, and current active statement totals for credit cards (e.g., Primary Balance: R$ 1.250,00, Visa card July statement current total: R$ 300,00).
    * **Categorized Spending Summary:** Aggregated totals by category for the current and previous statement month.
    * **Goals Progress:** Active savings goals and progress.
    * **Strict Sanitization**: Raw database IDs, full account numbers, and email credentials are completely stripped before packaging the context.
  * The Edge Function streams the response back to the client using SSE (Server-Sent Events) for a seamless conversational feel.

### 4.2 Multimodal Smart Input (Receipts & Voice)
* **Description:** Swift, frictionless transaction entry using mobile voice recordings or receipt photos, parsed into editable drafts.
* **User Stories:**
  * As a user, I want to take a picture of a receipt, see a loading skeleton, and then review a beautiful pre-populated **Draft Review Card** before saving it.
  * As a user, I want to speak directly to the app (e.g., *"Spent R$ 50 on groceries at Whole Foods using credit card"*), and see it parsed into a **Draft Review Card** for confirmation.
* **UI/UX Flow & Animations:**
  * **Voice Pulse Active State:** Holding the mic button scales the microphone icon up and starts a glowing, circular waves pulse animation using React Native Reanimated.
  * **Draft Card Slide-up:** Once Gemini returns the JSON payload, a beautifully styled glassmorphic **Draft Review Card** slides up from the bottom of the screen with a spring-bounce effect.
  * **Confirmation Animation:** Tapping "Confirm Log" triggers a confetti splash or custom checkmark transition, and the card slides out to the right.
* **Payload Structure & Handling:**
  * The Supabase Edge Function takes base64-encoded files (audio or image), forwards them to Gemini 2.5 Flash, and enforces a strict structured JSON response:
    ```json
    {
      "amount": 50.00,
      "date": "2026-05-26",
      "description": "Whole Foods",
      "category": "Groceries",
      "payment_method_suggested": "credit",
      "notes": "Voice/receipt input parse"
    }
    ```
  * The client receives this JSON, maps it to the UI form, allows user adjustments, and inserts it into the Supabase `transactions` table upon user confirmation.

---
