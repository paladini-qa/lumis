# 🤖 Agent Operational Protocol & Checklist: Lumis

Welcome, Agent! This document is the core coordination protocol for all AI coding assistants working in this repository. It ensures absolute state alignment, guards against database conflicts, and maintains document integrity.

---

## 🚨 MANDATORY AGENT PROTOCOL

### 1. Onboarding Routine (Every time you start a turn)
Before writing any code or proposing terminal commands, you **MUST** read the following files in full to align on requirements, UI branding, and database structures:
1. **[docs/PRD.md](file:///home/paladiini/projects/finance-manager/docs/PRD.md)** - High-level architectural and product specifications.
2. **[docs/FEATURES.md](file:///home/paladiini/projects/finance-manager/docs/FEATURES.md)** - Detailed functional user stories, UX guidelines, and calculation formulas.
3. **[docs/DATABASE.md](file:///home/paladiini/projects/finance-manager/docs/DATABASE.md)** - Supabase PostgreSQL schemas, indexes, and RLS rules.
4. **[docs/UI.md](file:///home/paladiini/projects/finance-manager/docs/UI.md)** - Premium styling tokens, typography grids, glassmorphism parameters, and Reanimated spring constants.
5. **[docs/ENVIRONMENT.md](file:///home/paladiini/projects/finance-manager/docs/ENVIRONMENT.md)** - Required environment variables schema, client/server secret divisions, and GitHub Action configs.
6. **This file ([docs/AGENTS.MD](file:///home/paladiini/projects/finance-manager/docs/AGENTS.MD))** - Read the living checklist below to determine exactly what is already implemented and what is next in queue.

### 2. Automatic Documentation Sync Protocol (Crucial)
You are the absolute custodian of this project's specifications. You must keep all documents in 100% perfect sync:
* **Instant Spec Sync on New Info:** If the User introduces new requirements, feature adjustments, UI styling parameters, or database preferences at any point, you **MUST automatically update** the corresponding documentation (`PRD.md`, `FEATURES.md`, `DATABASE.md`, `UI.md`) *immediately* before executing any code writes or terminal operations.
* **Relational Consistency:** Ensure column names in `DATABASE.md` align with state data transitions in `FEATURES.md`, and design guidelines in `UI.md` match the visual specs in `FEATURES.md`.

### 3. Test-Driven Development (TDD) Protocol (Mandatory)
Lumis is built using strict Test-Driven Development. You **MUST** write all codebase features (domain logic, helpers, state modifications, and UI components) using the **Red-Green-Refactor** workflow:
* **🔴 Step 1: Write a Failing Test (RED):** Before writing any production code, write a comprehensive unit or integration test using Jest and `@testing-library/react-native` representing the expected behavior. Run the test suite and confirm the new test fails.
* **🟢 Step 2: Write Minimal Production Code (GREEN):** Write the simplest, cleanest production code required to satisfy the test specifications. Run the test suite to verify the test successfully passes.
* **🔵 Step 3: Refactor & Clean:** Clean up the codebase. Eliminate code duplication, enforce Clean Architecture standards, optimize styles, and refactor code elements while verifying that the entire test suite remains securely green.

### 4. Handoff Routine (After completing any task)
Once you finish a coding, configuration, or structural task:
1. **Verify via Tests:** Run the full Jest test suite to ensure 100% passes and no regressions are introduced.
2. **Update the Living Checklist:** Mark the completed database fields, features, or deployment tasks in the sections below as `[x]`. 
3. **Write a Handoff Summary:** Provide a concise summary of what was completed and what the next agent should focus on.

---

## 📋 THE LIVING IMPLEMENTATION CHECKLIST

### 1. Infrastructure & CI/CD Pipeline
- [ ] Initialize Expo (React Native & Web) Project with TypeScript 5.8+
- [ ] Configure NativeWind (Tailwind CSS) & Tailwind Config
- [ ] Initialize Supabase Config (`supabase init`)
- [ ] Configure GitHub Actions workflow for static **GitHub Pages Web Deploy**
- [ ] Configure GitHub Actions workflow for **automated Gradle Release APK compilation**
- [ ] Configure GitHub Actions workflow for **automated Supabase CLI migration push**

### 2. Supabase Database Schema & Migrations
- [ ] Create migration script for `payment_methods` table & RLS policies
- [ ] Create migration script for `categories` table & RLS policies
- [ ] Create migration script for `goals` table & RLS policies
- [ ] Create migration script for `transactions` table & RLS policies
- [ ] Create migration script for `user_settings` table & RLS policies
- [ ] Create migration script for `tags` & `transaction_tags` junction table & RLS policies
- [ ] Execute database migration index optimizations (`idx_transactions_user_statement`, etc.)
- [ ] Verify local database schema resets (`supabase db reset`) successfully apply

### 3. Epic 1: Financial Management & Transactions
- [ ] **Dashboard Hub UI:**
  - [ ] Main screen layout (Nubank style) with dynamic primary balance
  - [ ] Floating frosted-glass balance card with Reanimated 3D tilt effects
  - [ ] Privacy Mode toggle (smooth 200ms glassmorphic blur animation)
- [ ] **Core Transactions CRUD:**
  - [ ] Transaction creation forms (Income vs. Expense explicit toggle)
  - [ ] Payment Method and Category assignment dropdowns
  - [ ] Calculated `statement_month` assignment logic integration
  - [ ] Search, filter, and date scroll lists
- [ ] **Complex Transactions:**
  - [ ] Installment calculations and series logging logic
  - [ ] Recurring subscription logging (Netflix-style)
  - [ ] Editing logic exceptions (this instance, all future, all)
- [ ] **Hybrid Shared Expenses:**
  - [ ] Swipeable Split Expense slider in transaction entry
  - [ ] Local-friend text logging ledger
  - [ ] Registered Lumis user linking and real-time debt sync

### 4. Epic 2: Organization & Categorization
- [ ] **Payment Methods Management:**
  - [ ] Add/Edit/Delete payment methods interface (Debit vs. Credit)
  - [ ] Credit Card specific fields configuration (Closure day, Due day)
  - [ ] Stylized digital credit card mockup with 3D Reanimated card flip animation
- [ ] **Categories & Tags:**
  - [ ] Custom category CRUD (HSL color picker, dynamic icon selector)
  - [ ] Custom tags management
  - [ ] Auto-categorization text substring matching rules engine

### 5. Epic 3: Planning & Analytics
- [ ] **Savings Goals:**
  - [ ] Create and configure savings goals targets/deadlines
  - [ ] Manual and auto-contributions balance transfers
  - [ ] Circular fluid wave "Savings Tank" progress animation
- [ ] **Reporting & Analytics:**
  - [ ] Category distribution interactive donut chart (Victory Native)
  - [ ] YoY income vs. card statement outflow bar charts
  - [ ] Category slice drill-down 3D card flip to payment-method breakdown
  - [ ] CSV/PDF Monthly Statement generator

### 6. Epic 4: Artificial Intelligence
- [ ] **Lumis AI Chatbot (Edge Function):**
  - [ ] Configure secure Supabase Edge Function proxy to Gemini
  - [ ] Implement data-sanitization pipelines (stripping IDs and PII)
  - [ ] SSE (Server-Sent Events) streaming response integration on mobile/web
- [ ] **Multimodal Smart Input (Edge Function):**
  - [ ] On-device audio recorder (mic outline glowing wave pulse animation)
  - [ ] Edge Function multimodal base64 parse schema (Receipt image / Voice note)
  - [ ] Spring-bounce slide-up **Draft Review Card**
  - [ ] Review edits and "Confirm Log" save transition
