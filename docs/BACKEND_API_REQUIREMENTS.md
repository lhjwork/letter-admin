# 백엔드 API 요구사항 문서 - 단순화된 실물 편지 시스템

## 개요

실물 편지 상태 표시 시스템을 단순화하여 편지 중심의 관리 시스템으로 개선합니다.

## 핵심 변경사항

### 기존 문제점

- 복잡한 개별 주소 추적 시스템
- 클릭해서 모달을 열어야 상태 확인 가능
- 편지 상세 페이지에서 바로 상태를 확인하기 어려움

### 개선 목표

- 편지 상세 페이지에서 신청한 사용자의 편지 상태를 바로 표시
- 클릭 없이 즉시 상태 확인 가능
- 간단하고 직관적인 UI
- 편지별 통합 상태 관리

## 새로운 데이터 구조

### Letter 모델 확장

```typescript
interface Letter {
  _id: string;
  type: "story" | "letter";
  userId?: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  status: "created" | "published" | "hidden" | "deleted";
  viewCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  // 실물 편지 관련 필드 (단순화)
  physicalLetter?: {
    totalRequests: number;
    currentStatus: "none" | "requested" | "writing" | "sent" | "delivered";
    lastUpdatedAt?: string;
    adminNote?: string;
  };
}
```

### 단순화된 상태값

- `none`: 실물 편지 신청 없음
- `requested`: 신청됨 (승인 대기)
- `writing`: 작성중
- `sent`: 발송됨
- `delivered`: 배송완료

## 필요한 API 엔드포인트

### 1. 편지 목록 조회 (실물 편지 상태 포함)

```
GET /admin/letters
```

**Query Parameters:**

