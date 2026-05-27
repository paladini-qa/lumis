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

### 4. Behavior-Driven End-to-End (E2E) Testing Protocol (Playwright)

To guarantee consistent behavior across our hybrid Web and Mobile layouts, you **MUST** author End-to-End (E2E) test specifications using Playwright. 

#### E2E Testing Workflow steps in Gherkin format:

```gherkin
Feature: Automated End-to-End Testing Workflow
  As an AI Coding Agent
  I want to define, implement, and verify Playwright E2E tests for Web and Mobile platforms
  So that all user-facing interactions are completely robust and regression-free

  Scenario: Setting Up E2E Test Specifications
    Given the codebase has a new feature or user interaction added
    When I configure Playwright for both web viewports (desktop Chrome/Safari) and emulated mobile devices (Pixel, iPhone)
    Then I must create a clean `.spec.ts` test file in the `e2e` directory

  Scenario: Writing the E2E Tests in BDD format
    Given I am ready to author E2E test assertions
    When I define test scenarios using Gherkin syntax step-by-step
      And I implement Playwright selectors using resilient locator strategies (such as test IDs or role names)
    Then the test must cover:
      | Platform | Screen Size      | Crucial Assertions                                |
      | Web      | Desktop (1280px) | Hover animations, side drawers, grid structures   |
      | Mobile   | Mobile (375px)   | Gesture drags, pull-refresh, bottom bar locks     |

  Scenario: Running and Verifying E2E Tests
    Given the Playwright E2E test suites are fully implemented
    When I execute the Playwright command line runner:
      """
      npx playwright test
      """
    Then all tests must execute and resolve successfully
      And a Playwright HTML report must be generated for visual trace debugging
```

#### Playwright Selector & Device Rules:
1. **Resilient Locators**: Always prefer `testID` or `role`/`label` locators over brittle CSS classes (e.g., use `page.getByTestId('wallet-interceptor-toggle')` instead of `.surface.rounded-full`).
2. **Mobile Emulation**: Always configure and run the tests against two distinct viewports in `playwright.config.ts`:
   * **Web/Desktop**: Chrome (1280x720) viewport.
   * **Mobile**: Mobile Safari/Chrome (375x667 emulated viewport with touch events enabled).

### 5. Handoff Routine (After completing any task)
Once you finish a coding, configuration, or structural task:
1. **Verify via Tests**: Run the full Jest unit/integration test suite and the Playwright E2E test suite to ensure 100% passes and no regressions are introduced.
2. **Update the Living Checklist**: Mark the completed database fields, features, or deployment tasks in the sections below as `[x]`. 
3. **Write a Handoff Summary**: Provide a concise summary of what was completed and what the next agent should focus on.

---

## 📋 THE LIVING IMPLEMENTATION CHECKLIST

### 1. Infrastructure & CI/CD Pipeline
- [x] Initialize Expo (React Native & Web) Project with TypeScript 5.8+
- [x] Configure NativeWind (Tailwind CSS) & Tailwind Config
- [x] Initialize Supabase Config (`supabase init`)
- [x] Configure GitHub Actions workflow for static **GitHub Pages Web Deploy** & **Playwright E2E Integration**
- [x] Configure GitHub Actions workflow for **automated Gradle Release APK compilation**
- [x] Configure GitHub Actions workflow for **automated Supabase CLI migration push**
- [x] Initialize Playwright E2E testing framework and configure desktop/mobile viewports

### 2. Supabase Database Schema & Migrations
- [x] Create migration script for `payment_methods` table & RLS policies
- [x] Create migration script for `categories` table & RLS policies
- [x] Create migration script for `goals` table & RLS policies
- [x] Create migration script for `transactions` table & RLS policies
- [x] Create migration script for `user_settings` table & RLS policies
- [x] Create migration script for `tags` & `transaction_tags` junction table & RLS policies
- [x] Execute database migration index optimizations (`idx_transactions_user_statement`, etc.)
- [x] Verify local database schema resets (`supabase db reset`) successfully apply

