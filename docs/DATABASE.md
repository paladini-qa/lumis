# 🗄️ Database & Supabase Specifications: Lumis

This document details the exact PostgreSQL database schema, relationship constraints, performance indices, Row Level Security (RLS) policies, and the **Automated Migration Pipeline** for the Supabase instance.

---

## 🔄 Automated Database Migrations Pipeline

Lumis uses the **Supabase CLI** and **GitHub Actions** to automate all database updates. You will **never** need to manually copy-paste SQL or run schema changes via the Supabase web dashboard.

### 1. Local Development Flow
* **Directory Structure:** Migrations are stored locally inside the project directory under:
  `/supabase/migrations/<timestamp>_init_schema.sql`
* **Local Container Stack:**
  * Initialize Supabase local configs: `supabase init`
  * Spin up local PostgreSQL/Auth/Storage docker containers: `supabase start`
  * Apply and test all migration scripts locally: `supabase db reset`
  * Track local changes to new migrations automatically: `supabase db diff -f new_change`

### 2. CI/CD Automated Schema Synchronization (GitHub Actions)
* **Trigger:** Every push or merge to the `main` branch.
* **The Action:** Uses the official `supabase/setup-cli` action in our workflow.
* **Command Executed:**
  `supabase db push --db-url "${{ secrets.SUPABASE_DB_URL }}"`
* **Result:** Supabase automatically compares the migration history, determines any new `.sql` scripts that haven't been applied to your production instance, and executes them in the correct chronological order. Zero manual overhead.

---

## 🔒 Row Level Security (RLS) Blueprint
All tables in Lumis enforce RLS. Users can only perform CRUD operations on rows that belong directly to their authenticated user ID (`auth.uid()`).
* **The Rule:** `user_id = auth.uid()`
* **Scope:** All tables must have a `user_id` column of type `uuid` foreign-keying to `auth.users(id)`.

---

## 🛠️ PostgreSQL SQL Migration Script

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PAYMENT METHODS TABLE
create table public.payment_methods (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    type text not null check (type in ('debit', 'credit')),
    closure_day integer check (closure_day between 1 and 31),
    due_day integer check (due_day between 1 and 31),
    icon text,
    color text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES TABLE
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    color text not null, -- HSL/Hex string
    icon text,          -- Icon identifier name
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, name) -- Prevent duplicate category names per user
);

-- 3. SAVINGS GOALS TABLE
create table public.goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    target_amount numeric(12, 2) not null check (target_amount > 0),
    current_savings numeric(12, 2) default 0.00 not null check (current_savings >= 0),
    deadline date,
    color text not null,
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TRANSACTIONS TABLE
create table public.transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
    category_id uuid references public.categories(id) on delete set null,
    goal_id uuid references public.goals(id) on delete set null, -- Nullable, used for goal transfers
    amount numeric(12, 2) not null check (amount > 0),
    type text not null check (type in ('income', 'expense', 'transfer')),
    date date not null,
    description text not null,
    payment_status text default 'paid' not null check (payment_status in ('paid', 'pending')),
    is_recurring boolean default false not null,
    installment_id uuid, -- Non-null groups installment series
    installment_number integer, -- e.g., 1, 2, 3
    total_installments integer,  -- e.g., 3
    statement_month date not null, -- Stored as YYYY-MM-01 representing the statement due cycle month
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. USER SETTINGS & BALANCES TABLE
create table public.user_settings (
    user_id uuid primary key references auth.users(id) on delete cascade,
    primary_balance numeric(12, 2) default 0.00 not null,
    theme_preference text default 'dark' not null,
    friends_list jsonb default '[]'::jsonb not null, -- Array of local friend profiles
    enable_wallet_interceptor boolean default false not null, -- Toggle Google Wallet interceptor
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TRANSACTION TAGS TABLE
create table public.tags (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, name)
);

-- 7. TRANSACTION_TAGS JUNCTION TABLE
create table public.transaction_tags (
    transaction_id uuid not null references public.transactions(id) on delete cascade,
    tag_id uuid not null references public.tags(id) on delete cascade,
    primary key (transaction_id, tag_id)
);
```

---

## ⚡ Performance Indices & Optimizations

To guarantee rapid loading on the mobile and web dashboards, the following database indices are defined:

```sql
-- Speed up fetching user transactions for a target month (Reporting & Dashboard)
create index idx_transactions_user_statement on public.transactions(user_id, statement_month);

-- Speed up filtering transactions by payment methods
create index idx_transactions_payment_method on public.transactions(payment_method_id);

-- Speed up filtering transactions by category
create index idx_transactions_category on public.transactions(category_id);
```

---

## RLS Security Policies Setup

```sql
-- Enable RLS on all tables
alter table public.payment_methods enable row level security;
alter table public.categories enable row level security;
alter table public.goals enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;
alter table public.tags enable row level security;
alter table public.transaction_tags enable row level security;

-- Policy creation (Select, Insert, Update, Delete for Owner only)
create policy "Users manage own payment methods" on public.payment_methods
    for all using (auth.uid() = user_id);

create policy "Users manage own categories" on public.categories
    for all using (auth.uid() = user_id);

create policy "Users manage own goals" on public.goals
    for all using (auth.uid() = user_id);

create policy "Users manage own transactions" on public.transactions
    for all using (auth.uid() = user_id);

create policy "Users manage own settings" on public.user_settings
    for all using (auth.uid() = user_id);

create policy "Users manage own tags" on public.tags
    for all using (auth.uid() = user_id);
```
