import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPhysicalLetterRequests } from "../api/physicalLetters";
import { useUpdateLetterPhysicalStatus, useBulkUpdateLetterPhysicalStatus } from "../hooks/useLetters";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS, LetterQueryParams, PhysicalLetterStatus, GroupedPhysicalLetter } from "../types";
import { formatDate } from "../utils/format";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import Input from "../components/common/Input";
import Pagination from "../components/common/Pagination";
import LetterPhysicalStatus from "../components/letters/LetterPhysicalStatus";
import PhysicalLetterDetailsModal from "../components/physicalLetters/PhysicalLetterDetailsModal";
import "./LettersWithPhysical.scss";

export default function LettersWithPhysical() {
  const { hasPermission } = usePermission();
  const [params, setParams] = useState<LetterQueryParams>({
    page: 1,
    limit: 20,
    physicalStatus: "",
    search: "",
    sort: "updatedAt",
    order: "desc",
  });
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<PhysicalLetterStatus>("writing");
  const [bulkNote, setBulkNote] = useState("");
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    letterId: string;
    letterTitle: string;
  }>({
    isOpen: false,
    letterId: "",
    letterTitle: "",
  });

  // 실제 API 사용
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "physical-requests", params],
    queryFn: () =>
      getPhysicalLetterRequests({
        page: params.page,
        limit: params.limit,
        status: params.physicalStatus || undefined,
        search: params.search || undefined,
      }),
  });

  const updateStatusMutation = useUpdateLetterPhysicalStatus();
  const bulkUpdateMutation = useBulkUpdateLetterPhysicalStatus();

  const canRead = hasPermission(PERMISSIONS.LETTERS_READ);
  const canWrite = hasPermission(PERMISSIONS.LETTERS_WRITE);

  // 강제 새로고침 함수
  const forceRefresh = async () => {
    console.log("🔄 Force refreshing physical requests list...");
    await refetch();
  };

  if (!canRead) {
    return (
      <div className="letters-with-physical">
        <div className="letters-with-physical__error">편지 관리 권한이 없습니다</div>
      </div>
    );
  }

  if (isLoading) return <Loading />;
  if (error) return <div className="error">데이터를 불러오는데 실패했습니다</div>;

  const letters = data?.data || [];
  const pagination = data?.pagination;

  // 편지별로 그룹화 (같은 _id를 가진 편지들을 하나로 합침)
  const groupedLetters: GroupedPhysicalLetter[] = letters.reduce((acc, letter) => {
    const existingLetter = acc.find((item) => item._id === letter._id);

    if (existingLetter) {
      // 이미 존재하는 편지에 수신자 정보 추가
      existingLetter.recipients.push({
        recipientName: letter.recipientName,
        recipientPhone: letter.recipientPhone,
        shippingAddress: letter.shippingAddress,
        physicalNotes: letter.physicalNotes,
        requestId: letter.requestId,
        physicalRequestDate: letter.physicalRequestDate,
      });
    } else {
      // 새로운 편지 항목 생성
      acc.push({
        _id: letter._id,
        replyToId: letter.replyToId,
        title: letter.title,
        authorName: letter.authorName,
        physicalStatus: letter.physicalStatus,
        createdAt: letter.createdAt,
        updatedAt: letter.updatedAt,
        currentStatus: letter.physicalStatus,
        lastUpdatedAt: letter.physicalRequestDate,
        adminNote: letter.physicalNotes,
        recipients: [
          {
            recipientName: letter.recipientName,
            recipientPhone: letter.recipientPhone,
            shippingAddress: letter.shippingAddress,
            physicalNotes: letter.physicalNotes,
            requestId: letter.requestId,
            physicalRequestDate: letter.physicalRequestDate,
          },
        ],
      });
    }

    return acc;
  }, [] as GroupedPhysicalLetter[]);

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "none", label: "신청 없음" },
    { value: "requested", label: "신청됨" },
    { value: "writing", label: "작성중" },
    { value: "sent", label: "발송됨" },
    { value: "delivered", label: "배송완료" },
  ];

  const bulkStatusOptions = [
    { value: "writing", label: "작성중으로 변경" },
    { value: "sent", label: "발송됨으로 변경" },
    { value: "delivered", label: "배송완료로 변경" },
  ];

  const handleStatusUpdate = async (letterId: string, status: PhysicalLetterStatus, note?: string) => {
    if (!canWrite) return;

    try {
      console.log(`🔄 Updating status for letter ${letterId} to ${status}`);
      await updateStatusMutation.mutateAsync({
        letterId,
        status,
        adminNote: note,
      });

      // 성공 후 강제 새로고침
      setTimeout(() => {
        forceRefresh();
      }, 1000);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const handleBulkUpdate = async () => {
    if (!canWrite || selectedLetters.length === 0) return;

    try {
      await bulkUpdateMutation.mutateAsync({
        letterIds: selectedLetters,
        status: bulkStatus,
        adminNote: bulkNote.trim() || undefined,
      });
      setSelectedLetters([]);
      setBulkNote("");
    } catch (error) {
      console.error("Bulk update failed:", error);
    }
  };

  const handleSelectAll = () => {
    if (selectedLetters.length === groupedLetters.length) {
      setSelectedLetters([]);
    } else {
      setSelectedLetters(groupedLetters.map((letter) => letter._id));
    }
  };

  const handleSelectLetter = (letterId: string) => {
    setSelectedLetters((prev) => (prev.includes(letterId) ? prev.filter((id) => id !== letterId) : [...prev, letterId]));
  };

  const openDetailsModal = (letterId: string, letterTitle: string) => {
    console.log("Opening details modal for:", { letterId, letterTitle });
    setDetailsModal({
      isOpen: true,
      letterId,
      letterTitle,
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      letterId: "",
      letterTitle: "",
    });
  };

  return (
    <div className="letters-with-physical">
      <div className="letters-with-physical__header">
        <h1 className="letters-with-physical__title">편지별 실물 편지 관리</h1>

        <div className="letters-with-physical__filters">
          <Input type="text" placeholder="편지 제목, 작성자로 검색" value={params.search || ""} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />

          <Select value={params.physicalStatus || ""} onChange={(e) => setParams({ ...params, physicalStatus: e.target.value as PhysicalLetterStatus, page: 1 })} options={statusOptions} />

          <Button onClick={forceRefresh} loading={isLoading} size="sm">
            🔄 새로고침
          </Button>
        </div>
      </div>

      {canWrite && selectedLetters.length > 0 && (
        <div className="letters-with-physical__bulk-actions">
          <div className="letters-with-physical__bulk-info">{selectedLetters.length}개 편지 선택됨</div>

          <div className="letters-with-physical__bulk-controls">
            <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as PhysicalLetterStatus)} options={bulkStatusOptions} />

            <Input type="text" placeholder="일괄 변경 메모 (선택사항)" value={bulkNote} onChange={(e) => setBulkNote(e.target.value)} />

            <Button onClick={handleBulkUpdate} loading={bulkUpdateMutation.isPending}>
              일괄 변경
            </Button>
          </div>
        </div>
      )}

      <div className="letters-with-physical__table-container">
        <table className="letters-with-physical__table">
          <thead>
            <tr>
              {canWrite && (
                <th>
                  <input type="checkbox" checked={selectedLetters.length === groupedLetters.length && groupedLetters.length > 0} onChange={handleSelectAll} />
                </th>
              )}
              <th>편지 제목</th>
              <th>작성자</th>
              <th>수신자 정보</th>
              <th>현재 상태</th>
              <th>마지막 업데이트</th>
              {canWrite && <th>액션</th>}
            </tr>
          </thead>
          <tbody>
            {groupedLetters.length > 0 ? (
              groupedLetters.map((letter: GroupedPhysicalLetter) => (
                <tr key={letter._id}>
                  {canWrite && (
                    <td>
                      <input type="checkbox" checked={selectedLetters.includes(letter._id)} onChange={() => handleSelectLetter(letter._id)} />
                    </td>
                  )}
                  <td>
                    <div className="letters-with-physical__title-cell">
                      {letter.replyToId && <span className="reply-request-tag">사연 답장</span>}
                      {letter.title}
                    </div>
                  </td>
                  <td>{letter.authorName}</td>
                  <td>
                    <div className="letters-with-physical__recipient-info">
                      <div className="letters-with-physical__recipient-summary">
                        <span className="letters-with-physical__recipient-count">{letter.recipients.length}명 신청</span>
                        <Button size="sm" variant="secondary" onClick={() => openDetailsModal(letter._id, letter.title)}>
                          상세보기
                        </Button>
                      </div>
                      <div className="letters-with-physical__recipient-preview">
                        {letter.recipients.slice(0, 3).map((recipient) => (
                          <div key={recipient.requestId} className="letters-with-physical__recipient-item">
                            <span className="letters-with-physical__recipient-name">{recipient.recipientName}</span>
                            <span className="letters-with-physical__recipient-phone">{recipient.recipientPhone}</span>
                          </div>
                        ))}
                        {letter.recipients.length > 3 && <div className="letters-with-physical__recipient-more">외 {letter.recipients.length - 3}명...</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <LetterPhysicalStatus
                      physicalLetter={{
                        totalRequests: letter.recipients.length,
                        currentStatus: letter.currentStatus,
                        lastUpdatedAt: letter.lastUpdatedAt,
                        adminNote: letter.adminNote,
                      }}
                      compact
                    />
                  </td>
                  <td>{letter.lastUpdatedAt ? formatDate(letter.lastUpdatedAt) : "-"}</td>
                  {canWrite && (
                    <td>
                      <div className="letters-with-physical__actions">
                        <StatusUpdateDropdown currentStatus={letter.currentStatus} onUpdate={(status, note) => handleStatusUpdate(letter._id, status, note)} loading={updateStatusMutation.isPending} />
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canWrite ? 7 : 6} className="letters-with-physical__empty">
                  실물 편지 신청이 있는 편지가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}

      <PhysicalLetterDetailsModal isOpen={detailsModal.isOpen} onClose={closeDetailsModal} letterId={detailsModal.letterId} letterTitle={detailsModal.letterTitle} />
    </div>
  );
}

// 상태 변경 드롭다운 컴포넌트
interface StatusUpdateDropdownProps {
  currentStatus: PhysicalLetterStatus;
  onUpdate: (status: PhysicalLetterStatus, note?: string) => void;
  loading: boolean;
}

function StatusUpdateDropdown({ currentStatus, onUpdate, loading }: StatusUpdateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 위치 조정 - 더 자연스럽고 안정적인 방식
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const button = dropdown.parentElement?.querySelector("button");

      if (!button) return;

      // 기본 포지션 설정
      dropdown.style.position = "absolute";
      dropdown.style.zIndex = "9999";
      dropdown.style.top = "100%";
      dropdown.style.right = "0";
      dropdown.style.left = "auto";
      dropdown.style.bottom = "auto";
      dropdown.style.marginTop = "4px";
      dropdown.style.marginBottom = "0";

      // 다음 프레임에서 위치 조정
      requestAnimationFrame(() => {
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // 화면 하단을 벗어나는 경우 위쪽으로 표시
        if (dropdownRect.bottom > viewportHeight - 20) {
          dropdown.style.top = "auto";
          dropdown.style.bottom = "100%";
          dropdown.style.marginTop = "0";
          dropdown.style.marginBottom = "4px";
        }

        // 화면 우측을 벗어나는 경우 왼쪽 정렬
        if (dropdownRect.right > viewportWidth - 20) {
          dropdown.style.right = "auto";
          dropdown.style.left = "0";
        }

        // 화면 왼쪽을 벗어나는 경우 오른쪽 정렬로 복원
        if (dropdownRect.left < 20) {
          dropdown.style.left = "auto";
          dropdown.style.right = "0";
        }
      });
    }
  }, [isOpen]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const getNextStatuses = (current: PhysicalLetterStatus): PhysicalLetterStatus[] => {
    switch (current) {
      case "requested":
        return ["writing", "none"]; // 작성중으로 승인 또는 취소
      case "writing":
        return ["sent"]; // 발송완료로 변경
      case "sent":
        return ["delivered"]; // 배송완료로 변경
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses(currentStatus);

  if (nextStatuses.length === 0) {
    return <span className="letters-with-physical__no-action">-</span>;
  }

  const statusLabels = {
    writing: "작성중으로 변경",
    sent: "발송완료로 변경",
    delivered: "배송완료로 변경",
    none: "취소",
  };

  const handleUpdate = (status: PhysicalLetterStatus) => {
    onUpdate(status, note.trim() || undefined);
    setNote("");
    setIsOpen(false);
  };

  return (
    <div className="status-update-dropdown">
      <Button size="sm" onClick={() => setIsOpen(!isOpen)} loading={loading}>
        상태 변경
      </Button>

      {isOpen && (
        <div ref={dropdownRef} className="status-update-dropdown__menu">
          <div className="status-update-dropdown__note">
            <Input type="text" placeholder="관리자 메모 (선택사항)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="status-update-dropdown__actions">
            {nextStatuses.map((status) => (
              <Button key={status} size="sm" variant={status === "none" ? "secondary" : "primary"} onClick={() => handleUpdate(status)}>
                {statusLabels[status as keyof typeof statusLabels]}
              </Button>
            ))}

            <Button size="sm" variant="secondary" onClick={() => setIsOpen(false)}>
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