### 3. Epic 1: Financial Management & Transactions
- [x] **Dashboard Hub UI:**
  - [x] Main screen layout (Nubank style) with dynamic primary balance
  - [x] Floating frosted-glass balance card with Reanimated 3D tilt effects
  - [x] Privacy Mode toggle (smooth 200ms glassmorphic blur animation)
- [x] **Core Transactions CRUD:**
  - [x] Transaction creation forms (Income vs. Expense explicit toggle)
  - [x] Payment Method and Category assignment dropdowns
  - [x] Calculated `statement_month` assignment logic integration
  - [x] Search, filter, and date scroll lists
- [x] **Complex Transactions:**
  - [x] Installment calculations and series logging logic
  - [x] Recurring subscription logging (Netflix-style)
  - [x] Editing logic exceptions (this instance, all future, all)
- [x] **Hybrid Shared Expenses:**
  - [x] Swipeable Split Expense slider in transaction entry
  - [x] Local-friend text logging ledger
  - [x] Registered Lumis user linking and real-time debt sync

### 4. Epic 2: Organization & Categorization
- [x] **Payment Methods Management:**
  - [x] Add/Edit/Delete payment methods interface (Debit vs. Credit)
  - [x] Credit Card specific fields configuration (Closure day, Due day)
  - [x] Stylized digital credit card mockup with 3D Reanimated card flip animation
- [x] **Categories & Tags:**
  - [x] Custom category CRUD (HSL color picker, dynamic icon selector)
  - [x] Custom tags management
  - [x] Auto-categorization text substring matching rules engine

### 5. Epic 3: Planning & Analytics
- [x] **Savings Goals:**
  - [x] Create and configure savings goals targets/deadlines
  - [x] Manual and auto-contributions balance transfers
  - [x] Circular fluid wave "Savings Tank" progress animation
- [x] **Reporting & Analytics:**
  - [x] Category distribution interactive donut chart (Victory Native fallback/bespoke SVG)
  - [x] YoY income vs. card statement outflow bar charts
  - [x] Category slice drill-down 3D card flip to payment-method breakdown
  - [x] CSV/PDF Monthly Statement generator

### 6. Epic 4: Artificial Intelligence
- [x] **Lumis AI Chatbot (Edge Function):**
  - [x] Configure secure Supabase Edge Function proxy to Gemini
  - [x] Implement data-sanitization pipelines (stripping IDs and PII)
  - [x] SSE (Server-Sent Events) streaming response integration on mobile/web (and developer simulator fallback)
- [x] **Multimodal Smart Input (Edge Function):**
  - [x] On-device audio recorder (mic outline glowing wave pulse animation)
  - [x] Edge Function multimodal base64 parse schema (Receipt image / Voice note)
  - [x] Spring-bounce slide-up **Draft Review Card**
  - [x] Review edits and "Confirm Log" save transition

### 7. Epic 5: Automated Capture (Google Wallet Interceptor)
- [x] **Android Native Notification Listener Bridge:**
  - [x] Configure custom native Android module / bridge for `NotificationListenerService`
  - [x] Configure package filters for `com.google.android.apps.wallet` and `com.google.android.gms`
  - [x] Implement system-wide permission request flow for "Notification Access"
- [x] **Local Parse & Action Pipeline:**
  - [x] Create robust regex parsing utility for Google Wallet (BRL transaction text formatting)
  - [x] Configure local push notification trigger via `expo-notifications` on background match
  - [x] Integrate deep linking navigation flow from notification click to Draft Review modal
- [x] **Review Card & Settings Settings:**
  - [x] Build glassmorphic Draft Review modal component with quick categories/tags select
  - [x] Create PostgreSQL database schema migration for `enable_wallet_interceptor` setting
  - [x] Implement `enableWalletInterceptor` and `walletDrafts` Zustand state store management and tests
  - [x] Integrate toggle switcher in UI settings menu and synchronize with database
