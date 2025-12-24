import { useState } from "react";
import { PhysicalLetterQueryParams } from "../../types";
import Input from "../common/Input";
import Select from "../common/Select";
import Button from "../common/Button";
import { useExportPhysicalLetters } from "../../hooks/usePhysicalLetters";
import "./PhysicalLetterFilter.scss";

interface PhysicalLetterFilterProps {
  params: PhysicalLetterQueryParams;
  onChange: (params: PhysicalLetterQueryParams) => void;
}

export default function PhysicalLetterFilter({ params, onChange }: PhysicalLetterFilterProps) {
  const [localSearch, setLocalSearch] = useState(params.search || "");
  const exportMutation = useExportPhysicalLetters();

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "requested", label: "신청됨" },
    { value: "processing", label: "처리중" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
    { value: "cancelled", label: "취소됨" },
  ];

  const sortOptions = [
    { value: "physicalRequestDate", label: "신청일" },
    { value: "title", label: "편지 제목" },
    { value: "shippingAddress.name", label: "받는 분" },
    { value: "physicalStatus", label: "상태" },
  ];

  const orderOptions = [
    { value: "desc", label: "내림차순" },
    { value: "asc", label: "오름차순" },
  ];

  const handleSearch = () => {
    onChange({ ...params, search: localSearch, page: 1 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync(params);
      if (result.data) {
        exportToCSV(result.data);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const exportToCSV = (data: any[]) => {
    const headers = ["편지 제목", "받는 분", "연락처", "우편번호", "주소", "상세주소", "상태", "신청일", "관리자 메모"];

    const rows = data.map((letter) => [
      letter.title,
      letter.shippingAddress.name,
      letter.shippingAddress.phone,
      letter.shippingAddress.zipCode,
      letter.shippingAddress.address1,
      letter.shippingAddress.address2 || "",
      getStatusLabel(letter.physicalStatus),
      new Date(letter.physicalRequestDate).toLocaleDateString("ko-KR"),
      letter.physicalNotes || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `실물편지신청목록_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      requested: "신청됨",
      processing: "처리중",
      writing: "작성중",
      sent: "발송됨",
      delivered: "배송완료",
      cancelled: "취소됨",
    };
    return labels[status] || status;
  };

  return (
    <div className="physical-letter-filter">
      <div className="physical-letter-filter__row">
        <div className="physical-letter-filter__search">
          <Input type="text" placeholder="편지 제목, 받는 분 이름으로 검색" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} onKeyPress={handleKeyPress} />
          <Button onClick={handleSearch}>검색</Button>
        </div>

        <div className="physical-letter-filter__controls">
          <Select value={params.status || ""} onChange={(e) => onChange({ ...params, status: e.target.value as any, page: 1 })} options={statusOptions} />

          <Select value={params.sort || "physicalRequestDate"} onChange={(e) => onChange({ ...params, sort: e.target.value, page: 1 })} options={sortOptions} />

          <Select value={params.order || "desc"} onChange={(e) => onChange({ ...params, order: e.target.value as "asc" | "desc", page: 1 })} options={orderOptions} />

          <Button variant="secondary" onClick={handleExport} loading={exportMutation.isPending}>
            📊 Excel 내보내기
          </Button>
        </div>
      </div>
    </div>
  );
}
