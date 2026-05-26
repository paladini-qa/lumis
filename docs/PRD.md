Here is a clean, structured PRD (Product Requirements Document) based on the documentation you provided. This will give you a solid, organized foundation to rebuild the project without losing track of the core scope! 🚀

# 📄 Product Requirements Document (PRD): Lumis

## 1. Product Overview

**Lumis** is a modern personal finance management application with intelligent analytics powered by Gemini AI. It is designed to offer a complete and intuitive financial control experience across web and mobile platforms.

## 2. Core Features & Epics

### Epic 1: Financial Management 💰

* **Dashboard:** Displays monthly income, expenses, net balances, interactive charts, and a end-of-month balance forecast. Includes automatic detection of potential subscriptions.
* **Transactions (CRUD):** Users can add, edit, delete, and view transactions with payment status (`isPaid`), custom notes, and advanced filtering.
* **Complex Transactions:** * **Recurring:** Monthly/yearly tracking with smart editing (edit single, future, or all occurrences).
* **Installments:** Grouped tracking of installment purchases with visual progress.
* **Shared Expenses:** 50/50 splitting with friends via a hybrid ledger (log splits with ANY text-only friend immediately; optionally sync, notify, and auto-settle balances once the friend registers on Lumis).



### Epic 2: Organization & Categorization 🗂️

* **Categories & Tags:** Custom category creation and management (name, color, icon) and transaction tags. Includes auto-categorization rules based on description substrings.
* **Payment Methods & Single Balance:** A single, unified liquid cash balance (representing total active cash) and a single primary financial summary. Users can create multiple **Payment Methods** of type `debit` (draws from the unified cash balance immediately on transaction date) or `credit` (accumulates statement balances with custom closing and due days, paid from the primary balance).

### Epic 3: Planning & Analytics 📊

* **Goals:** Savings objectives with target deadlines, progress tracking, and optional auto-contribution.
* **Reporting:** Interactive cross-platform charts (YoY comparisons, monthly category distributions, and category-by-payment-method breakdowns) providing deep multi-dimensional spending visibility.

### Epic 4: Artificial Intelligence 🤖

* **Lumis AI Chatbot:** Context-aware financial co-pilot powered by Gemini AI.
* **Smart Input:** Seamlessly log transactions via natural language, voice notes (recorded on-device), or receipt photos. Handled securely by sending files directly to Gemini via a Supabase Edge Function to parse and return structured JSON.

### Epic 5: Automated Capture (Google Wallet Interceptor) 📲

* **Google Wallet Interceptor:** Background service on Android that intercepts incoming system notifications from Google Wallet (or Google Play Services) for real-time transactions.
* **Notification Capture & Parsing:** Local regex parsing running inside a native Android notification listener service to instantly extract the transaction amount, merchant name, and timestamp.
* **Lumis Draft Alerts:** Triggers a local push notification alerting the user to review and log the caught transaction. Tapping the notification deep-links to a pre-populated Draft Review Card inside the app.

## 3. UX & Interface Requirements 🎨

* **Responsiveness:** Mobile-first responsive web and native Android/iOS experience built with NativeWind. Includes native gestures (pull-to-refresh, swipe-to-delete) and custom tab bars.
* **Micro-Animations:** Premium, high-fidelity UI transitions, card flips, and glassmorphic interactions powered by React Native Reanimated.
* **Privacy Mode:** Hides financial values with a blur effect, activated via a floating toggle or gesture shortcut.
* **Accessibility & Localization:** Native accessibility support, keyboard/screen-reader navigation, and strict interface localization in English, while all currency displays, transactions, database figures, and reports are formatted in Brazilian Real (BRL, R$).

## 4. Technical Architecture 🛠️

The project utilizes a 4-tier Clean Architecture (Domain, Application, Infrastructure, Presentation).

* **Frontend / Mobile Framework:** Expo (React Native & React Native Web) with TypeScript 5.8+.
* **UI & Styling:** NativeWind (Tailwind CSS for React Native), React Native Reanimated (premium micro-animations), and Victory Native (cross-platform interactive charts).
* **State & Sync:** Zustand (with persist for local caching) and TanStack React Query. Features offline read-caching (instant local boot and viewing of last-fetched data) while enforcing online-only writes for transactional and AI operations to secure data integrity.
* **Backend & Auth:** Supabase (PostgreSQL, Supabase Auth with Row Level Security, Supabase Storage for receipts/voice notes, and Edge Functions).
* **AI Backend Engine:** Secure Supabase Edge Functions hosting the Gemini API key, using `@google/genai` SDK for multimodal parsing (receipt image/voice audio) and chatbot processing.

## 5. Data Schema 🗄️

Key tables in the Supabase instance:

* `payment_methods`: Details for different cards and payment modes (id, user_id, name, type ['debit', 'credit'], closure_day [for credit], due_day [for credit], icon, color).
* `categories`: First-class user-created categories (id, user_id, name, color, icon).
* `transactions`: Core details (id, user_id, payment_method_id, category_id, amount, date, description, payment_status, is_recurring, installment_id, statement_month).
* `user_settings`: User configuration, custom preferences (theme, friends list, `enable_wallet_interceptor` toggle), and the user's single `primary_balance` (liquid checking balance).
* `goals`: Target savings objectives (saving progress subtracts from the primary balance when contributed).
* `tags`: Custom labels linking to transactions.

## 6. Deployment & CI/CD Pipeline 🚀

Lumis utilizes a completely automated, self-contained GitHub Actions pipeline to handle private web deployment and native Android compilation.

### Web Deployment (GitHub Pages)
* **Trigger:** Every push to the `main` branch.
* **Flow:**
  * Sets up Node.js, installs project dependencies.
  * Injects Supabase environment variables from GitHub Secrets (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
  * Runs `npx expo export --platform web` to compile a highly optimized, responsive static web application in the `dist/` directory.
  * Automatically deploys the static assets directly to **GitHub Pages** (hosting the private or public URL).

### Android APK Compilation (GitHub Actions & Gradle)
* **Trigger:** Creation of a git tag (e.g., `v*`) or manual execution (workflow_dispatch).
* **Flow:**
  * Installs Node.js, Java JDK 17, and Android SDK command-line tools.
  * Runs `npx expo prebuild --platform android` to generate the native Android gradle project.
  * Decodes a signing keystore stored securely as a Base64-encoded GitHub Secret (`ANDROID_SIGNING_KEY`).
  * Navigates to the `android/` directory and executes `./gradlew assembleRelease` to compile a signed, high-performance release APK (`app-release.apk`).
  * Automatically creates a new **GitHub Release** tagged with the build identifier, attaching the compiled `app-release.apk` as a downloadable asset.
  * **Access:** The user can instantly download and install the APK directly onto their Android phone by browsing their private repository's Releases page.

### Database Schema Migration (Supabase CLI)
* **Trigger:** Every push or merge to the `main` branch.
* **Flow:**
  * Uses the `supabase/setup-cli` GitHub Action to install the Supabase CLI.
  * Connects directly to the production instance using the database connection URL stored in `secrets.SUPABASE_DB_URL`.
  * Executes `supabase db push` to analyze, execute, and record new SQL migration scripts chronologically.
  * **Result:** Production database schemas are automatically updated and kept in sync with the codebase without any manual script execution.