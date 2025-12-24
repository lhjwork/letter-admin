import { useState } from "react";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import PhysicalLetterDashboard from "../components/physicalLetters/PhysicalLetterDashboard";
import PhysicalLetterRequestList from "../components/physicalLetters/PhysicalLetterRequestList";
import PhysicalLetterAnalytics from "../components/physicalLetters/PhysicalLetterAnalytics";
import Button from "../components/common/Button";
import "./PhysicalLetters.scss";

type TabType = "dashboard" | "requests" | "analytics";

export default function PhysicalLetters() {
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const canRead = hasPermission(PERMISSIONS.LETTERS_READ);

  if (!canRead) {
    return (
      <div className="physical-letters">
        <div className="physical-letters__error">실물 편지 관리 권한이 없습니다</div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard" as TabType, label: "대시보드", icon: "📊" },
    { id: "requests" as TabType, label: "신청 관리", icon: "📋" },
    { id: "analytics" as TabType, label: "분석", icon: "📈" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <PhysicalLetterDashboard />;
      case "requests":
        return <PhysicalLetterRequestList />;
      case "analytics":
        return <PhysicalLetterAnalytics />;
      default:
        return <PhysicalLetterDashboard />;
    }
  };

  return (
    <div className="physical-letters">
      <div className="physical-letters__tabs">
        {tabs.map((tab) => (
          <Button key={tab.id} variant={activeTab === tab.id ? "primary" : "secondary"} onClick={() => setActiveTab(tab.id)} className="physical-letters__tab">
            <span className="physical-letters__tab-icon">{tab.icon}</span>
            <span className="physical-letters__tab-label">{tab.label}</span>
          </Button>
        ))}
      </div>

      <div className="physical-letters__content">{renderTabContent()}</div>
    </div>
  );
}
