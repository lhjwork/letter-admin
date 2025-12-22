# Letter My Admin 프론트엔드 가이드

## 개요

Letter My 서비스의 관리자 페이지 프론트엔드입니다. React 19 + TypeScript 기반으로 구축되었으며, 역할 기반 권한 관리 시스템을 제공합니다.

## 기술 스택

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query + Ky
- **Styling**: SCSS
- **Routing**: React Router DOM
- **Encryption**: crypto-js (AES)

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트
├── components/       # 재사용 컴포넌트
├── hooks/           # 커스텀 훅
├── pages/           # 페이지 컴포넌트
├── stores/          # Zustand 스토어
├── styles/          # 전역 스타일
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

## 핵심 기능

### 1. 인증 시스템

#### 로그인 프로세스

1. 사용자가 아이디/비밀번호 입력
2. AES 암호화 키 조회 (`/auth/encryption-key`) 양방향 암호화
3. 비밀번호 AES 암호화
4. 로그인 요청 (`/auth/login`)
5. JWT 토큰 및 사용자 정보 저장

```typescript
// src/api/auth.ts
export const login = async (username: string, password: string) => {
  const encryptedPassword = await encryptPassword(password);
  return apiClient.post("admin/auth/login", {
    json: { username, password: encryptedPassword, encrypted: true },
  });
};
```

### 2. 사용자 관리 시스템

#### 기본 기능

- 사용자 목록 조회 및 필터링
- 사용자 상세 정보 조회
- 사용자 정지/해제
- 사용자 삭제

#### 고급 기능 (v2.0)

- **빠른 검색**: 실시간 사용자 검색 및 바로 이동
- **사용자 통계**: 편지 수, 스토리 수, 조회 수, 좋아요 수
- **편지 목록**: 사용자가 작성한 모든 편지 조회
- **탭 기반 UI**: 기본 정보, 통계, 편지 목록을 탭으로 구분

```typescript
// 사용자 상세 정보 (통계 포함)
export interface UserDetail extends User {
  stats: UserStats;
}

// 사용자 통계
export interface UserStats {
  totalLetters: number;
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  joinedAt: string;
  lastActiveAt?: string;
}
```

#### 새로운 API 엔드포인트

- `GET /admin/users/:id/detail` - 사용자 상세 정보 (통계 포함)
- `GET /admin/users/:id/stats` - 사용자 통계
- `GET /admin/users/:id/letters` - 사용자 편지 목록
- `GET /admin/users/search` - 사용자 검색

#### 토큰 관리

- Zustand persist 미들웨어로 localStorage에 저장
- API 요청 시 자동으로 Authorization 헤더 추가
- 401 응답 시 자동 로그아웃 처리

### 2. 권한 관리 시스템

#### 역할 정의

```typescript
export type AdminRole = "super_admin" | "admin" | "manager";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: Object.values(PERMISSIONS), // 모든 권한
  admin: [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE, PERMISSIONS.LETTERS_READ, PERMISSIONS.LETTERS_WRITE, PERMISSIONS.LETTERS_DELETE, PERMISSIONS.DASHBOARD_READ],
  manager: [PERMISSIONS.USERS_READ, PERMISSIONS.LETTERS_READ, PERMISSIONS.DASHBOARD_READ],
};
```

#### 권한 체크

```typescript
// 컴포넌트에서 권한 체크
const { hasPermission, isSuperAdmin } = usePermission();

// 조건부 렌더링
{
  hasPermission(PERMISSIONS.USERS_WRITE) && <Button>사용자 수정</Button>;
}

// 권한 가드 컴포넌트
<PermissionGuard permission={PERMISSIONS.ADMINS_READ}>
  <AdminManagement />
</PermissionGuard>;
```

### 3. 데이터 관리

#### React Query 패턴

```typescript
// 데이터 조회
export const useUsers = (params: UserQueryParams) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => usersApi.getUsers(params),
  });
};

// 데이터 변경
export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => usersApi.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
};
```

