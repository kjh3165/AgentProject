# MoneyFlow (개인 가계부 서비스)

AI 에이전트를 활용하여 개발한 직관적이고 깔끔한 개인 가계부 웹 애플리케이션입니다. 사용자의 수입과 지출을 체계적으로 관리하고, 시각화된 데이터를 통해 소비 습관을 파악할 수 있도록 돕습니다.

---

# 프로젝트 개요

- **프로젝트 목적**: 개인의 금융 데이터를 쉽고 빠르게 기록하고 한눈에 파악할 수 있는 환경 제공
- **주요 기능 설명**: 이메일 기반 인증, 실시간 카테고리 및 거래 내역 관리, 월별 통계 대시보드
- **어떤 문제를 해결하는지**: 복잡한 자산 관리의 진입장벽을 낮추고, 수동 기록의 번거로움을 UI/UX 최적화를 통해 해결
- **프로젝트 진행 배경**: Gemini CLI 등 최신 AI 에이전트와 Supabase 클라우드 인프라를 활용한 현대적 웹 애플리케이션 구축 연습

---

# 기술 스택

## Frontend

- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS (v4)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router

## Backend

- **BaaS**: Supabase (Auth, PostgreSQL)
- **Database**: PostgreSQL with RLS (Row Level Security)

## AI Agent

- **Gemini CLI**: 전체 아키텍처 설계, 기능 구현, 디버깅 및 배포 자동화 수행

---

# 주요 기능

- **사용자 인증**: Supabase Auth를 활용한 이메일 가입/로그인 및 세션 유지
- **카테고리 커스터마이징**: 아이콘과 색상 바를 활용한 개성 있는 카테고리 관리 (CRUD)
- **거래 내역 관리**: 실시간 데이터베이스 동기화를 통한 수입/지출 내역 기록
- **데이터 시각화**: 월별 총액 요약 및 카테고리별 지출 비중을 파이 차트로 표시
- **SPA 라우팅**: 새로고침 시에도 안정적인 페이지 유지를 위한 Vercel 리라이트 설정

---

# 프로젝트 구조

```text
src/
 ├── components/           # 재사용 가능한 UI 컴포넌트
 │   ├── Auth/             # 로그인 및 회원가입 폼
 │   ├── Categories/       # 카테고리 생성 및 수정 모달
 │   ├── Layout/           # 헤더, 네비게이션 등 공통 레이아웃
 │   └── Transactions/     # 거래 내역 입력 폼 및 목록 표시
 ├── lib/                  # 외부 서비스 설정
 │   └── supabase.ts       # Supabase 클라이언트 초기화 및 환경변수 로드
 ├── pages/                # 라우트에 매핑되는 페이지 컴포넌트
 │   ├── Dashboard.tsx     # 월별 통계 및 차트 요약
 │   ├── Categories.tsx    # 카테고리 목록 및 관리 페이지
 │   └── Transactions.tsx  # 거래 내역 상세 관리 페이지
 ├── App.tsx               # 라우팅 정의 및 전체 앱 구조 설계
 ├── main.tsx              # React 앱 엔트리 포인트
 └── index.css             # Tailwind CSS 및 글로벌 스타일 정의
supabase/
 ├── migrations/           # DB 스키마, 제약 조건 및 RLS 정책 SQL
 └── config.toml           # Supabase 로컬 개발 환경 설정
vercel.json                # Vercel 배포를 위한 SPA 라우팅 리라이트 설정
```

---

# 실행 방법

## 1. 프로젝트 설치

```bash
npm install
```

## 2. 환경변수 설정

`.env.local`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 실행

```bash
npm run dev
```

---

# Supabase 설정

- **Authentication**: 사용함 (이메일/비밀번호 인증)
- **사용한 테이블 설명**:
  - `categories`: 유저별 맞춤 카테고리 및 시스템 기본 카테고리 저장 (유저별 중복 이름 방지 제약 조건 포함)
  - `transactions`: 유저의 모든 수입/지출 거래 내역 저장
- **주요 정책(RLS) 설명**: 
  - 유저는 오직 본인의 데이터만 조회/수정/삭제 가능 (`auth.uid() = user_id`)
  - 기본 카테고리는 모든 유저가 조회(`SELECT`) 가능하지만 수정은 불가 (`user_id IS NULL`)
- **Storage**: 현재 사용하지 않음

---
