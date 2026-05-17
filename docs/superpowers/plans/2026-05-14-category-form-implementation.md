# 카테고리 추가/수정 모달 구현 계획 (Task 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 카테고리의 이름, 유형, 색상, 아이콘을 설정할 수 있는 모달 UI를 구현하고, Supabase DB에 저장/수정하는 기능을 완성함.

**Architecture:**
- **Component**: `CategoryForm.tsx`를 통해 독립적인 입력 폼 구축.
- **State Management**: React `useState`를 사용하여 폼 상태 관리 및 `Categories.tsx`에서 모달 개폐 상태 관리.
- **Data Persistence**: Supabase `upsert`를 사용하여 추가와 수정을 하나의 로직으로 처리.
- **UX**: Tailwind CSS를 사용한 그리드 기반 색상/아이콘 선택기 구현.

**Tech Stack:** React, TypeScript, Supabase, Lucide-React, Tailwind CSS.

---

### Task 4.1: CategoryForm 컴포넌트 생성

**Files:**
- Create: `src/components/Categories/CategoryForm.tsx`

- [ ] **Step 1: 상수 정의 (색상 및 아이콘)**
```tsx
const COLORS = [
  'red-500', 'orange-500', 'amber-500', 'yellow-500', 
  'emerald-500', 'teal-500', 'blue-500', 'indigo-500', 
  'purple-500', 'pink-500', 'rose-500', 'gray-500'
];

const ICONS = [
  'Utensils', 'Car', 'Home', 'ShoppingBag', 'HeartPulse', 
  'Gamepad2', 'Gift', 'Banknote', 'TrendingUp', 'Wallet', 
  'Plane', 'Coffee', 'Music', 'Book', 'Camera', 
  'Phone', 'Shield', 'Zap', 'Star', 'Tag'
];
```

- [ ] **Step 2: 기본 UI 구조 및 폼 상태 구현**
- [ ] **Step 3: Supabase upsert 로직 구현**
- [ ] **Step 4: Commit**
```bash
git add src/components/Categories/CategoryForm.tsx
git commit -m "feat: implement CategoryForm component with color and icon picker"
```

### Task 4.2: Categories 페이지 연동

**Files:**
- Modify: `src/pages/Categories.tsx`

- [ ] **Step 1: 모달 상태 및 편집 데이터 상태 추가**
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
const [editingCategory, setEditingCategory] = useState<Category | undefined>();
```

- [ ] **Step 2: '추가' 버튼 클릭 핸들러 구현**
- [ ] **Step 3: 카테고리 아이템에 '수정' 및 '삭제' 버튼 추가**
- [ ] **Step 4: CategoryForm 모달 렌더링 및 연동**
- [ ] **Step 5: 카테고리 삭제 로직 구현**
- [ ] **Step 6: Commit**
```bash
git add src/pages/Categories.tsx
git commit -m "feat: connect CategoryForm modal and add delete functionality to Categories page"
```

### Task 4.3: 검증 및 문서 업데이트

- [ ] **Step 1: 카테고리 추가/수정/삭제 동작 확인**
- [ ] **Step 2: TODO-DONE.md 업데이트**
- [ ] **Step 3: AI-ACTION-LOGS.md 업데이트**
- [ ] **Step 4: CONTEXT.md 업데이트**
