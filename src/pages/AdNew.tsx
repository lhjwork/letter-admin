import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAd } from "../hooks/useAds";
import type { CreateAdRequest, AdTheme, AdStatus } from "../types/ads";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Textarea from "../components/common/Textarea";
import Select from "../components/common/Select";
import CarouselSettings from "../components/ads/CarouselSettings";
import "./AdNew.scss";

export default function AdNew() {
  const navigate = useNavigate();
  const createAd = useCreateAd();

  const [formData, setFormData] = useState<CreateAdRequest>({
    name: "",
    slug: "",
    advertiser: {
      name: "",
      logo: "",
      contactEmail: "",
      contactPhone: "",
    },
    content: {
      headline: "",
      description: "",
      ctaText: "자세히 보기",
      targetUrl: "",
      backgroundImage: "",
      backgroundColor: "#ffffff",
      theme: "general",
    },
    campaign: {
      name: "",
      startDate: "",
      endDate: "",
      budget: undefined,
      targetImpressions: undefined,
      targetClicks: undefined,
    },
    displayControl: {
      isVisible: true,
      placements: ["landing"],
      priority: 0,
      targetAudience: {
        gender: "all",
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 날짜를 올바른 ISO 형식으로 변환하고 상태를 active로 설정
      const processedData = {
        ...formData,
        status: "active" as AdStatus, // 새 광고는 바로 활성화
        campaign: {
          ...formData.campaign,
          startDate: new Date(formData.campaign.startDate).toISOString(),
          endDate: new Date(formData.campaign.endDate).toISOString(),
        },
      };
      
      const result = await createAd.mutateAsync(processedData);
      alert("광고가 생성되고 활성화되었습니다!");
      navigate(`/ads/${result.data._id}`);
    } catch (error) {
      console.error("Create ad error:", error);
      alert("광고 생성에 실패했습니다");
    }
  };

  return (
    <div className="ad-new">
      <h1 className="ad-new__title">➕ 새 광고 만들기</h1>

      <form onSubmit={handleSubmit} className="ad-new__form">
        <section className="ad-new__section">
          <h2 className="ad-new__section-title">기본 정보</h2>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>광고명 (내부용) *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 2024 봄 웨딩 프로모션"
                required
              />
            </div>
            <div className="ad-new__field">
              <label>상태</label>
              <Select
                value="active"
                onChange={() => {}} // 기본적으로 active로 고정
                options={[
                  { value: "active", label: "활성 (바로 노출)" },
                ]}
                disabled
              />
              <small className="ad-new__help">새 광고는 자동으로 활성 상태로 생성됩니다.</small>
            </div>
          </div>
          <div className="ad-new__field">
            <label>URL 슬러그</label>
            <Input
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="예: spring-wedding-2024 (미입력시 자동 생성)"
            />
          </div>
        </section>

        <section className="ad-new__section">
          <h2 className="ad-new__section-title">광고주 정보</h2>
          <div className="ad-new__field">
            <label>광고주명 *</label>
            <Input
              value={formData.advertiser.name}
              onChange={(e) => setFormData({
                ...formData,
                advertiser: { ...formData.advertiser, name: e.target.value },
              })}
              placeholder="예: 플라워카페"
              required
            />
          </div>
          <div className="ad-new__field">
            <label>로고 URL</label>
            <Input
              value={formData.advertiser.logo || ""}
              onChange={(e) => setFormData({
                ...formData,
                advertiser: { ...formData.advertiser, logo: e.target.value },
              })}
              placeholder="https://..."
            />
          </div>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>담당자 이메일</label>
              <Input
                type="email"
                value={formData.advertiser.contactEmail || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  advertiser: { ...formData.advertiser, contactEmail: e.target.value },
                })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="ad-new__field">
              <label>담당자 연락처</label>
              <Input
                type="tel"
                value={formData.advertiser.contactPhone || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  advertiser: { ...formData.advertiser, contactPhone: e.target.value },
                })}
                placeholder="02-1234-5678"
              />
            </div>
          </div>
        </section>

        <section className="ad-new__section">
          <h2 className="ad-new__section-title">광고 콘텐츠</h2>
          <div className="ad-new__field">
            <label>헤드라인 *</label>
            <Input
              value={formData.content.headline}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, headline: e.target.value },
              })}
              placeholder="예: 신혼부부 특별 할인 10%!"
              required
            />
          </div>
          <div className="ad-new__field">
            <label>설명 *</label>
            <Textarea
              value={formData.content.description}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, description: e.target.value },
              })}
              placeholder="광고 설명을 입력하세요"
              required
            />
          </div>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>CTA 버튼 텍스트</label>
              <Input
                value={formData.content.ctaText}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, ctaText: e.target.value },
                })}
                placeholder="예: 혜택 받으러 가기"
              />
            </div>
            <div className="ad-new__field">
              <label>테마</label>
              <Select
                value={formData.content.theme}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, theme: e.target.value as AdTheme },
                })}
                options={[
                  { value: "general", label: "일반" },
                  { value: "wedding", label: "웨딩" },
                  { value: "birthday", label: "생일" },
                  { value: "congratulation", label: "축하" },
                ]}
              />
            </div>
          </div>
          <div className="ad-new__field">
            <label>연결 URL *</label>
            <Input
              type="url"
              value={formData.content.targetUrl}
              onChange={(e) => setFormData({
                ...formData,
                content: { ...formData.content, targetUrl: e.target.value },
              })}
              placeholder="https://advertiser.com/promo"
              required
            />
          </div>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>배경 이미지 URL</label>
              <Input
                value={formData.content.backgroundImage || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, backgroundImage: e.target.value },
                })}
                placeholder="https://..."
              />
            </div>
            <div className="ad-new__field">
              <label>배경 색상</label>
              <Input
                type="color"
                value={formData.content.backgroundColor || "#ffffff"}
                onChange={(e) => setFormData({
                  ...formData,
                  content: { ...formData.content, backgroundColor: e.target.value },
                })}
              />
            </div>
          </div>
        </section>

        <section className="ad-new__section">
          <h2 className="ad-new__section-title">캠페인 설정</h2>
          <div className="ad-new__field">
            <label>캠페인명</label>
            <Input
              value={formData.campaign.name}
              onChange={(e) => setFormData({
                ...formData,
                campaign: { ...formData.campaign, name: e.target.value },
              })}
              placeholder="예: spring_wedding_2024"
            />
          </div>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>시작일 *</label>
              <Input
                type="datetime-local"
                value={formData.campaign.startDate}
                onChange={(e) => setFormData({
                  ...formData,
                  campaign: { ...formData.campaign, startDate: e.target.value },
                })}
                required
              />
            </div>
            <div className="ad-new__field">
              <label>종료일 *</label>
              <Input
                type="datetime-local"
                value={formData.campaign.endDate}
                onChange={(e) => setFormData({
                  ...formData,
                  campaign: { ...formData.campaign, endDate: e.target.value },
                })}
                required
              />
            </div>
          </div>
          <div className="ad-new__field-row">
            <div className="ad-new__field">
              <label>예산 (원)</label>
              <Input
                type="number"
                value={formData.campaign.budget || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  campaign: { ...formData.campaign, budget: e.target.value ? Number(e.target.value) : undefined },
                })}
                placeholder="1000000"
              />
            </div>
            <div className="ad-new__field">
              <label>목표 노출수</label>
              <Input
                type="number"
                value={formData.campaign.targetImpressions || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  campaign: { ...formData.campaign, targetImpressions: e.target.value ? Number(e.target.value) : undefined },
                })}
                placeholder="10000"
              />
            </div>
            <div className="ad-new__field">
              <label>목표 클릭수</label>
              <Input
                type="number"
                value={formData.campaign.targetClicks || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  campaign: { ...formData.campaign, targetClicks: e.target.value ? Number(e.target.value) : undefined },
                })}
                placeholder="500"
              />
            </div>
          </div>
        </section>

        <section className="ad-new__section">
          <h2 className="ad-new__section-title">캐러셀 설정</h2>
          <CarouselSettings
            content={formData.content}
            displayControl={formData.displayControl || {}}
            onContentChange={(content) => setFormData({ ...formData, content: { ...formData.content, ...content } })}
            onDisplayControlChange={(displayControl) => setFormData({ 
              ...formData, 
              displayControl: { 
                isVisible: true,
                placements: ["landing"],
                priority: 0,
                targetAudience: { gender: "all" },
                ...formData.displayControl, 
                ...displayControl 
              } 
            })}
          />
        </section>

        <section className="ad-new__section">
          <h2 className="ad-new__section-title">노출 설정</h2>
          <div className="ad-new__field">
            <label>
              <input
                type="checkbox"
                checked={formData.displayControl?.isVisible || false}
                onChange={(e) => setFormData({
                  ...formData,
                  displayControl: {
                    ...formData.displayControl,
                    isVisible: e.target.checked,
                    placements: formData.displayControl?.placements || ["landing"],
                    priority: formData.displayControl?.priority || 0,
                    targetAudience: formData.displayControl?.targetAudience || { gender: "all" },
                  },
                })}
              />
              광고 노출 활성화
            </label>
          </div>
          <div className="ad-new__field">
            <label>우선순위 (0-100)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.displayControl?.priority || 0}
              onChange={(e) => setFormData({
                ...formData,
                displayControl: {
                  ...formData.displayControl,
                  isVisible: formData.displayControl?.isVisible || true,
                  placements: formData.displayControl?.placements || ["landing"],
                  priority: parseInt(e.target.value) || 0,
                  targetAudience: formData.displayControl?.targetAudience || { gender: "all" },
                },
              })}
              placeholder="0"
            />
          </div>
          <div className="ad-new__field">
            <label>노출 위치</label>
            <div className="ad-new__checkboxes">
              {[
                { value: "landing", label: "랜딩 페이지" },
                { value: "banner", label: "배너" },
                { value: "sidebar", label: "사이드바" },
                { value: "footer", label: "푸터" },
                { value: "popup", label: "팝업" },
              ].map((placement) => (
                <label key={placement.value}>
                  <input
                    type="checkbox"
                    checked={formData.displayControl?.placements?.includes(placement.value) || false}
                    onChange={(e) => {
                      const currentPlacements = formData.displayControl?.placements || [];
                      const newPlacements = e.target.checked
                        ? [...currentPlacements, placement.value]
                        : currentPlacements.filter(p => p !== placement.value);
                      
                      setFormData({
                        ...formData,
                        displayControl: {
                          ...formData.displayControl,
                          isVisible: formData.displayControl?.isVisible || true,
                          placements: newPlacements,
                          priority: formData.displayControl?.priority || 0,
                          targetAudience: formData.displayControl?.targetAudience || { gender: "all" },
                        },
                      });
                    }}
                  />
                  {placement.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="ad-new__buttons">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit" disabled={createAd.isPending}>
            {createAd.isPending ? "생성 중..." : "광고 생성"}
          </Button>
        </div>
      </form>
    </div>
  );
}