- `page?: number` - 페이지 번호 (기본값: 1)
- `limit?: number` - 페이지당 항목 수 (기본값: 10)
- `search?: string` - 검색어 (편지 제목, 작성자)
- `type?: string` - 편지 타입 ("story" | "letter")
- `category?: string` - 카테고리
- `status?: string` - 편지 상태
- `physicalStatus?: string` - 실물 편지 상태 필터
- `sort?: string` - 정렬 필드
- `order?: string` - 정렬 순서

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter_id",
      "title": "소중한 친구에게",
      "authorName": "김철수",
      "type": "letter",
      "category": "우정",
      "status": "published",
      "viewCount": 150,
      "likeCount": 25,
      "createdAt": "2024-01-01T00:00:00Z",
      "physicalLetter": {
        "totalRequests": 3,
        "currentStatus": "writing",
        "lastUpdatedAt": "2024-01-15T10:30:00Z",
        "adminNote": "작성 시작"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 2. 실물 편지 관리용 편지 목록 조회

```
GET /admin/letters/physical
```

**Query Parameters:** (위와 동일)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter_id",
      "title": "소중한 친구에게",
      "authorName": "김철수",
      "totalRequests": 3,
      "currentStatus": "writing",
      "lastUpdatedAt": "2024-01-15T10:30:00Z",
      "adminNote": "작성 시작",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 3. 편지별 실물 편지 상태 업데이트

```
PUT /admin/letters/{letterId}/physical-status
```

**Request Body:**

```json
{
  "status": "writing",
  "adminNote": "작성 시작"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "letter_id",
    "title": "소중한 친구에게",
    "authorName": "김철수",
    "totalRequests": 3,
    "currentStatus": "writing",
    "lastUpdatedAt": "2024-01-15T10:30:00Z",
    "adminNote": "작성 시작"
  }
}
```

### 4. 일괄 상태 변경

```
PUT /admin/letters/bulk-physical-status
```

**Request Body:**

```json
{
  "letterIds": ["letter_id1", "letter_id2", "letter_id3"],
  "status": "sent",
  "adminNote": "일괄 발송"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": []
  }
}
```

### 5. 실물 편지 통계 조회

```
GET /admin/physical-letters/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "none": 1000,
    "requested": 25,
    "writing": 15,
    "sent": 8,
    "delivered": 102,
    "totalRevenue": 1500000,
    "averageProcessingTime": 7.5
  }
}
```

### 6. 실물 편지 대시보드 데이터

```
GET /admin/physical-letters/dashboard
```

**Query Parameters:**

- `range?: string` - 기간 ("7d", "30d", "90d")

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 150,
      "none": 1000,
      "requested": 25,
      "writing": 15,
      "sent": 8,
      "delivered": 102
    },
    "recentUpdates": [
      {
        "_id": "letter_id",
        "title": "편지 제목",
        "authorName": "작성자",
        "totalRequests": 2,
        "currentStatus": "sent",
        "lastUpdatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pendingLetters": [
      {
        "_id": "letter_id",
        "title": "편지 제목",
        "authorName": "작성자",
        "totalRequests": 1,
        "currentStatus": "requested",
        "lastUpdatedAt": "2024-01-10T09:00:00Z"
      }
    ],
    "processingTimeStats": {
      "averageRequestToWriting": 2.5,
      "averageWritingToSent": 3.0,
      "averageSentToDelivered": 2.0
    }
  }
}
```

## 기존 API 개선사항

### 1. 사용자 통계 정보 조회

```
GET /admin/users/:userId/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalLetters": 25,
    "totalStories": 15,
    "totalViews": 1250,
    "totalLikes": 89,
    "joinedAt": "2024-01-15T09:30:00Z",
    "lastActiveAt": "2024-02-20T14:22:00Z"
  }
}
```

### 2. 사용자별 편지 목록 조회

```
GET /admin/users/:userId/letters
```

**Query Parameters:**

- `page?: number` - 페이지 번호 (기본값: 1)
- `limit?: number` - 페이지당 항목 수 (기본값: 10)
- `type?: string` - 편지 타입 필터 ("story" | "letter")
- `status?: string` - 상태 필터 ("created" | "published" | "hidden" | "deleted")

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "letter_id",
      "type": "story",
      "title": "편지 제목",
      "content": "편지 내용",
      "category": "가족",
      "status": "published",
      "viewCount": 45,
      "likeCount": 12,
      "createdAt": "2024-01-20T10:15:00Z",
      "updatedAt": "2024-01-20T10:15:00Z"
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

### 3. 대시보드 통계 API 개선

```
GET /admin/dashboard/stats
```

**Response에 physicalLetters 필드 추가:**

```json
{
  "success": true,
  "data": {
    "users": {
      /* 기존 사용자 통계 */
    },
    "letters": {
      /* 기존 편지 통계 */
    },
    "physicalLetters": {
      "total": 150,
      "none": 1000,
      "requested": 25,
      "writing": 15,
      "sent": 8,
      "delivered": 102,
      "totalRevenue": 1500000,
      "averageProcessingTime": 7.5
    },
    "categories": [
      /* 기존 카테고리 통계 */
    ],
    "recentUsers": [
      /* 기존 최근 사용자 */
    ],
    "recentLetters": [
      /* 기존 최근 편지 */
    ]
  }
}
```

## 데이터베이스 설계

### 실물 편지 상태 관리 방식

#### 옵션 1: Letter 모델에 직접 포함 (권장)

```javascript
// Letter 컬렉션
{
  _id: ObjectId,
  title: String,
  content: String,
  authorName: String,
  // ... 기존 필드들

  // 실물 편지 관련 필드
  physicalLetter: {
    totalRequests: Number,
    currentStatus: String, // "none" | "requested" | "writing" | "sent" | "delivered"
    lastUpdatedAt: Date,
    adminNote: String,
    // 상태 변경 이력
    statusHistory: [{
      status: String,
      changedAt: Date,
      changedBy: ObjectId, // Admin ID
      note: String
    }]
  }
}
```

#### 옵션 2: 별도 컬렉션으로 관리

```javascript
// PhysicalLetterStatus 컬렉션
{
  _id: ObjectId,
  letterId: ObjectId, // Letter 컬렉션 참조
  totalRequests: Number,
  currentStatus: String,
  lastUpdatedAt: Date,
  adminNote: String,
  statusHistory: [/* 상태 변경 이력 */],
  createdAt: Date,
  updatedAt: Date
}
```

## 구현 고려사항

### 1. 성능 최적화

- Letter 컬렉션에 `physicalLetter.currentStatus` 인덱스 추가
- 편지 목록 조회 시 실물 편지 상태 필터링 최적화
- 통계 계산을 위한 집계 파이프라인 최적화

### 2. 상태 전환 규칙

```
none → requested (사용자가 실물 편지 신청)
requested → writing (관리자가 작성 시작)
writing → sent (관리자가 발송 처리)
sent → delivered (배송 완료 처리)
```

### 3. 권한 관리

- 편지 읽기 권한: `LETTERS_READ`
- 실물 편지 상태 변경 권한: `LETTERS_WRITE`
- 일괄 상태 변경: 추가 권한 확인

### 4. 로깅 및 감사

- 상태 변경 시 이력 기록
- 관리자 작업 로그
- 일괄 변경 작업 추적

### 5. 알림 시스템

- 상태 변경 시 사용자 알림
- 오래된 신청 알림 (7일 이상 대기)
- 관리자 대시보드 알림

## 마이그레이션 가이드

### 기존 데이터 변환

1. 기존 `AuthorApprovalPhysicalRequest` 컬렉션 데이터 분석
2. 편지별로 실물 편지 신청 수 집계
3. 가장 최신 상태를 `currentStatus`로 설정
4. Letter 모델에 `physicalLetter` 필드 추가
5. 기존 컬렉션 데이터 정리

### 상태값 매핑

```
기존 → 새로운
requested → requested
confirmed → writing
processing → writing
writing → writing
sent → sent
delivered → delivered
failed → requested (재처리 필요)
cancelled → none
```

## 테스트 케이스

### 1. API 테스트

- 편지 목록 조회 (실물 편지 상태 포함)
- 상태 업데이트 (개별/일괄)
- 권한별 접근 제어
- 잘못된 상태 전환 방지

### 2. 성능 테스트

- 대량 편지 목록 조회 성능
- 실물 편지 상태 필터링 성능
- 일괄 상태 변경 성능

### 3. UI/UX 테스트

- 편지 목록에서 실물 편지 상태 표시
- 상태 변경 드롭다운 동작
- 일괄 선택 및 변경 기능

이 단순화된 시스템으로 사용자는 편지를 읽으면서 자연스럽게 실물 편지 상태를 확인할 수 있고, 관리자는 더 효율적으로 상태를 관리할 수 있습니다.
