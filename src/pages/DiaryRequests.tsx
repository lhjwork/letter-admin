import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import { formatDate } from "../utils/format";
import Loading from "../components/common/Loading";
import Button from "../components/common/Button";
import Select from "../components/common/Select";
import { DIARY_STATUS_LABEL, getDiaryPhysicalRequests, getDiaryPrintLink, updateDiaryPhysical, type DiaryPhysicalRequest, type DiaryPhysicalStatus } from "../api/diaries";
import "./PhysicalLetterRequests.scss";

const COMMUNITY_URL = import.meta.env.VITE_COMMUNITY_URL || "https://letter.seoul.kr";
const STATUSES = Object.keys(DIARY_STATUS_LABEL).filter((s) => s !== "none") as DiaryPhysicalStatus[];
const badge: Record<DiaryPhysicalStatus, string> = { none: "default", requested: "warning", approved: "info", printing: "primary", sent: "success", delivered: "success", rejected: "default" };

/** 다이어리 실물 제본 신청 목록. 실물 편지 신청 화면과 같은 스타일(.physical-letter-requests)을 그대로 쓴다 */
export default function DiaryRequests() {
  const { hasPermission } = usePermission();
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "diary-requests", status],
    queryFn: () => getDiaryPhysicalRequests(status || undefined),
  });
  const mutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: DiaryPhysicalStatus; notes?: string }) => updateDiaryPhysical(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "diary-requests"] }),
  });

  if (!hasPermission(PERMISSIONS.LETTERS_READ)) return <div className="physical-letter-requests__error">권한이 없습니다</div>;
  if (isLoading) return <Loading />;
  if (error) return <div className="error">데이터를 불러오는데 실패했습니다</div>;

  const canWrite = hasPermission(PERMISSIONS.LETTERS_WRITE);
  const rows = data?.data || [];
  const user = (r: DiaryPhysicalRequest) => (typeof r.userId === "string" ? { name: r.userId } : r.userId);

  return (
    <div className="physical-letter-requests">
      <div className="physical-letter-requests__header">
        <h1 className="physical-letter-requests__title">다이어리 제본 신청</h1>
        <div className="physical-letter-requests__filters">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "", label: "전체 상태" }, ...STATUSES.map((s) => ({ value: s, label: DIARY_STATUS_LABEL[s] }))]} />
          <Button onClick={() => refetch()} loading={isLoading} size="sm">🔄 새로고침</Button>
        </div>
      </div>

      <div className="physical-letter-requests__table-container">
        <table className="physical-letter-requests__table">
          <thead>
            <tr>
              <th>다이어리</th>
              <th>신청자</th>
              <th>배송 주소</th>
              <th>제본</th>
              <th>상태</th>
              <th>신청일</th>
              <th>메모</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="physical-letter-requests__empty">신청이 없습니다</td>
              </tr>
            )}
            {rows.map((r) => (
              <Row key={r._id} r={r} u={user(r)} canWrite={canWrite} saving={mutation.isPending} onSave={(body) => mutation.mutate({ id: r._id, ...body })} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ r, u, canWrite, saving, onSave }: { r: DiaryPhysicalRequest; u: { name?: string; realName?: string; email?: string }; canWrite: boolean; saving: boolean; onSave: (b: { status?: DiaryPhysicalStatus; notes?: string }) => void }) {
  const [st, setSt] = useState<DiaryPhysicalStatus>(r.physical.status);
  const [notes, setNotes] = useState(r.physical.notes || "");
  const a = r.physical.address;
  const dirty = st !== r.physical.status || notes !== (r.physical.notes || "");
  return (
    <tr>
      <td>
        <div className="physical-letter-requests__letter-info">
          <div className="physical-letter-requests__letter-title">{r.title}</div>
          <div className="physical-letter-requests__letter-author">{r.month} · {r.paper} · {r.font}</div>
          <button
            type="button"
            style={{ fontSize: 12, color: "#2563eb", background: "none", border: 0, padding: 0, cursor: "pointer" }}
            onClick={async () => {
              const w = window.open("", "_blank"); // 팝업 차단 회피: 클릭 직후 창을 먼저 연다
              try {
                const { data } = await getDiaryPrintLink(r._id);
                const url = `${COMMUNITY_URL}/diary/${r._id}/print?t=${encodeURIComponent(data.token)}`;
                if (w) w.location.href = url;
                else window.open(url, "_blank");
              } catch {
                w?.close();
                alert("인쇄 링크를 만들지 못했습니다.");
              }
            }}
          >
            인쇄 뷰 열기 ↗ (15분 링크)
          </button>
        </div>
      </td>
      <td>
        <div className="physical-letter-requests__recipient-info">
          <div className="physical-letter-requests__recipient-name">{u.realName || u.name || "-"}</div>
          <div className="physical-letter-requests__recipient-phone">{u.email || ""}</div>
        </div>
      </td>
      <td>
        <div className="physical-letter-requests__address">
          {a ? (
            <>
              {a.name} · 📞 {a.phone}
              <br />
              {a.address1} {a.address2}
              <br />({a.zipCode}){a.memo ? ` · ${a.memo}` : ""}
            </>
          ) : "-"}
        </div>
      </td>
      <td>{r.physical.binding === "spring" ? "스프링" : "무선"} {r.physical.copies}권</td>
      <td>
        {canWrite ? (
          <Select value={st} onChange={(e) => setSt(e.target.value as DiaryPhysicalStatus)} options={STATUSES.map((s) => ({ value: s, label: DIARY_STATUS_LABEL[s] }))} />
        ) : (
          <span className={`physical-letter-requests__status-badge physical-letter-requests__status-badge--${badge[r.physical.status]}`}>{DIARY_STATUS_LABEL[r.physical.status]}</span>
        )}
      </td>
      <td>
        <div className="physical-letter-requests__date">{r.physical.requestedAt ? formatDate(r.physical.requestedAt) : "-"}</div>
      </td>
      <td>
        {canWrite ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="사용자에게 보일 메모" maxLength={500} style={{ minWidth: 160, padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4 }} />
            <Button size="sm" disabled={!dirty || saving} onClick={() => onSave({ status: st, notes })}>저장</Button>
          </div>
        ) : (
          <div className="physical-letter-requests__memo">{r.physical.notes || "-"}</div>
        )}
      </td>
    </tr>
  );
}
