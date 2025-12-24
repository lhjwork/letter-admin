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

## 🚨 긴급 수정 필요 사항

### 1. 사용자 편지 목록 API 데이터 구조 수정

**현재 문제**: `viewCount`, `likeCount` 필드가 undefined로 반환되어 프론트엔드에서 오류 발생

**수정 필요 사항**:

- 모든 Letter 객체에서 `viewCount`, `likeCount` 필드를 숫자로 보장
- undefined 또는 null인 경우 0으로 기본값 설정

```javascript
// 백엔드에서 반환 시 다음과 같이 처리
const letter = {
  ...letterData,
  viewCount: letterData.viewCount || 0,
  likeCount: letterData.likeCount || 0,
};
```

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

### 2. 사용자 편지 목록 (수정 필요)

```
GET /api/admin/users/:id/letters?page=1&limit=10&status=published
```

**⚠️ 중요**: 모든 편지 객체에서 `viewCount`, `likeCount` 필드를 숫자로 보장해야 함

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

## 🆕 다중 수신자 실물 편지 관리 시스템 API

### 1. 실물 편지 요청 목록

```
GET /api/admin/physical-requests?page=1&limit=20&status=requested&search=검색어&dateFrom=2024-01-01&dateTo=2024-12-31&region=서울
```

**목적**: 실물 편지 요청 목록을 필터링과 페이지네이션으로 조회

**쿼리 파라미터**:

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20, 최대: 100)
- `status` (optional): 상태 필터 ("requested", "confirmed", "processing", "writing", "sent", "delivered", "failed", "cancelled")
- `search` (optional): 검색어 (편지 제목, 받는 분 이름, 연락처)
- `dateFrom` (optional): 시작 날짜 (YYYY-MM-DD)
- `dateTo` (optional): 종료 날짜 (YYYY-MM-DD)
- `region` (optional): 지역 필터 (주소 기반)

**응답 구조**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "req123",
      "letterId": {
        "_id": "letter123",
        "title": "편지 제목",
        "content": "편지 내용..."
      },
      "title": "실물 편지 제목",
      "physicalStatus": "requested",
      "physicalRequestDate": "2024-12-20T00:00:00.000Z",
      "shippingAddress": {
        "name": "홍길동",
        "phone": "010-1234-5678",
        "zipCode": "12345",
        "address1": "서울시 강남구 테헤란로 123",
        "address2": "ABC빌딩 101호",
        "requestedAt": "2024-12-20T00:00:00.000Z"
      },
      "recipientInfo": {
        "name": "홍길동",
        "phone": "010-1234-5678",
        "zipCode": "12345",
        "address1": "서울시 강남구 테헤란로 123",
        "address2": "ABC빌딩 101호",
        "memo": "부재 시 경비실에 맡겨주세요"
      },
      "shippingInfo": {
        "trackingNumber": "1234567890",
        "shippingCompany": "우체국택배",
        "estimatedDelivery": "2024-12-25T00:00:00.000Z",
        "actualDelivery": null,
        "shippingCost": 3000
      },
      "totalCost": 8000,
      "letterCost": 5000,
      "shippingCost": 3000,
      "physicalNotes": "고급 편지지 사용 요청",
      "adminNotes": "VIP 고객, 우선 처리",
      "createdAt": "2024-12-20T00:00:00.000Z",
      "updatedAt": "2024-12-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 2. 실물 편지 통계

```
GET /api/admin/physical-requests/stats
```

**목적**: 실물 편지 요청 통계 정보 조회

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "total": 500,
    "requested": 25,
    "confirmed": 15,
    "processing": 30,
    "writing": 20,
    "sent": 45,
    "delivered": 350,
    "failed": 10,
    "cancelled": 5,
    "totalRevenue": 2500000,
    "averageProcessingTime": 3.5
  }
}
```

### 3. 대시보드 통계

```
GET /api/admin/dashboard/stats
```

**목적**: 실시간 대시보드용 통계 정보 (30초마다 자동 새로고침)

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "total": 500,
    "requested": 25,
    "confirmed": 15,
    "processing": 30,
    "writing": 20,
    "sent": 45,
    "delivered": 350,
    "failed": 10,
    "cancelled": 5,
    "totalRevenue": 2500000,
    "averageProcessingTime": 3.5,
    "pendingRequests": 40,
    "inProgressRequests": 95,
    "completedRequests": 350,
    "todayRequests": 12,
    "thisWeekRequests": 85,
    "thisMonthRequests": 320
  }
}
```

### 4. 실물 편지 상세 조회

```
GET /api/admin/physical-requests/:id
```

**목적**: 특정 실물 편지 요청의 상세 정보 조회

**응답 구조**: 위의 목록 API와 동일한 단일 객체

