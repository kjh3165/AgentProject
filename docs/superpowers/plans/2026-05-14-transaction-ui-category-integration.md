# 기존 거래 내역 UI 연동 (Task 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 거래 내역 입력 폼과 목록에서 카테고리 아이콘과 색상을 표시하여 사용자 경험을 향상시킵니다.

**Architecture:** `transactions` 테이블 조회 시 `categories` 테이블을 조인하여 아이콘과 색상 정보를 가져오고, `lucide-react`를 사용하여 동적으로 아이콘을 렌더링합니다.

**Tech Stack:** React, TypeScript, Supabase, Tailwind CSS, lucide-react

---

### Task 1: TransactionList.tsx 수정 - 데이터 조회 및 인터페이스 업데이트

**Files:**
- Modify: `src/components/Transactions/TransactionList.tsx`

- [ ] **Step 1: Transaction 인터페이스 업데이트**
  `categories` 객체에 `icon`과 `color` 필드를 추가합니다.

- [ ] **Step 2: fetchTransactions 쿼리 수정**
  `select` 절에서 `categories`의 `icon`과 `color`를 추가로 조회하도록 수정합니다.

- [ ] **Step 3: lucide-react import 추가**
  `import * as Icons from 'lucide-react'`를 추가합니다.

- [ ] **Step 4: UI 수정 (아이콘 렌더링)**
  카테고리 이름 옆에 아이콘을 표시하고 색상을 적용합니다.

### Task 2: TransactionForm.tsx 수정 - 카테고리 데이터 조회 및 시각적 피드백 추가

**Files:**
- Modify: `src/components/Transactions/TransactionForm.tsx`

- [ ] **Step 1: Category 인터페이스 업데이트**
  `icon`과 `color` 필드를 추가합니다.

- [ ] **Step 2: fetchCategories 쿼리 수정**
  `icon`과 `color`를 조회하도록 수정합니다.

- [ ] **Step 3: lucide-react import 추가**
  `import * as Icons from 'lucide-react'`를 추가합니다.

- [ ] **Step 4: UI 수정 (선택된 카테고리 아이콘 표시)**
  카테고리 드롭다운 근처에 현재 선택된 카테고리의 아이콘과 색상을 표시합니다.
