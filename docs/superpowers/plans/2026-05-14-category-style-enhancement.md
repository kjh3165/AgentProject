# Category Style Enhancement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `color` and `icon` fields to the `categories` table and update existing default categories with appropriate styles.

**Architecture:** Database migration using Supabase CLI patterns.

**Tech Stack:** PostgreSQL (Supabase)

---

### Task 1: Create Migration File

**Files:**
- Create: `supabase/migrations/20260514000000_add_category_style_fields.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Add color and icon fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'gray-500',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Tag';

-- Update existing default categories with styles
-- Expenses
UPDATE categories SET color = 'red-500', icon = 'Utensils' WHERE name = '식비' AND user_id IS NULL;
UPDATE categories SET color = 'blue-500', icon = 'Car' WHERE name = '교통비' AND user_id IS NULL;
UPDATE categories SET color = 'green-500', icon = 'Home' WHERE name = '주거비' AND user_id IS NULL;
UPDATE categories SET color = 'purple-500', icon = 'Gamepad2' WHERE name = '문화/취미' AND user_id IS NULL;
UPDATE categories SET color = 'yellow-500', icon = 'ShoppingBag' WHERE name = '생활용품' AND user_id IS NULL;
UPDATE categories SET color = 'emerald-500', icon = 'HeartPulse' WHERE name = '의료/건강' AND user_id IS NULL;
UPDATE categories SET color = 'gray-500', icon = 'MoreHorizontal' WHERE name = '기타 지출' AND user_id IS NULL;

-- Incomes
UPDATE categories SET color = 'teal-500', icon = 'Banknote' WHERE name = '월급' AND user_id IS NULL;
UPDATE categories SET color = 'orange-500', icon = 'TrendingUp' WHERE name = '부수입' AND user_id IS NULL;
UPDATE categories SET color = 'pink-500', icon = 'Gift' WHERE name = '용돈' AND user_id IS NULL;
UPDATE categories SET color = 'indigo-500', icon = 'Wallet' WHERE name = '기타 수입' AND user_id IS NULL;
```

- [ ] **Step 2: Apply migration to local database**

Run: `npx supabase db reset`
Expected: Success (or failure if Docker is not running, but file must exist)

- [ ] **Step 3: Commit changes**

```bash
git add supabase/migrations/20260514000000_add_category_style_fields.sql
git commit -m "db: add color and icon fields to categories"
```