### 5. 실물 편지 상태 업데이트

```
PATCH /api/admin/physical-requests/:id
```

**목적**: 실물 편지 요청의 상태와 메모 업데이트

**요청 본문**:

```json
{
  "status": "processing",
  "notes": "고급 편지지로 작성 시작"
}
```

**응답 구조**: 업데이트된 실물 편지 객체

### 6. 배송 정보 업데이트

```
PATCH /api/admin/physical-requests/:id/shipping
```

**목적**: 배송 정보 업데이트 (송장번호, 택배사 등)

**요청 본문**:

```json
{
  "trackingNumber": "1234567890",
  "shippingCompany": "우체국택배",
  "estimatedDelivery": "2024-12-25T00:00:00.000Z",
  "adminNotes": "배송 시작됨"
}
```

### 7. 일괄 처리

```
POST /api/admin/physical-requests/bulk
```

**목적**: 여러 요청을 한 번에 처리

**요청 본문**:

```json
{
  "requestIds": ["req1", "req2", "req3"],
  "action": "confirm",
  "data": {
    "notes": "일괄 승인 처리"
  }
}
```

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": []
  }
}
```

### 8. 통계 및 분석

```
GET /api/admin/statistics?start=2024-01-01&end=2024-12-31
```

**목적**: 기간별 상세 통계 및 분석 데이터

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "statusDistribution": [
      { "status": "delivered", "count": 350, "percentage": 70 },
      { "status": "processing", "count": 50, "percentage": 10 }
    ],
    "dailyRequests": [
      { "date": "2024-12-01", "count": 15 },
      { "date": "2024-12-02", "count": 22 }
    ],
    "regionDistribution": [
      { "region": "서울", "count": 200 },
      { "region": "경기", "count": 150 }
    ],
    "revenue": {
      "total": 2500000,
      "thisMonth": 320000,
      "lastMonth": 280000,
      "growth": 14.3
    }
  }
}
```

### 9. 데이터 내보내기

```
GET /api/admin/physical-requests/export?status=delivered&dateFrom=2024-01-01&dateTo=2024-12-31
```

**목적**: 필터링된 데이터를 CSV 또는 Excel 형태로 내보내기

**응답**: 실물 편지 요청 배열 (CSV 변환은 프론트엔드에서 처리)

## 데이터 모델 정의

### PhysicalLetterRequest 스키마

```javascript
const physicalLetterRequestSchema = {
  _id: ObjectId,
  letterId: ObjectId, // Letter 컬렉션 참조
  title: String,
  physicalStatus: {
    type: String,
    enum: ["requested", "confirmed", "processing", "writing", "sent", "delivered", "failed", "cancelled"],
    default: "requested",
  },
  physicalRequestDate: Date,
  shippingAddress: {
    name: String,
    phone: String,
    zipCode: String,
    address1: String,
    address2: String,
    requestedAt: Date,
  },
  recipientInfo: {
    name: String,
    phone: String,
    zipCode: String,
    address1: String,
    address2: String,
    memo: String,
  },
  shippingInfo: {
    trackingNumber: String,
    shippingCompany: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippingCost: Number,
  },
  totalCost: Number,
  letterCost: Number,
  shippingCost: Number,
  physicalNotes: String,
  adminNotes: String,
  createdAt: Date,
  updatedAt: Date,
};
```

## 보안 및 권한 요구사항

### 1. 인증 검증

- 모든 엔드포인트는 JWT 토큰 검증 필요
- Authorization 헤더: `Bearer <token>`

### 2. 권한 검증

- `letters.read`: 실물 편지 조회 권한
- `letters.write`: 실물 편지 수정 권한
- `letters.delete`: 실물 편지 삭제 권한

### 3. 데이터 보안

- 개인정보 (이름, 연락처, 주소) 암호화 저장 권장
- 관리자 액션 로그 기록

## 성능 요구사항

### 1. 인덱스 생성

```javascript
// 필수 인덱스
db.physicalLetterRequests.createIndex({ physicalStatus: 1 });
db.physicalLetterRequests.createIndex({ physicalRequestDate: -1 });
db.physicalLetterRequests.createIndex({ "shippingAddress.name": "text", title: "text" });
db.physicalLetterRequests.createIndex({ createdAt: -1 });

// 복합 인덱스
db.physicalLetterRequests.createIndex({
  physicalStatus: 1,
  physicalRequestDate: -1,
});
```

### 2. 응답 시간 목표

- 목록 조회: 300ms 이내
- 통계 조회: 500ms 이내
- 상태 업데이트: 200ms 이내

## 오류 처리

### 주요 오류 코드

