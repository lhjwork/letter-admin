# Letter My Admin 백엔드 API 요구사항

## 개요

Letter My 서비스의 관리자 페이지 프론트엔드에서 사용할 새로운 API 엔드포인트들을 구현해야 합니다. 이 문서는 AI 백엔드 개발을 위한 상세한 요구사항을 제공합니다.

## 기존 환경 정보

- **백엔드 URL**: `http://localhost:5001`
- **API Base Path**: `/api/admin`
- **인증 방식**: JWT Bearer Token
- **데이터베이스**: MongoDB
- **기존 구현된 엔드포인트**:
  - `POST /api/admin/auth/login` - 관리자 로그인
  - `GET /api/admin/auth/encryption-key` - AES 암호화 키 조회
  - `GET /api/admin/users` - 사용자 목록 조회
  - `GET /api/admin/users/:id` - 사용자 상세 조회
  - `POST /api/admin/users/:id/ban` - 사용자 정지
  - `POST /api/admin/users/:id/unban` - 사용자 정지 해제
  - `DELETE /api/admin/users/:id` - 사용자 삭제

## 새로 구현해야 할 API 엔드포인트

### 1. 사용자 상세 정보 (통계 포함)

```
GET /api/admin/users/:id/detail
```

**목적**: 사용자 기본 정보와 통계 정보를 함께 조회

**인증**: JWT Bearer Token 필요

**권한**: `users.read` 권한 필요

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "_id": "69365701abedd0b95bbe32d2",
    "email": "user@example.com",
    "name": "사용자명",
    "image": "https://example.com/profile.jpg",
    "status": "active",
    "oauthAccounts": [
      {
        "provider": "kakao",
        "providerId": "kakao123456"
      }
    ],
    "addresses": [
      {
        "_id": "addr123",
        "addressName": "집",
        "recipientName": "홍길동",
        "zipCode": "12345",
        "address": "서울시 강남구",
        "addressDetail": "101동 101호",
        "phone": "010-1234-5678",
        "isDefault": true
      }
    ],
    "bannedAt": null,
    "bannedReason": null,
    "deletedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-12-22T00:00:00.000Z",
    "letterCount": 15,
    "lastActiveAt": "2024-12-22T00:00:00.000Z",
    "stats": {
      "totalLetters": 15,
      "totalStories": 8,
      "totalViews": 1250,
      "totalLikes": 89,
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "lastActiveAt": "2024-12-22T00:00:00.000Z"
    }
  }
}
```

**구현 로직**:

1. 사용자 기본 정보 조회
2. 해당 사용자의 편지/스토리 통계 계산
3. 조회수, 좋아요 수 집계
4. 통합된 응답 반환

### 2. 사용자 통계 정보

```
GET /api/admin/users/:id/stats
```

**목적**: 사용자의 통계 정보만 조회

**인증**: JWT Bearer Token 필요

**권한**: `users.read` 권한 필요

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "totalLetters": 15,
    "totalStories": 8,
    "totalViews": 1250,
    "totalLikes": 89,
    "joinedAt": "2024-01-01T00:00:00.000Z",
    "lastActiveAt": "2024-12-22T00:00:00.000Z"
  }
}
```

**구현 로직**:

1. Letters 컬렉션에서 해당 userId로 필터링
2. type별로 개수 집계 (letter, story)
3. viewCount, likeCount 합계 계산
4. 가입일, 마지막 활동일 조회

### 3. 사용자 편지 목록

```
GET /api/admin/users/:id/letters?page=1&limit=10&status=published
```

**목적**: 특정 사용자가 작성한 편지 목록을 페이지네이션과 필터링으로 조회

**인증**: JWT Bearer Token 필요

**권한**: `letters.read` 권한 필요

**쿼리 파라미터**:

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10, 최대: 100)
- `status` (optional): 편지 상태 필터 ("created", "published", "hidden", "deleted")

**응답 구조**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter123",
      "type": "letter",
      "userId": "69365701abedd0b95bbe32d2",
      "title": "편지 제목",
      "content": "편지 내용입니다...",
      "authorName": "작성자명",
      "category": "가족",
      "status": "published",
      "viewCount": 150,
      "likeCount": 12,
      "hiddenAt": null,
      "hiddenReason": null,
      "deletedAt": null,
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**구현 로직**:

1. userId로 편지 필터링
2. status 파라미터가 있으면 추가 필터링
3. 페이지네이션 적용
4. 최신순 정렬 (createdAt desc)

### 4. 사용자 검색

```
GET /api/admin/users/search?query=검색어&limit=10&status=active
```

**목적**: 사용자 이름 또는 이메일로 실시간 검색

**인증**: JWT Bearer Token 필요

**권한**: `users.read` 권한 필요

**쿼리 파라미터**:

- `query` (required): 검색어 (이름 또는 이메일)
- `limit` (optional): 결과 개수 제한 (기본값: 10, 최대: 50)
- `status` (optional): 사용자 상태 필터 ("active", "banned", "deleted")

**응답 구조**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "user123",
      "email": "user@example.com",
      "name": "사용자명",
      "image": "https://example.com/profile.jpg",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "letterCount": 5,
      "lastActiveAt": "2024-12-20T00:00:00.000Z"
    }
  ]
}
```

**구현 로직**:

1. 이름 또는 이메일에서 부분 문자열 검색 (case-insensitive)
2. MongoDB의 `$regex` 또는 텍스트 인덱스 활용
3. status 필터 적용
4. limit 적용하여 결과 제한

## 데이터 타입 정의

### TypeScript 인터페이스 (참고용)

```typescript
// 편지 상태
type LetterStatus = "created" | "published" | "hidden" | "deleted";

