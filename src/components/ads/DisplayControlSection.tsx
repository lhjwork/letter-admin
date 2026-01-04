import { useState } from "react";
import { useUpdateDisplayControl } from "../../hooks/useAds";
import type { DisplayControl } from "../../types/ads";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import "./DisplayControlSection.scss";

interface DisplayControlSectionProps {
  ad: any;
  onUpdate: (data: DisplayControl) => void;
}

export default function DisplayControlSection({ ad, onUpdate }: DisplayControlSectionProps) {
  const updateDisplayControl = useUpdateDisplayControl();
  
  const [formData, setFormData] = useState<DisplayControl>(
    ad.displayControl || {
      isVisible: true,
      placements: [],
      priority: 0,
      targetAudience: { gender: "all" },
    }
  );

  const placementOptions = [
    { value: "landing", label: "랜딩 페이지", description: "광고 전용 페이지" },
    { value: "banner", label: "배너", description: "페이지 상단 배너" },
    { value: "sidebar", label: "사이드바", description: "페이지 사이드바" },
    { value: "footer", label: "푸터", description: "페이지 하단" },
    { value: "popup", label: "팝업", description: "모달 팝업" },
  ];

  const dayOptions = [
    { value: 0, label: "일" },
    { value: 1, label: "월" },
    { value: 2, label: "화" },
    { value: 3, label: "수" },
    { value: 4, label: "목" },
    { value: 5, label: "금" },
    { value: 6, label: "토" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDisplayControl.mutateAsync({ adId: ad._id, displayControl: formData });
      onUpdate(formData);
      alert("노출 설정이 업데이트되었습니다.");
    } catch (error) {
      console.error("Display control update error:", error);
      alert("노출 설정 업데이트에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="display-control">
      {/* 기본 노출 설정 */}
      <div className="display-control__section">
        <h3 className="display-control__section-title">기본 노출 설정</h3>
        <div className="display-control__fields">
          <div className="display-control__field">
            <label className="display-control__checkbox">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              />
              <span>광고 노출 활성화</span>
            </label>
          </div>
          <div className="display-control__field">
            <label>우선순위 (0-100)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
            />
            <p className="display-control__help">
              높을수록 우선 노출됩니다. (90-100: 최우선, 70-89: 높음, 50-69: 보통)
            </p>
          </div>
        </div>
      </div>

      {/* 노출 위치 설정 */}
      <div className="display-control__section">
        <h3 className="display-control__section-title">노출 위치</h3>
        <div className="display-control__placements">
          {placementOptions.map((option) => (
            <div key={option.value} className="display-control__placement">
              <label className="display-control__checkbox">
                <input
                  type="checkbox"
                  checked={formData.placements.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        placements: [...formData.placements, option.value],
                      });
                    } else {
                      setFormData({
                        ...formData,
                        placements: formData.placements.filter((p) => p !== option.value),
                      });
                    }
                  }}
                />
                <div>
                  <span className="display-control__placement-label">{option.label}</span>
                  <p className="display-control__placement-desc">{option.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 노출 한도 설정 */}
      <div className="display-control__section">
        <h3 className="display-control__section-title">노출 한도</h3>
        <div className="display-control__field-row">
          <div className="display-control__field">
            <label>일일 최대 노출 수</label>
            <Input
              type="number"
              min="0"
              value={formData.maxDailyImpressions || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxDailyImpressions: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="제한 없음"
            />
          </div>
          <div className="display-control__field">
            <label>총 최대 노출 수</label>
            <Input
              type="number"
              min="0"
              value={formData.maxTotalImpressions || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxTotalImpressions: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="제한 없음"
            />
          </div>
        </div>
      </div>

      {/* 타겟 오디언스 설정 */}
      <div className="display-control__section">
        <h3 className="display-control__section-title">타겟 오디언스</h3>
        <div className="display-control__fields">
          <div className="display-control__field">
            <label>연령대</label>
            <div className="display-control__age-range">
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.targetAudience?.ageRange?.min || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: {
                      ...formData.targetAudience,
                      ageRange: {
                        ...formData.targetAudience?.ageRange,
                        min: e.target.value ? parseInt(e.target.value) : 0,
                      },
                    },
                  })
                }
                placeholder="최소"
              />
              <span>~</span>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.targetAudience?.ageRange?.max || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAudience: {
                      ...formData.targetAudience,
                      ageRange: {
                        ...formData.targetAudience?.ageRange,
                        max: e.target.value ? parseInt(e.target.value) : 100,
                      },
                    },
                  })
                }
                placeholder="최대"
              />
              <span>세</span>
            </div>
          </div>
          <div className="display-control__field">
            <label>성별</label>
            <Select
              value={formData.targetAudience?.gender || "all"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetAudience: {
                    ...formData.targetAudience,
                    gender: e.target.value as "male" | "female" | "all",
                  },
                })
              }
              options={[
                { value: "all", label: "전체" },
                { value: "male", label: "남성" },
                { value: "female", label: "여성" },
              ]}
            />
          </div>
          <div className="display-control__field">
            <label>타겟 지역</label>
            <Input
              value={formData.targetAudience?.regions?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  targetAudience: {
                    ...formData.targetAudience,
                    regions: e.target.value
                      .split(",")
                      .map((r) => r.trim())
                      .filter((r) => r),
                  },
                })
              }
              placeholder="서울, 경기, 인천 (쉼표로 구분)"
            />
          </div>
        </div>
      </div>

      {/* 시간 스케줄 설정 */}
      <div className="display-control__section">
        <h3 className="display-control__section-title">시간 스케줄</h3>
        <div className="display-control__fields">
          <div className="display-control__field">
            <label>노출 시간대</label>
            <div className="display-control__time-range">
              <Input
                type="time"
                value={formData.schedule?.startTime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, startTime: e.target.value },
                  })
                }
              />
              <span>~</span>
              <Input
                type="time"
                value={formData.schedule?.endTime || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule, endTime: e.target.value },
                  })
                }
              />
            </div>
            <p className="display-control__help">비워두면 24시간 노출됩니다.</p>
          </div>
          <div className="display-control__field">
            <label>노출 요일</label>
            <div className="display-control__days">
              {dayOptions.map((day) => (
                <label key={day.value} className="display-control__day">
                  <input
                    type="checkbox"
                    checked={formData.schedule?.daysOfWeek?.includes(day.value) || false}
                    onChange={(e) => {
                      const currentDays = formData.schedule?.daysOfWeek || [];
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            daysOfWeek: [...currentDays, day.value],
                          },
                        });
                      } else {
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            daysOfWeek: currentDays.filter((d) => d !== day.value),
                          },
                        });
                      }
                    }}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
            <p className="display-control__help">선택하지 않으면 매일 노출됩니다.</p>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="display-control__actions">
        <Button type="submit" disabled={updateDisplayControl.isPending}>
          {updateDisplayControl.isPending ? "저장 중..." : "노출 설정 저장"}
        </Button>
      </div>
    </form>
  );
}