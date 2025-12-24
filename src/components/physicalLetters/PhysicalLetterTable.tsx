import { PhysicalLetterRequest } from "../../types";
import { formatDate } from "../../utils/format";
import Button from "../common/Button";
import Loading from "../common/Loading";
import "./PhysicalLetterTable.scss";

interface PhysicalLetterTableProps {
  letters: PhysicalLetterRequest[];
  loading: boolean;
  onStatusUpdate?: (letter: PhysicalLetterRequest) => void;
  onViewDetail: (letter: PhysicalLetterRequest) => void;
}

export default function PhysicalLetterTable({ letters, loading, onStatusUpdate, onViewDetail }: PhysicalLetterTableProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      requested: { label: "신청됨", className: "requested" },
      processing: { label: "처리중", className: "processing" },
      writing: { label: "작성중", className: "writing" },
      sent: { label: "발송됨", className: "sent" },
      delivered: { label: "배송완료", className: "delivered" },
      cancelled: { label: "취소됨", className: "cancelled" },
    };
    return statusMap[status as keyof typeof statusMap] || { label: "알 수 없음", className: "unknown" };
  };

  if (loading) return <Loading />;

  return (
    <div className="physical-letter-table">
      <div className="physical-letter-table__container">
        <table className="physical-letter-table__table">
          <thead>
            <tr>
              <th>편지 제목</th>
              <th>받는 분</th>
              <th>연락처</th>
              <th>주소</th>
              <th>상태</th>
              <th>신청일</th>
              <th>관리자 메모</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {letters.length > 0 ? (
              letters.map((letter) => {
                const statusBadge = getStatusBadge(letter.physicalStatus);
                return (
                  <tr key={letter._id}>
                    <td>
                      <button className="physical-letter-table__title-link" onClick={() => onViewDetail(letter)}>
                        {letter.title}
                      </button>
                    </td>
                    <td>{letter.shippingAddress.name}</td>
                    <td>{letter.shippingAddress.phone}</td>
                    <td className="physical-letter-table__address">
                      <div className="physical-letter-table__address-main">
                        ({letter.shippingAddress.zipCode}) {letter.shippingAddress.address1}
                      </div>
                      {letter.shippingAddress.address2 && <div className="physical-letter-table__address-detail">{letter.shippingAddress.address2}</div>}
                    </td>
                    <td>
                      <span className={`physical-letter-table__status physical-letter-table__status--${statusBadge.className}`}>{statusBadge.label}</span>
                    </td>
                    <td>{formatDate(letter.physicalRequestDate)}</td>
                    <td className="physical-letter-table__notes">
                      {letter.physicalNotes ? (
                        <div className="physical-letter-table__notes-content">{letter.physicalNotes.length > 50 ? `${letter.physicalNotes.substring(0, 50)}...` : letter.physicalNotes}</div>
                      ) : (
                        <span className="physical-letter-table__no-notes">-</span>
                      )}
                    </td>
                    <td>
                      <div className="physical-letter-table__actions">
                        <Button size="sm" variant="secondary" onClick={() => onViewDetail(letter)}>
                          상세
                        </Button>
                        {onStatusUpdate && (
                          <Button size="sm" onClick={() => onStatusUpdate(letter)}>
                            상태변경
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="physical-letter-table__empty">
                  실물 편지 신청이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