// 편지 타입
type LetterType = "story" | "letter";

// 편지 카테고리
type LetterCategory = "가족" | "사랑" | "우정" | "성장" | "위로" | "추억" | "감사" | "기타";

// 사용자 상태
type UserStatus = "active" | "banned" | "deleted";

// OAuth 제공자
type OAuthProvider = "instagram" | "naver" | "kakao";

// 사용자 통계
interface UserStats {
  totalLetters: number;
  totalStories: number;
  totalViews: number;
  totalLikes: number;
  joinedAt: string;
  lastActiveAt?: string;
}

// 편지 객체
interface Letter {
  _id: string;
  type: LetterType;
  userId?: string;
  title: string;
  content: string;
  authorName: string;
  category: LetterCategory;
  status: LetterStatus;
  viewCount: number;
  likeCount: number;
  hiddenAt?: string;
  hiddenReason?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 보안 및 권한 요구사항

### 1. 인증 검증

- 모든 엔드포인트는 JWT 토큰 검증 필요
- Authorization 헤더: `Bearer <token>`
- 토큰 만료 시 401 Unauthorized 응답

### 2. 권한 검증

- 관리자 역할별 권한 체크 필요
- `users.read`: 사용자 정보 조회 권한
- `letters.read`: 편지 정보 조회 권한
- 권한 없을 시 403 Forbidden 응답

### 3. 입력 검증

- 모든 파라미터 유효성 검사
- SQL Injection, NoSQL Injection 방지
- XSS 방지를 위한 출력 이스케이프

## 성능 요구사항

### 1. 응답 시간

- 일반 조회: 200ms 이내
- 통계 계산: 500ms 이내
- 검색: 300ms 이내

### 2. 데이터베이스 최적화

- 필요한 인덱스 생성:
  - `users.email` (검색용)
  - `users.name` (검색용)
  - `letters.userId` (사용자별 편지 조회용)
  - `letters.status` (상태별 필터링용)
  - `letters.createdAt` (정렬용)

### 3. 페이지네이션

- 기본 limit: 10
- 최대 limit: 100 (성능 보호)
- offset 기반 페이지네이션 사용

## 오류 처리

### 1. 표준 오류 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "사용자를 찾을 수 없습니다",
    "details": {}
  }
}
```

### 2. 주요 오류 코드

- `USER_NOT_FOUND`: 사용자를 찾을 수 없음 (404)
- `INVALID_PARAMETERS`: 잘못된 파라미터 (400)
- `UNAUTHORIZED`: 인증 실패 (401)
- `FORBIDDEN`: 권한 없음 (403)
- `INTERNAL_ERROR`: 서버 내부 오류 (500)

## 테스트 케이스

### 1. 사용자 상세 정보 API

```bash
# 정상 케이스
GET /api/admin/users/69365701abedd0b95bbe32d2/detail
Authorization: Bearer <valid_token>

# 존재하지 않는 사용자
GET /api/admin/users/invalid_id/detail
Authorization: Bearer <valid_token>
# 예상 응답: 404 USER_NOT_FOUND

# 권한 없음
GET /api/admin/users/69365701abedd0b95bbe32d2/detail
Authorization: Bearer <invalid_token>
# 예상 응답: 401 UNAUTHORIZED
```

### 2. 편지 목록 API

```bash
# 정상 케이스
GET /api/admin/users/69365701abedd0b95bbe32d2/letters?page=1&limit=5&status=published
Authorization: Bearer <valid_token>

# 잘못된 파라미터
GET /api/admin/users/69365701abedd0b95bbe32d2/letters?page=0&limit=1000
Authorization: Bearer <valid_token>
# 예상 응답: 400 INVALID_PARAMETERS
```

### 3. 사용자 검색 API

```bash
# 정상 케이스
GET /api/admin/users/search?query=홍길동&limit=10
Authorization: Bearer <valid_token>

# 빈 검색어
GET /api/admin/users/search?query=&limit=10
Authorization: Bearer <valid_token>
# 예상 응답: 빈 배열 또는 400 오류
```

## 구현 우선순위

1. **높음**: 사용자 편지 목록 API - 프론트엔드에서 가장 많이 사용
2. **높음**: 사용자 검색 API - 실시간 검색 기능에 필수
3. **중간**: 사용자 통계 API - 통계 탭에서 사용
4. **중간**: 사용자 상세 정보 API - 통합 정보 제공

## 배포 및 모니터링

### 1. 로깅

- API 호출 로그 (요청/응답 시간, 상태 코드)
- 오류 로그 (스택 트레이스 포함)
- 성능 로그 (느린 쿼리 감지)

### 2. 모니터링 지표

- API 응답 시간
- 오류율
- 동시 접속자 수
- 데이터베이스 쿼리 성능

## 참고사항

1. **기존 코드 스타일 유지**: 현재 백엔드 프로젝트의 코딩 스타일과 아키텍처 패턴을 따라주세요
2. **환경 변수**: 필요한 설정값들은 환경 변수로 관리해주세요
3. **문서화**: 각 API에 대한 JSDoc 또는 Swagger 문서를 작성해주세요
4. **테스트**: 단위 테스트와 통합 테스트를 작성해주세요

이 문서를 바탕으로 AI 백엔드 개발을 진행하시면, 프론트엔드의 새로운 사용자 관리 기능들이 완전히 작동할 것입니다.