#### 상태 관리 (Zustand)

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      setAuth: (token, admin) => set({ token, admin, isAuthenticated: true }),
      logout: () => set({ token: null, admin: null, isAuthenticated: false }),

      hasPermission: (permission) => {
        // 권한 체크 로직
      },
    }),
    { name: "admin-auth" }
  )
);
```

## 주요 페이지

### 1. 대시보드 (`/dashboard`)

- 사용자/편지 통계 카드
- 최근 가입 사용자 목록
- 최근 작성된 편지/사연 목록

### 2. 관리자 관리 (`/admins`) - Super Admin 전용

- 관리자 목록 조회/검색/필터링
- 관리자 생성/수정/삭제
- 역할 및 권한 설정

### 3. 사용자 관리 (`/users`)

- 사용자 목록 조회/검색/필터링
- 사용자 상세 정보 조회
- 사용자 정지/해제/삭제

### 4. 편지/사연 관리 (`/letters`)

- 편지/사연 목록 조회/검색/필터링
- 편지/사연 상세 내용 조회
- 상태 변경 (공개/숨김/삭제)

## 컴포넌트 구조

### 1. 공통 컴포넌트 (`components/common/`)

- **Button**: 다양한 스타일의 버튼 컴포넌트
- **Input**: 폼 입력 컴포넌트
- **Select**: 드롭다운 선택 컴포넌트
- **Modal**: 모달 다이얼로그
- **Table**: 데이터 테이블 (정렬, 페이징 지원)
- **Pagination**: 페이지네이션
- **Loading**: 로딩 스피너
- **PermissionGuard**: 권한 기반 조건부 렌더링

### 2. 레이아웃 컴포넌트 (`components/layout/`)

- **AdminLayout**: 전체 레이아웃 (사이드바 + 헤더 + 콘텐츠)
- **Sidebar**: 네비게이션 사이드바 (권한별 메뉴)
- **Header**: 상단 헤더 (사용자 정보, 로그아웃)

### 3. 도메인별 컴포넌트

각 도메인(admins, users, letters)별로 구성:

#### 사용자 관리 (`components/users/`)

- **UserTable**: 사용자 목록 테이블
- **UserFilter**: 사용자 검색/필터 컴포넌트
- **UserDetail**: 사용자 기본 정보 표시
- **UserSearch**: 실시간 사용자 검색 (v2.0)
- **UserStats**: 사용자 통계 정보 (v2.0)
- **UserLetters**: 사용자 편지 목록 (v2.0)
- **BanModal**: 사용자 정지 모달

#### 관리자 관리 (`components/admins/`)

- **AdminTable**: 관리자 목록 테이블
- **AdminDetail**: 관리자 상세 정보
- **AdminForm**: 관리자 생성/수정 폼

#### 편지 관리 (`components/letters/`)

- **LetterTable**: 편지 목록 테이블
- **LetterFilter**: 편지 검색/필터
- **LetterDetail**: 편지 상세 내용
- **StatusModal**: 편지 상태 변경 모달

#### 대시보드 (`components/dashboard/`)

- **StatsCard**: 통계 카드
- **RecentUsers**: 최근 가입 사용자
- **RecentLetters**: 최근 편지

## API 통신

### 1. 클라이언트 설정

```typescript
// src/api/client.ts
export const apiClient = ky.create({
  prefixUrl: API_BASE_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
        return response;
      },
    ],
  },
});
```

### 2. API 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}
```

## 스타일링

### 1. SCSS 구조

```
src/styles/
├── _variables.scss  # 색상, 크기 등 변수
├── _mixins.scss     # 재사용 가능한 믹스인
└── global.scss      # 전역 스타일
```

### 2. 컴포넌트별 스타일

- 각 컴포넌트마다 동일한 이름의 `.scss` 파일
- BEM 방법론 사용 (`block__element--modifier`)

## 라우팅

### 1. 라우트 구조

```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<Dashboard />} />
    <Route
      path="admins"
      element={
        <SuperAdminRoute>
          <Admins />
        </SuperAdminRoute>
      }
    />
    <Route path="users" element={<Users />} />
    <Route path="letters" element={<Letters />} />
  </Route>
</Routes>
```

### 2. 라우트 가드

- **ProtectedRoute**: 로그인 여부 확인
- **SuperAdminRoute**: Super Admin 권한 확인

## 개발 가이드

### 1. 새로운 페이지 추가

1. `src/pages/` 에 페이지 컴포넌트 생성
2. `src/App.tsx` 에 라우트 추가
3. 필요시 `src/components/layout/Sidebar.tsx` 에 메뉴 추가

### 2. 새로운 API 추가

1. `src/api/` 에 API 함수 정의
2. `src/hooks/` 에 React Query 훅 생성
3. `src/types/` 에 타입 정의 추가

### 3. 권한 추가

