import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { useAd, useUpdateAd, useDeleteAd, useUnlinkLetter } from "../hooks/useAds";
import { generateAdQRUrl } from "../types/ads";
import type { UpdateAdRequest, AdStatus, AdTheme, DisplayControl } from "../types/ads";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Textarea from "../components/common/Textarea";
import Select from "../components/common/Select";
import Loading from "../components/common/Loading";
import Modal from "../components/common/Modal";
import DisplayControlSection from "../components/ads/DisplayControlSection";
import DisplayPreview from "../components/ads/DisplayPreview";
import "./AdDetail.scss";

export default function AdDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useAd(id || "");
  const updateAd = useUpdateAd();
  const deleteAd = useDeleteAd();
  const unlinkLetter = useUnlinkLetter();

  const [formData, setFormData] = useState<UpdateAdRequest>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: "basic", label: "기본 정보", icon: "📝" },
    { id: "content", label: "콘텐츠", icon: "🎨" },
    { id: "campaign", label: "캠페인", icon: "📅" },
    { id: "display", label: "노출 제어", icon: "⚙️" },
  ];

  const APP_URL = import.meta.env.VITE_APP_URL || "https://letter.community";

  useEffect(() => {
    if (data?.data) {
      const ad = data.data;
      setFormData({
        name: ad.name,
        status: ad.status,
        advertiser: ad.advertiser,
        content: ad.content,
        campaign: ad.campaign,
        displayControl: ad.displayControl,
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateAd.mutateAsync({ id, data: formData });
      alert("광고가 수정되었습니다.");
    } catch (error) {
      console.error("Update ad error:", error);
      alert("광고 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteAd.mutateAsync(id);
      alert("광고가 삭제되었습니다.");
      navigate("/ads");
    } catch (error) {
      console.error("Delete ad error:", error);
      alert("광고 삭제에 실패했습니다.");
    }
  };

  const handleUnlinkLetter = async (letterId: string) => {
    if (!id) return;
    if (!confirm("편지 연결을 해제하시겠습니까?")) return;
    
    try {
      await unlinkLetter.mutateAsync({ adId: id, letterId });
      refetch();
      alert("편지 연결이 해제되었습니다.");
    } catch (error) {
      console.error("Unlink letter error:", error);
      alert("편지 연결 해제에 실패했습니다.");
    }
  };

  const handleDisplayControlUpdate = (displayControl: DisplayControl) => {
    setFormData({ ...formData, displayControl });
  };

  const copyQRUrl = () => {
    if (!data?.data?.slug) return;
    const qrUrl = generateAdQRUrl(data.data.slug, APP_URL);
    navigator.clipboard.writeText(qrUrl);
    alert("QR URL이 클립보드에 복사되었습니다.");
  };

  const handleQuickStatusChange = async (newStatus: AdStatus) => {
    if (!id) return;
    
    try {
      await updateAd.mutateAsync({ id, data: { status: newStatus } });
      setFormData({ ...formData, status: newStatus });
      alert(`광고 상태가 "${newStatus === 'active' ? '활성' : '비활성'}"으로 변경되었습니다.`);
    } catch (error) {
      console.error("Status update error:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (isLoading) return <Loading />;
  if (!data?.data) return <div className="ad-detail__empty">광고를 찾을 수 없습니다.</div>;

  const ad = data.data;
  const qrUrl = generateAdQRUrl(ad.slug, APP_URL);

  return (
    <div className="ad-detail">
      {/* 상단 헤더 */}
      <div className="ad-detail__header">
        <div className="ad-detail__header-left">
          <button 
            className="ad-detail__back-btn"
            onClick={() => navigate(-1)}
          >
            ← 뒤로
          </button>
          <div className="ad-detail__title-section">
            <h1 className="ad-detail__title">{ad.name}</h1>
            <div className="ad-detail__subtitle">
              <span className={`ad-detail__status ad-detail__status--${ad.status}`}>
                {ad.status === 'active' ? '활성' : ad.status === 'draft' ? '초안' : '비활성'}
              </span>
              <span className="ad-detail__id">ID: {ad._id}</span>
            </div>
          </div>
        </div>
        
        <div className="ad-detail__header-actions">
          {ad.status === 'draft' && (
            <Button 
              variant="primary" 
              onClick={() => handleQuickStatusChange('active')}
              size="sm"
            >
              🚀 활성화
            </Button>
          )}
          {ad.status === 'active' && (
            <Button 
              variant="secondary" 
              onClick={() => handleQuickStatusChange('paused')}
              size="sm"
            >
              ⏸️ 일시정지
            </Button>
          )}
          <Link to={`/ads/${id}/stats`}>
            <Button variant="secondary" size="sm">📊 통계</Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ 삭제
          </Button>
        </div>
      </div>

      {/* QR 코드 섹션 */}
      <div className="ad-detail__qr-section">
        <div className="ad-detail__qr-header">
          <h3>🔗 QR 코드 URL</h3>
          <Button variant="ghost" size="sm" onClick={copyQRUrl}>
            📋 복사
          </Button>
        </div>
        <div className="ad-detail__qr-url">
          <code>{qrUrl}</code>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="ad-detail__main">
        {/* 사이드바 (노출 상태) */}
        <div className="ad-detail__sidebar">
          <DisplayPreview ad={ad} />
        </div>

        {/* 메인 폼 영역 */}
        <div className="ad-detail__content">
          {/* 탭 네비게이션 */}
          <div className="ad-detail__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`ad-detail__tab ${activeTab === tab.id ? "ad-detail__tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ad-detail__tab-icon">{tab.icon}</span>
                <span className="ad-detail__tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="ad-detail__tab-content">
            {activeTab === "display" ? (
              <DisplayControlSection ad={ad} onUpdate={handleDisplayControlUpdate} />
            ) : (
              <form onSubmit={handleSubmit} className="ad-detail__form">
                {activeTab === "basic" && (
                  <div className="ad-detail__form-content">
                    <div className="ad-detail__section">
                      <h3 className="ad-detail__section-title">기본 정보</h3>
                      <div className="ad-detail__form-grid">
                        <div className="ad-detail__field">
                          <label>광고명 *</label>
                          <Input
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="광고명을 입력하세요"
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>상태</label>
                          <Select
                            value={formData.status || ""}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as AdStatus })}
                            options={[
                              { value: "draft", label: "초안" },
                              { value: "active", label: "활성" },
                              { value: "paused", label: "일시정지" },
                              { value: "expired", label: "만료" },
                            ]}
                          />
                        </div>
                        <div className="ad-detail__field ad-detail__field--full">
                          <label>슬러그</label>
                          <Input
                            value={ad.slug}
                            disabled
                            placeholder="자동 생성됨"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ad-detail__section">
                      <h3 className="ad-detail__section-title">광고주 정보</h3>
                      <div className="ad-detail__form-grid">
                        <div className="ad-detail__field">
                          <label>광고주명 *</label>
                          <Input
                            value={formData.advertiser?.name || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              advertiser: { ...formData.advertiser, name: e.target.value },
                            })}
                            placeholder="광고주명을 입력하세요"
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>로고 URL</label>
                          <Input
                            value={formData.advertiser?.logo || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              advertiser: { ...formData.advertiser, logo: e.target.value },
                            })}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>담당자 이메일</label>
                          <Input
                            type="email"
                            value={formData.advertiser?.contactEmail || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              advertiser: { ...formData.advertiser, contactEmail: e.target.value },
                            })}
                            placeholder="contact@example.com"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>담당자 전화번호</label>
                          <Input
                            type="tel"
                            value={formData.advertiser?.contactPhone || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              advertiser: { ...formData.advertiser, contactPhone: e.target.value },
                            })}
                            placeholder="02-1234-5678"
                          />
                        </div>
                      </div>
                    </div>

                    {ad.linkedLetters && ad.linkedLetters.length > 0 && (
                      <div className="ad-detail__section">
                        <h3 className="ad-detail__section-title">연결된 편지</h3>
                        <div className="ad-detail__linked-letters">
                          {ad.linkedLetters.map((letter) => (
                            <div key={letter.letterId} className="ad-detail__linked-letter">
                              <div className="ad-detail__linked-letter-info">
                                <span className="ad-detail__linked-letter-id">{letter.letterId}</span>
                                {letter.letterType && (
                                  <span className="ad-detail__linked-letter-type">{letter.letterType}</span>
                                )}
                                <span className="ad-detail__linked-letter-date">
                                  {format(new Date(letter.addedAt), "yyyy-MM-dd HH:mm")}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnlinkLetter(letter.letterId)}
                              >
                                연결 해제
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "content" && (
                  <div className="ad-detail__form-content">
                    <div className="ad-detail__section">
                      <h3 className="ad-detail__section-title">콘텐츠 정보</h3>
                      <div className="ad-detail__form-grid">
                        <div className="ad-detail__field ad-detail__field--full">
                          <label>제목 *</label>
                          <Input
                            value={formData.content?.headline || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, headline: e.target.value },
                            })}
                            placeholder="광고 제목을 입력하세요"
                            required
                          />
                        </div>
                        <div className="ad-detail__field ad-detail__field--full">
                          <label>설명 *</label>
                          <Textarea
                            value={formData.content?.description || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, description: e.target.value },
                            })}
                            placeholder="광고 설명을 입력하세요"
                            rows={4}
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>CTA 버튼 텍스트</label>
                          <Input
                            value={formData.content?.ctaText || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, ctaText: e.target.value },
                            })}
                            placeholder="자세히 보기"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>테마</label>
                          <Select
                            value={formData.content?.theme || ""}
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
                        <div className="ad-detail__field ad-detail__field--full">
                          <label>타겟 URL *</label>
                          <Input
                            type="url"
                            value={formData.content?.targetUrl || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, targetUrl: e.target.value },
                            })}
                            placeholder="https://example.com"
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>배경 이미지 URL</label>
                          <Input
                            value={formData.content?.backgroundImage || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, backgroundImage: e.target.value },
                            })}
                            placeholder="https://example.com/bg.jpg"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>배경 색상</label>
                          <input
                            type="color"
                            className="ad-detail__color-input"
                            value={formData.content?.backgroundColor || "#ffffff"}
                            onChange={(e) => setFormData({
                              ...formData,
                              content: { ...formData.content, backgroundColor: e.target.value },
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "campaign" && (
                  <div className="ad-detail__form-content">
                    <div className="ad-detail__section">
                      <h3 className="ad-detail__section-title">캠페인 설정</h3>
                      <div className="ad-detail__form-grid">
                        <div className="ad-detail__field ad-detail__field--full">
                          <label>캠페인명</label>
                          <Input
                            value={formData.campaign?.name || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, name: e.target.value },
                            })}
                            placeholder="캠페인명을 입력하세요"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>시작일 *</label>
                          <Input
                            type="datetime-local"
                            value={formData.campaign?.startDate || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, startDate: e.target.value },
                            })}
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>종료일 *</label>
                          <Input
                            type="datetime-local"
                            value={formData.campaign?.endDate || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, endDate: e.target.value },
                            })}
                            required
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>예산 (원)</label>
                          <Input
                            type="number"
                            value={formData.campaign?.budget || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, budget: parseInt(e.target.value) || 0 },
                            })}
                            placeholder="1000000"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>목표 노출수</label>
                          <Input
                            type="number"
                            value={formData.campaign?.targetImpressions || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, targetImpressions: parseInt(e.target.value) || 0 },
                            })}
                            placeholder="10000"
                          />
                        </div>
                        <div className="ad-detail__field">
                          <label>목표 클릭수</label>
                          <Input
                            type="number"
                            value={formData.campaign?.targetClicks || ""}
                            onChange={(e) => setFormData({
                              ...formData,
                              campaign: { ...formData.campaign, targetClicks: parseInt(e.target.value) || 0 },
                            })}
                            placeholder="500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 저장 버튼 */}
                <div className="ad-detail__form-actions">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => navigate(-1)}
                  >
                    취소
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    loading={isSaving}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="광고 삭제"
      >
        <div className="ad-detail__delete-modal">
          <p>정말 이 광고를 삭제하시겠습니까?</p>
          <p className="ad-detail__delete-warning">삭제된 광고는 복구할 수 없습니다.</p>
          <div className="ad-detail__modal-actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteAd.isPending}>
              {deleteAd.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}