- `PHYSICAL_REQUEST_NOT_FOUND`: 실물 편지 요청을 찾을 수 없음 (404)
- `INVALID_STATUS_TRANSITION`: 잘못된 상태 전환 (400)
- `BULK_ACTION_FAILED`: 일괄 처리 실패 (400)

## 구현 우선순위

1. **최우선**: 사용자 편지 목록 API의 viewCount/likeCount 수정
2. **높음**: 실물 편지 목록 및 상세 조회 API
3. **높음**: 실물 편지 상태 업데이트 API
4. **중간**: 통계 및 대시보드 API
5. **중간**: 일괄 처리 및 배송 정보 업데이트 API
6. **낮음**: 데이터 내보내기 및 고급 분석 API

## 테스트 케이스

### 1. 실물 편지 목록 API

```bash
# 정상 케이스
GET /api/admin/physical-requests?page=1&limit=10&status=requested
Authorization: Bearer <valid_token>

# 필터링 테스트
GET /api/admin/physical-requests?search=홍길동&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer <valid_token>
```

### 2. 상태 업데이트 API

```bash
# 정상 케이스
PATCH /api/admin/physical-requests/req123
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "status": "processing",
  "notes": "작업 시작"
}
```

이 문서를 바탕으로 AI 백엔드 개발을 진행하시면, 다중 수신자 실물 편지 관리 시스템이 완전히 작동할 것입니다.

## 🆕 누적 실물 편지 관리 시스템 추가 API

### 12. 누적 대시보드 데이터

```
GET /api/admin/physical-letters/dashboard?range=7d
```

**목적**: 누적 실물 편지 관리 시스템의 대시보드 데이터 조회

**쿼리 파라미터**:

- `range` (optional): 기간 필터 ("7d", "30d", "90d") - 기본값: "7d"

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "totalRequests": 500,
    "pendingRequests": 40,
    "completedRequests": 350,
    "totalRevenue": 2500000,
    "popularLetters": [
      {
        "letterId": "letter123",
        "title": "사랑하는 가족에게",
        "requestCount": 45,
        "totalRevenue": 225000
      }
    ],
    "recentRequests": [
      {
        "id": "req123",
        "letterId": "letter123",
        "letterTitle": "사랑하는 가족에게",
        "recipientName": "홍길동",
        "status": "requested",
        "cost": 5000,
        "createdAt": "2024-12-20T00:00:00.000Z"
      }
    ]
  }
}
```

### 13. 분석 데이터

```
GET /api/admin/physical-letters/analytics
```

**목적**: 실물 편지 시스템의 상세 분석 데이터 조회

**응답 구조**:

```json
{
  "success": true,
  "data": {
    "dailyStats": [
      {
        "date": "2024-12-01",
        "requests": 15,
        "revenue": 75000
      }
    ],
    "regionStats": [
      {
        "region": "서울",
        "count": 200,
        "percentage": 40
      }
    ],
    "statusDistribution": [
      {
        "status": "delivered",
        "count": 350,
        "percentage": 70
      }
    ],
    "averageProcessingTime": 3.5,
    "topPerformingLetters": [
      {
        "letterId": "letter123",
        "title": "사랑하는 가족에게",
        "requestCount": 45,
        "conversionRate": 12.5
      }
    ]
  }
}
```

## 🔄 업데이트된 구현 우선순위

1. **최우선**: 사용자 편지 목록 API의 viewCount/likeCount 수정
2. **높음**: 실물 편지 목록 및 상세 조회 API
3. **높음**: 실물 편지 상태 업데이트 API
4. **높음**: 누적 대시보드 데이터 API (새로 추가)
5. **중간**: 통계 및 대시보드 API
6. **중간**: 분석 데이터 API (새로 추가)
7. **중간**: 일괄 처리 및 배송 정보 업데이트 API
8. **낮음**: 데이터 내보내기 및 고급 분석 API

## 📋 누적 시스템 특징

### 1. 편지별 누적 관리

- 동일한 편지에 대한 여러 실물 편지 신청을 효율적으로 관리
- 편지별 인기도 및 수익 추적
- 편지별 전환율 분석

### 2. 개별 신청 상태 추적

- 각 신청의 독립적인 상태 관리
- 상세한 배송 정보 및 추적
- 관리자 메모 및 히스토리 관리

### 3. 통계 및 분석

- 실시간 대시보드 모니터링
- 지역별, 상태별 분포 분석
- 수익 및 성장률 추적
- 처리 시간 최적화 분석

### 4. 관리자 권한 시스템

- 역할별 접근 권한 제어
- 액션 로그 및 감사 추적
- 일괄 처리 권한 관리

이 누적 실물 편지 관리 시스템을 통해 관리자는 편지별로 누적되는 신청을 효율적으로 관리하고, 상세한 분석을 통해 서비스를 최적화할 수 있습니다.