1. `src/types/index.ts` 의 `PERMISSIONS` 에 권한 추가
2. `ROLE_PERMISSIONS` 에 역할별 권한 매핑
3. 컴포넌트에서 `usePermission` 훅 사용

## 환경 설정

### 1. 환경 변수

```env
VITE_API_URL=http://localhost:5001/api
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

### 3. 빌드

```bash
pnpm build
```

## 보안 고려사항

### 1. 비밀번호 암호화

- AES 암호화를 사용하여 비밀번호 전송
- 암호화 키는 서버에서 동적으로 조회

### 2. 토큰 관리

- JWT 토큰을 localStorage에 저장
- 토큰 만료 시 자동 로그아웃

### 3. 권한 검증

- 프론트엔드와 백엔드 양쪽에서 권한 검증
- 민감한 기능은 서버 사이드에서 재검증

## 트러블슈팅

### 1. 로그인 실패

- 네트워크 탭에서 API 요청/응답 확인
- 암호화된 비밀번호가 올바른지 확인
- 백엔드 로그 확인

### 2. 권한 오류

- 사용자 역할과 권한 설정 확인
- `usePermission` 훅의 권한 체크 로직 확인

### 3. 빌드 오류

- TypeScript 타입 오류 확인
- 의존성 버전 호환성 확인

## 향후 개선사항

1. **다국어 지원**: i18n 라이브러리 도입
2. **테마 시스템**: 다크모드 지원
3. **실시간 알림**: WebSocket 연동
4. **성능 최적화**: 코드 스플리팅, 가상화
5. **테스트**: Jest + Testing Library 도입

## 새로운 기능 가이드 (v2.0)

### 1. 빠른 사용자 검색

사용자 목록 페이지에서 우측 상단의 "🔍 빠른 검색" 버튼을 클릭하면 실시간 검색 기능을 사용할 수 있습니다.

```typescript
// UserSearch 컴포넌트 사용법
<UserSearch onSelectUser={(user) => navigate(`/users/${user._id}`)} placeholder="사용자 이름 또는 이메일 검색..." />
```

### 2. 사용자 상세 페이지 탭 구조

사용자 상세 페이지는 3개의 탭으로 구성됩니다:

- **기본 정보**: 사용자 프로필, 계정 상태, 주소 정보
- **통계**: 편지 수, 스토리 수, 조회 수, 좋아요 수
- **편지 목록**: 사용자가 작성한 모든 편지 (상태별 필터링 가능)

### 3. 사용자 통계 정보

```typescript
// 통계 데이터 구조
interface UserStats {
  totalLetters: number; // 총 편지 수
  totalStories: number; // 총 스토리 수
  totalViews: number; // 총 조회 수
  totalLikes: number; // 총 좋아요 수
  joinedAt: string; // 가입일
  lastActiveAt?: string; // 마지막 활동일
}
```

### 4. 사용자 편지 목록

사용자가 작성한 편지를 상태별로 필터링하여 조회할 수 있습니다:

- 전체 상태
- 작성됨 (created)
- 게시됨 (published)
- 숨김 (hidden)
- 삭제됨 (deleted)

각 편지는 제목, 내용 미리보기, 카테고리, 통계 정보를 표시합니다.

## 개발 팁

### 1. 새로운 API 엔드포인트 추가

1. `src/types/index.ts`에 타입 정의 추가
2. `src/api/[domain].ts`에 API 함수 추가
3. `src/hooks/use[Domain].ts`에 React Query 훅 추가
4. 컴포넌트에서 훅 사용

### 2. 새로운 컴포넌트 추가

1. 컴포넌트 파일 생성 (`ComponentName.tsx`)
2. 스타일 파일 생성 (`ComponentName.scss`)
3. 타입 정의 및 props 인터페이스 작성
4. 스토리북 스토리 추가 (선택사항)

### 3. 권한 기반 기능 추가

```typescript
// 권한 체크 후 조건부 렌더링
const { hasPermission } = usePermission();

return <div>{hasPermission(PERMISSIONS.USERS_WRITE) && <Button onClick={handleEdit}>수정</Button>}</div>;
```

## 버전 히스토리

### v2.0 (현재)

- 사용자 관리 기능 대폭 강화
- 빠른 검색 기능 추가
- 사용자 통계 및 편지 목록 조회
- 탭 기반 사용자 상세 페이지
- 실시간 검색 컴포넌트

### v1.0

- 기본 관리자 시스템 구축
- 인증 및 권한 관리
- 사용자, 관리자, 편지 기본 CRUD
- 대시보드 통계
