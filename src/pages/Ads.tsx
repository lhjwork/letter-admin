import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAds, useUpdateAd } from "../hooks/useAds";
import type { AdQueryParams, AdStatus } from "../types/ads";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import Input from "../components/common/Input";
import Pagination from "../components/common/Pagination";
import Loading from "../components/common/Loading";
import DisplayStatusBadge from "../components/ads/DisplayStatusBadge";
import PriorityBadge from "../components/ads/PriorityBadge";
import "./Ads.scss";

const statusLabels: Record<AdStatus, string> = {
  draft: "초안",
  active: "활성",
  paused: "일시정지",
  expired: "만료",
};

export default function Ads() {
  const [params, setParams] = useState<AdQueryParams>({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });

  const { data, isLoading } = useAds(params);
  const updateAd = useUpdateAd();
  const ads = data?.data || [];

  const totalAds = ads.length;
  const activeAds = ads.filter((a) => a.status === "active").length;
  const totalImpressions = ads.reduce((sum, a) => sum + (a.stats?.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.stats?.clicks || 0), 0);

  const handleActivateAllDrafts = async () => {
    const draftAds = ads.filter(ad => ad.status === "draft");
    
    if (draftAds.length === 0) {
      alert("활성화할 초안 광고가 없습니다.");
      return;
    }

    if (!confirm(`${draftAds.length}개의 초안 광고를 모두 활성화하시겠습니까?`)) {
      return;
    }

    try {
      // Promise.all을 사용해서 병렬 처리
      await Promise.all(
        draftAds.map(ad => 
          updateAd.mutateAsync({ 
            id: ad._id, 
            data: { 
              status: "active",
              displayControl: {
                isVisible: true,
                placements: ["landing"],
                priority: 50,
                targetAudience: { gender: "all" }
              }
            } 
          })
        )
      );
      
      alert(`${draftAds.length}개 광고가 모두 활성화되었습니다!`);
    } catch (error) {
      console.error("Bulk activate error:", error);
      alert("일괄 활성화에 실패했습니다.");
    }
  };

  const handleQuickActivate = async (adId: string) => {
    try {
      await updateAd.mutateAsync({ 
        id: adId, 
        data: { 
          status: "active",
          displayControl: {
            isVisible: true,
            placements: ["landing"],
            priority: 50,
            targetAudience: { gender: "all" }
          }
        } 
      });
      
      alert("광고가 활성화되었습니다! 이제 노출됩니다.");
    } catch (error) {
      console.error("Quick activate error:", error);
      alert("활성화에 실패했습니다.");
    }
  };

  const handleStatusChange = async (adId: string, newStatus: AdStatus) => {
    try {
      await updateAd.mutateAsync({ 
        id: adId, 
        data: { status: newStatus } 
      });
      
      const statusText = statusLabels[newStatus];
      alert(`광고 상태가 "${statusText}"로 변경되었습니다.`);
    } catch (error) {
      console.error("Status update error:", error);
      alert("상태 변경에 실패했습니다.");
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="ads">
      <div className="ads__header">
        <h1 className="ads__title">📢 광고 관리</h1>
        <div className="ads__header-actions">
          {ads.some(ad => ad.status === "draft") && (
            <Button 
              variant="secondary" 
              onClick={handleActivateAllDrafts}
            >
              🚀 모든 초안 활성화
            </Button>
          )}
          <Link to="/ads/new">
            <Button>+ 새 광고 만들기</Button>
          </Link>
        </div>
      </div>

      <div className="ads__stats">
        <div className="ads__stat-card">
          <span className="ads__stat-label">전체 광고</span>
          <span className="ads__stat-value">{totalAds}</span>
        </div>
        <div className="ads__stat-card">
          <span className="ads__stat-label">활성 광고</span>
          <span className="ads__stat-value ads__stat-value--green">{activeAds}</span>
        </div>
        <div className="ads__stat-card">
          <span className="ads__stat-label">총 노출</span>
          <span className="ads__stat-value">{totalImpressions.toLocaleString()}</span>
        </div>
        <div className="ads__stat-card">
          <span className="ads__stat-label">총 클릭</span>
          <span className="ads__stat-value ads__stat-value--blue">{totalClicks.toLocaleString()}</span>
        </div>
      </div>

      <div className="ads__filter">
        <Input
          placeholder="광고명 검색..."
          value={params.search || ""}
          onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
        />
        <Select
          value={params.status || ""}
          onChange={(e) => setParams({ ...params, status: e.target.value as AdStatus | "", page: 1 })}
          options={[
            { value: "", label: "전체 상태" },
            { value: "draft", label: "초안" },
            { value: "active", label: "활성" },
            { value: "paused", label: "일시정지" },
            { value: "expired", label: "만료" },
          ]}
        />
      </div>

      <Table
        columns={[
          { key: "name", header: "광고명", render: (ad) => (
            <div>
              <div className="ads__name">{ad.name}</div>
              <div className="ads__headline">{ad.content?.headline}</div>
            </div>
          )},
          { key: "advertiser", header: "광고주", render: (ad) => ad.advertiser?.name },
          { key: "status", header: "상태", render: (ad) => (
            <Select
              value={ad.status}
              onChange={(e) => handleStatusChange(ad._id, e.target.value as AdStatus)}
              options={[
                { value: "draft", label: "초안" },
                { value: "active", label: "활성" },
                { value: "paused", label: "일시정지" },
                { value: "expired", label: "만료" },
              ]}
            />
          )},
          { key: "displayStatus", header: "노출 상태", render: (ad) => (
            <div className="ads__display-status">
              <DisplayStatusBadge ad={ad} />
              {ad.status === "draft" && (
                <div className="ads__status-hint">
                  💡 상태를 "활성"으로 변경하면 노출됩니다
                </div>
              )}
            </div>
          )},
          { key: "priority", header: "우선순위", render: (ad) => (
            <PriorityBadge priority={ad.displayControl?.priority || 0} />
          )},
          { key: "period", header: "기간", render: (ad) => (
            <span className="ads__period">
              {ad.campaign?.startDate && format(new Date(ad.campaign.startDate), "MM/dd", { locale: ko })}
              {" ~ "}
              {ad.campaign?.endDate && format(new Date(ad.campaign.endDate), "MM/dd", { locale: ko })}
            </span>
          )},
          { key: "impressions", header: "노출", render: (ad) => (ad.stats?.impressions || 0).toLocaleString() },
          { key: "clicks", header: "클릭", render: (ad) => (ad.stats?.clicks || 0).toLocaleString() },
          { key: "ctr", header: "CTR", render: (ad) => `${(ad.stats?.ctr || 0).toFixed(2)}%` },
          { key: "actions", header: "액션", render: (ad) => (
            <div className="ads__actions">
              {ad.status === "draft" && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleQuickActivate(ad._id)}
                >
                  🚀 활성화
                </Button>
              )}
              <Link to={`/ads/${ad._id}`}>
                <Button variant="secondary" size="sm">수정</Button>
              </Link>
              <Link to={`/ads/${ad._id}/stats`}>
                <Button variant="secondary" size="sm">통계</Button>
              </Link>
            </div>
          )},
        ]}
        data={ads}
        keyExtractor={(ad) => ad._id}
        loading={isLoading}
      />

      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setParams({ ...params, page: Number(page) })}
        />
      )}
    </div>
  );
}