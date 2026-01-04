// ===== 광고 관련 타입 =====
export type AdStatus = "draft" | "active" | "paused" | "expired";
export type AdTheme = "general" | "wedding" | "birthday" | "congratulation";
export type TrafficSource = "qr" | "direct" | "link" | "referral" | "social" | "email";
export type EventType = "impression" | "click" | "dwell";

export interface Advertiser {
  name: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// QR URL 생성 유틸리티
export function generateAdQRUrl(
  adSlug: string,
  baseUrl: string = "https://letter.community",
  options?: { letterId?: string; campaign?: string }
): string {
  const url = new URL(`/ad/${adSlug}`, baseUrl);
  url.searchParams.set("utm_source", "qr");
  url.searchParams.set("utm_medium", "offline");
  if (options?.letterId) url.searchParams.set("letter", options.letterId);
  if (options?.campaign) url.searchParams.set("utm_campaign", options.campaign);
  return url.toString();
}

export interface AdContent {
  headline: string;
  description: string;
  ctaText: string;
  targetUrl: string;
  backgroundImage?: string;
  backgroundColor?: string;
  theme: AdTheme;
}

export interface AdCampaign {
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;
  targetImpressions?: number;
  targetClicks?: number;
}

export interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  uniqueVisitors?: number;
  avgDwellTime?: number;
}

export interface DisplayControl {
  isVisible: boolean;
  placements: string[];
  priority: number;
  maxDailyImpressions?: number;
  maxTotalImpressions?: number;
  targetAudience?: {
    ageRange?: { min?: number; max?: number };
    gender?: "male" | "female" | "all";
    regions?: string[];
  };
  schedule?: {
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  };
}

export interface Ad {
  _id: string;
  name: string;
  slug: string;
  status: AdStatus;
  advertiser: Advertiser;
  content: AdContent;
  campaign: AdCampaign;
  stats: AdStats;
  displayControl?: DisplayControl;
  isCurrentlyDisplayable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdDetail extends Ad {
  linkedLetters?: {
    letterId: string;
    letterType?: string;
    addedAt: string;
  }[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface LinkedLetter {
  letterId: string;
  letterType?: string;
  addedAt: string;
}

export interface AdStatsResponse {
  ad: {
    _id: string;
    name: string;
    slug: string;
    status: string;
  };
  summary: {
    impressions: number;
    clicks: number;
    ctr: string;
    uniqueVisitors: number;
    avgDwellTime: number;
  };
  daily: { date: string; impressions: number; clicks: number }[];
  bySource: { _id: string; count: number }[];
  byDevice: { _id: string; count: number }[];
  period?: {
    start: string;
    end: string;
  };
}

export interface AdQueryParams {
  page?: number;
  limit?: number;
  status?: AdStatus | "";
  search?: string;
}

export interface CreateAdRequest {
  name: string;
  slug?: string;
  status?: AdStatus;
  advertiser: Advertiser;
  content: Omit<AdContent, "backgroundColor" | "backgroundImage"> & {
    backgroundColor?: string;
    backgroundImage?: string;
  };
  campaign: AdCampaign;
  displayControl?: DisplayControl;
}

export interface UpdateAdRequest {
  name?: string;
  status?: AdStatus;
  advertiser?: Partial<Advertiser>;
  content?: Partial<AdContent>;
  campaign?: Partial<AdCampaign>;
  displayControl?: Partial<DisplayControl>;
}
