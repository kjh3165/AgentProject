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
