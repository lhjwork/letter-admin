import { useState } from "react";
import type { AdContent, DisplayControl } from "../../types/ads";
import Input from "../common/Input";
import Select from "../common/Select";
import "./CarouselSettings.scss";

interface CarouselSettingsProps {
  content: Partial<AdContent>;
  displayControl: Partial<DisplayControl>;
  onContentChange: (content: Partial<AdContent>) => void;
  onDisplayControlChange: (displayControl: Partial<DisplayControl>) => void;
}

export default function CarouselSettings({ 
  content, 
  displayControl, 
  onContentChange, 
  onDisplayControlChange 
}: CarouselSettingsProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const carouselPlacementOptions = [
    { value: "home", label: "홈페이지", description: "메인 페이지 캐러셀" },
    { value: "stories", label: "스토리", description: "스토리 목록 페이지" },
    { value: "letters", label: "편지", description: "편지 상세 페이지" },
  ];

  const handleImageUrlChange = (type: "desktop" | "mobile", url: string) => {
    if (type === "desktop") {
      onContentChange({ ...content, carouselImage: url });
    } else {
      onContentChange({ ...content, carouselImageMobile: url });
    }
  };

  return (
    <div className="carousel-settings">
      {/* 캐러셀 활성화 */}
      <div className="carousel-settings__section">
        <h3 className="carousel-settings__section-title">🎠 캐러셀 설정</h3>
        <div className="carousel-settings__field">
          <label className="carousel-settings__checkbox">
            <input
              type="checkbox"
              checked={displayControl.carouselEnabled || false}
              onChange={(e) => onDisplayControlChange({ 
                ...displayControl, 
                carouselEnabled: e.target.checked 
              })}
            />
            <span>캐러셀 광고 활성화</span>
          </label>
          <p className="carousel-settings__help">
            이미지 중심의 캐러셀 형태로 광고를 표시합니다
          </p>
        </div>
      </div>

      {displayControl.carouselEnabled && (
        <>
          {/* 캐러셀 이미지 설정 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">📸 캐러셀 이미지</h3>
            
            {/* 미리보기 모드 선택 */}
            <div className="carousel-settings__preview-toggle">
              <button
                type="button"
                className={`carousel-settings__preview-btn ${previewMode === "desktop" ? "active" : ""}`}
                onClick={() => setPreviewMode("desktop")}
              >
                🖥️ 데스크톱 (1920x1080)
              </button>
              <button
                type="button"
                className={`carousel-settings__preview-btn ${previewMode === "mobile" ? "active" : ""}`}
                onClick={() => setPreviewMode("mobile")}
              >
                📱 모바일 (1080x1080)
              </button>
            </div>

            {/* 데스크톱 이미지 */}
            {previewMode === "desktop" && (
              <div className="carousel-settings__image-upload">
                <label>데스크톱 이미지 URL (1920x1080 권장)</label>
                <Input
                  value={content.carouselImage || ""}
                  onChange={(e) => handleImageUrlChange("desktop", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-example?w=1920&h=1080"
                />
                {content.carouselImage && (
                  <div className="carousel-settings__image-preview">
                    <img 
                      src={content.carouselImage} 
                      alt="캐러셀 데스크톱 이미지"
                      className="carousel-settings__preview-image"
                    />
                  </div>
                )}
                <p className="carousel-settings__help">
                  권장: 1920x1080 (16:9 비율), 최대 5MB
                </p>
              </div>
            )}

            {/* 모바일 이미지 */}
            {previewMode === "mobile" && (
              <div className="carousel-settings__image-upload">
                <label>모바일 이미지 URL (1080x1080 권장)</label>
                <Input
                  value={content.carouselImageMobile || ""}
                  onChange={(e) => handleImageUrlChange("mobile", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-example?w=1080&h=1080"
                />
                {content.carouselImageMobile && (
                  <div className="carousel-settings__image-preview carousel-settings__image-preview--mobile">
                    <img 
                      src={content.carouselImageMobile} 
                      alt="캐러셀 모바일 이미지"
                      className="carousel-settings__preview-image"
                    />
                  </div>
                )}
                <p className="carousel-settings__help">
                  권장: 1080x1080 (1:1 비율), 최대 5MB
                </p>
              </div>
            )}
          </div>

          {/* 캐러셀 동작 설정 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">⚙️ 캐러셀 동작</h3>
            <div className="carousel-settings__field-row">
              <div className="carousel-settings__field">
                <label>우선순위 (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={content.carouselPriority || 0}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    carouselPriority: parseInt(e.target.value) || 0 
                  })}
                />
                <p className="carousel-settings__help">
                  높을수록 먼저 표시됩니다 (90-100: 최우선, 70-89: 높음)
                </p>
              </div>
              <div className="carousel-settings__field">
                <label>노출 시간 (초)</label>
                <Input
                  type="number"
                  min="3"
                  max="10"
                  value={(content.carouselDuration || 5000) / 1000}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    carouselDuration: (parseInt(e.target.value) || 5) * 1000 
                  })}
                />
                <p className="carousel-settings__help">
                  각 슬라이드가 표시되는 시간 (3-10초)
                </p>
              </div>
            </div>
            
            <div className="carousel-settings__field">
              <label className="carousel-settings__checkbox">
                <input
                  type="checkbox"
                  checked={content.carouselAutoPlay || false}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    carouselAutoPlay: e.target.checked 
                  })}
                />
                <span>자동 재생 허용</span>
              </label>
              <p className="carousel-settings__help">
                사용자가 자동 재생을 제어할 수 있습니다
              </p>
            </div>
          </div>

          {/* 시각적 설정 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">🎨 시각적 설정</h3>
            <div className="carousel-settings__field-row">
              <div className="carousel-settings__field">
                <label>오버레이 투명도 ({Math.round((content.overlayOpacity || 0.4) * 100)}%)</label>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={content.overlayOpacity || 0.4}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    overlayOpacity: parseFloat(e.target.value) 
                  })}
                />
              </div>
              <div className="carousel-settings__field">
                <label>텍스트 색상</label>
                <input
                  type="color"
                  className="carousel-settings__color-input"
                  value={content.textColor || "#ffffff"}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    textColor: e.target.value 
                  })}
                />
              </div>
            </div>
            
            <div className="carousel-settings__field">
              <label className="carousel-settings__checkbox">
                <input
                  type="checkbox"
                  checked={content.textShadow || false}
                  onChange={(e) => onContentChange({ 
                    ...content, 
                    textShadow: e.target.checked 
                  })}
                />
                <span>텍스트 그림자 사용</span>
              </label>
            </div>
          </div>

          {/* 반응형 텍스트 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">📱 반응형 텍스트</h3>
            <div className="carousel-settings__field">
              <label>모바일용 헤드라인 (선택사항)</label>
              <Input
                value={content.mobileHeadline || ""}
                onChange={(e) => onContentChange({ 
                  ...content, 
                  mobileHeadline: e.target.value 
                })}
                placeholder="모바일에서 표시할 짧은 헤드라인"
              />
              <p className="carousel-settings__help">
                비워두면 기본 헤드라인을 사용합니다
              </p>
            </div>
            <div className="carousel-settings__field">
              <label>모바일용 설명 (선택사항)</label>
              <Input
                value={content.mobileDescription || ""}
                onChange={(e) => onContentChange({ 
                  ...content, 
                  mobileDescription: e.target.value 
                })}
                placeholder="모바일에서 표시할 짧은 설명"
              />
            </div>
          </div>

          {/* 캐러셀 노출 위치 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">📍 캐러셀 노출 위치</h3>
            <div className="carousel-settings__placements">
              {carouselPlacementOptions.map((option) => (
                <div key={option.value} className="carousel-settings__placement">
                  <label className="carousel-settings__checkbox">
                    <input
                      type="checkbox"
                      checked={displayControl.carouselPlacements?.includes(option.value as any) || false}
                      onChange={(e) => {
                        const currentPlacements = displayControl.carouselPlacements || [];
                        if (e.target.checked) {
                          onDisplayControlChange({
                            ...displayControl,
                            carouselPlacements: [...currentPlacements, option.value as any],
                          });
                        } else {
                          onDisplayControlChange({
                            ...displayControl,
                            carouselPlacements: currentPlacements.filter((p) => p !== option.value),
                          });
                        }
                      }}
                    />
                    <div>
                      <span className="carousel-settings__placement-label">{option.label}</span>
                      <p className="carousel-settings__placement-desc">{option.description}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 캐러셀 스케줄 */}
          <div className="carousel-settings__section">
            <h3 className="carousel-settings__section-title">⏰ 캐러셀 스케줄</h3>
            <div className="carousel-settings__field-row">
              <div className="carousel-settings__field">
                <label>시작 시간</label>
                <Select
                  value={displayControl.carouselSchedule?.startHour?.toString() || "0"}
                  onChange={(e) => onDisplayControlChange({
                    ...displayControl,
                    carouselSchedule: {
                      ...displayControl.carouselSchedule,
                      startHour: parseInt(e.target.value),
                    },
                  })}
                  options={Array.from({ length: 24 }, (_, i) => ({
                    value: i.toString(),
                    label: `${i.toString().padStart(2, '0')}:00`,
                  }))}
                />
              </div>
              <div className="carousel-settings__field">
                <label>종료 시간</label>
                <Select
                  value={displayControl.carouselSchedule?.endHour?.toString() || "23"}
                  onChange={(e) => onDisplayControlChange({
                    ...displayControl,
                    carouselSchedule: {
                      ...displayControl.carouselSchedule,
                      endHour: parseInt(e.target.value),
                    },
                  })}
                  options={Array.from({ length: 24 }, (_, i) => ({
                    value: i.toString(),
                    label: `${i.toString().padStart(2, '0')}:00`,
                  }))}
                />
              </div>
            </div>
            <div className="carousel-settings__field">
              <label>타임존</label>
              <Select
                value={displayControl.carouselSchedule?.timezone || "Asia/Seoul"}
                onChange={(e) => onDisplayControlChange({
                  ...displayControl,
                  carouselSchedule: {
                    ...displayControl.carouselSchedule,
                    timezone: e.target.value,
                  },
                })}
                options={[
                  { value: "Asia/Seoul", label: "한국 표준시 (KST)" },
                  { value: "UTC", label: "협정 세계시 (UTC)" },
                  { value: "America/New_York", label: "미국 동부시간 (EST)" },
                  { value: "Europe/London", label: "영국 표준시 (GMT)" },
                ]}
              />
            </div>
          </div>

          {/* 캐러셀 미리보기 */}
          {(content.carouselImage || content.carouselImageMobile) && (
            <div className="carousel-settings__section">
              <h3 className="carousel-settings__section-title">👀 캐러셀 미리보기</h3>
              <div className="carousel-settings__preview">
                <div className="carousel-settings__preview-container">
                  <img 
                    src={previewMode === "mobile" ? content.carouselImageMobile : content.carouselImage} 
                    alt="캐러셀 미리보기"
                    className="carousel-settings__preview-image"
                  />
                  <div 
                    className="carousel-settings__preview-overlay"
                    style={{ opacity: content.overlayOpacity || 0.4 }}
                  />
                  <div className="carousel-settings__preview-content">
                    <h4 
                      style={{ 
                        color: content.textColor || "#ffffff",
                        textShadow: content.textShadow ? "0 2px 4px rgba(0,0,0,0.5)" : "none"
                      }}
                    >
                      {previewMode === "mobile" && content.mobileHeadline 
                        ? content.mobileHeadline 
                        : content.headline || "헤드라인을 입력하세요"
                      }
                    </h4>
                    <p 
                      style={{ 
                        color: content.textColor || "#ffffff",
                        textShadow: content.textShadow ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
                      }}
                    >
                      {previewMode === "mobile" && content.mobileDescription 
                        ? content.mobileDescription 
                        : content.description || "설명을 입력하세요"
                      }
                    </p>
                    <button className="carousel-settings__preview-cta">
                      {content.ctaText || "자세히 보기"}
                    </button>
                  </div>
                </div>
                <p className="carousel-settings__preview-info">
                  미리보기 - {previewMode === "desktop" ? "데스크톱" : "모바일"} 버전
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}