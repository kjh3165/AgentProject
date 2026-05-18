-- Add color and icon fields to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'gray-500',
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Tag';

-- Update existing default categories with styles
-- Expenses
UPDATE categories SET color = '#EF4444', icon = 'Utensils' WHERE name = '식비' AND user_id IS NULL;
UPDATE categories SET color = '#3B82F6', icon = 'Car' WHERE name = '교통비' AND user_id IS NULL;
UPDATE categories SET color = '#F59E0B', icon = 'Home' WHERE name = '주거비' AND user_id IS NULL;
UPDATE categories SET color = '#8B5CF6', icon = 'Gamepad2' WHERE name = '문화/취미' AND user_id IS NULL;
UPDATE categories SET color = '#EAB308', icon = 'ShoppingBag' WHERE name = '생활용품' AND user_id IS NULL;
UPDATE categories SET color = '#10B981', icon = 'HeartPulse' WHERE name = '의료/건강' AND user_id IS NULL;
UPDATE categories SET color = '#6B7280', icon = 'MoreHorizontal' WHERE name = '기타 지출' AND user_id IS NULL;

-- Incomes
UPDATE categories SET color = '#14B8A6', icon = 'Banknote' WHERE name = '월급' AND user_id IS NULL;
UPDATE categories SET color = '#F97316', icon = 'TrendingUp' WHERE name = '부수입' AND user_id IS NULL;
UPDATE categories SET color = '#EC4899', icon = 'Gift' WHERE name = '용돈' AND user_id IS NULL;
UPDATE categories SET color = '#6366F1', icon = 'Wallet' WHERE name = '기타 수입' AND user_id IS NULL;
