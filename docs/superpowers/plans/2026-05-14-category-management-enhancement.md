# 카테고리 관리 기능 고도화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 카테고리의 색상과 아이콘을 직접 관리하고, 이를 가계부 전반에 시각적으로 반영함.

**Architecture:** 
- **Database**: Supabase migrations를 통해 `categories` 테이블에 `color`, `icon` 필드 추가 및 기본값 설정.
- **Frontend**: React 기반의 `/categories` 관리 페이지 및 모달 UI 구현.
- **Components**: Lucide-React 아이콘 그리드와 12색 팔레트 컴포넌트 제작.
- **Integration**: 기존 `TransactionForm` 및 목록 뷰에 시각적 요소 바인딩.

**Tech Stack:** React, TypeScript, Supabase (PostgreSQL), Lucide-React, Tailwind CSS.

---

### Task 1: 데이터베이스 스키마 확장 (Migrations)

**Files:**
- Create: `supabase/migrations/20260514000000_add_category_style_fields.sql`

- [ ] **Step 1: 마이그레이션 SQL 작성**
```sql
-- categories 테이블에 필드 추가
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'gray-500';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Tag';

-- 기존 기본 카테고리에 색상 및 아이콘 배정
UPDATE categories SET color = 'red-500', icon = 'Utensils' WHERE name = '식비';
UPDATE categories SET color = 'blue-500', icon = 'Car' WHERE name = '교통비';
UPDATE categories SET color = 'green-500', icon = 'Home' WHERE name = '주거비';
UPDATE categories SET color = 'purple-500', icon = 'Gamepad2' WHERE name = '문화/취미';
UPDATE categories SET color = 'yellow-500', icon = 'ShoppingBag' WHERE name = '생활용품';
UPDATE categories SET color = 'emerald-500', icon = 'HeartPulse' WHERE name = '의료/건강';
UPDATE categories SET color = 'gray-500', icon = 'MoreHorizontal' WHERE name = '기타 지출';
UPDATE categories SET color = 'teal-500', icon = 'Banknote' WHERE name = '월급';
UPDATE categories SET color = 'orange-500', icon = 'TrendingUp' WHERE name = '부수입';
UPDATE categories SET color = 'pink-500', icon = 'Gift' WHERE name = '용돈';
UPDATE categories SET color = 'indigo-500', icon = 'Wallet' WHERE name = '기타 수입';
```

- [ ] **Step 2: 로컬 DB에 마이그레이션 적용**
Run: `npx supabase db reset` (또는 docker가 떠있다면 push/apply)

- [ ] **Step 3: Commit**
```bash
git add supabase/migrations/20260514000000_add_category_style_fields.sql
git commit -m "db: add color and icon fields to categories"
```

### Task 2: 카테고리 관리 페이지 및 라우팅 설정

**Files:**
- Create: `src/pages/Categories.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout/Header.tsx`

- [ ] **Step 1: 빈 Categories 페이지 생성**
```tsx
export default function Categories() {
  return <div className="p-4"><h1>카테고리 관리</h1></div>
}
```

- [ ] **Step 2: App.tsx 라우트 등록**
```tsx
// Route 추가
<Route path="/categories" element={<Categories />} />
```

- [ ] **Step 3: Header.tsx에 메뉴 링크 추가**
```tsx
<Link to="/categories" className="...">카테고리</Link>
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/Categories.tsx src/App.tsx src/components/Layout/Header.tsx
git commit -m "feat: add categories page and navigation"
```

### Task 3: 카테고리 관리 UI (목록 및 탭)

**Files:**
- Modify: `src/pages/Categories.tsx`

- [x] **Step 1: 수입/지출 탭 및 목록 UI 구현**
- [x] **Step 2: 실시간 데이터 동기화 연동**
- [x] **Step 3: Commit**

### Task 4: 카테고리 추가/수정 모달 구현 (아이콘/색상 선택 포함)

**Files:**
- Create: `src/components/Categories/CategoryForm.tsx`

- [ ] **Step 1: 색상 팔레트(12색) 및 아이콘 그리드(Lucide) 구현**
```tsx
const COLORS = ['red-500', 'orange-500', 'amber-500', ...];
const ICONS = ['Utensils', 'Car', 'Home', ...];
```

- [ ] **Step 2: 카테고리 저장/수정 로직 구현**
```tsx
const { error } = await supabase.from('categories').upsert({ name, type, color, icon, user_id })
```

- [ ] **Step 3: Commit**
```bash
git add src/components/Categories/CategoryForm.tsx
git commit -m "feat: add CategoryForm with icon and color picker"
```

### Task 5: 기존 거래 내역 UI 연동

**Files:**
- Modify: `src/components/Transactions/TransactionForm.tsx`
- Modify: `src/components/Transactions/TransactionList.tsx`

- [ ] **Step 1: TransactionForm 카테고리 선택 시 아이콘/색상 표시**
- [ ] **Step 2: TransactionList 항목에 카테고리 아이콘/색상 렌더링**

- [ ] **Step 3: Commit**
```bash
git add src/components/Transactions/TransactionForm.tsx src/components/Transactions/TransactionList.tsx
git commit -m "feat: visualize categories in transactions"
```
