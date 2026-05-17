# DOMAIN ACCOUNTING STATUTE

## 데이터베이스 스키마 설계

### 1. categories (카테고리 테이블)
| 컬럼명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK, default gen_random_uuid() | 식별자 |
| name | text | not null | 카테고리 이름 (예: 식비, 월급) |
| type | text | not null | 수입(income) 또는 지출(expense) 구분 |
| user_id | uuid | FK to auth.users, nullable | 특정 유저용 (null이면 공통 기본 카테고리) |
| color | text | default 'gray-500' | 카테고리 테마 색상 (Tailwind CSS 클래스 방식) |
| icon | text | default 'Tag' | Lucide-React 아이콘 이름 |

### 2. transactions (거래 내역 테이블)
| 컬럼명 | 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| id | uuid | PK, default gen_random_uuid() | 식별자 |
| user_id | uuid | FK to auth.users, not null | 소유자 ID |
| amount | numeric | not null | 금액 (부동소수점 오차 방지) |
| type | text | not null | 수입(income) 또는 지출(expense) |
| category_id | uuid | FK to categories, not null | 카테고리 식별자 |
| description | text | | 상세 메모 내용 |
| date | date | not null, default current_date | 거래 발생 날짜 |
| created_at | timestamptz | default now() | 데이터 생성 시각 |

## 구현 규칙
- **RLS (Row Level Security)**: `transactions` 테이블은 `user_id = auth.uid()` 정책을 적용한다.
- **금액 처리**: 프론트엔드와 백엔드 모두에서 금액은 `numeric` 또는 정수(Cents 단위)로 처리하여 오차를 방지한다.
- **날짜 처리**: 시간 정보가 필요 없는 거래 날짜는 `date` 타입을 사용한다.
