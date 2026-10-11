import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLetter, useUpdateLetterStatus, useDeleteLetter, useStoryReplies, useToggleAdopt } from "../hooks/useLetters";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS, type LetterStatus } from "../types";
import { LETTER_STATUS_LABELS } from "../utils/constants";
import { formatDateTime } from "../utils/format";
import { askConfirm, notify } from "../components/common/Notice";
import LetterDetailComponent from "../components/letters/LetterDetail";
import StatusModal from "../components/letters/StatusModal";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Loading from "../components/common/Loading";
import "./LetterDetail.scss";

export default function LetterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading } = useLetter(id!);
  const updateStatus = useUpdateLetterStatus();
  const deleteLetter = useDeleteLetter();
  const toggleAdopt = useToggleAdopt();
  const isStory = data?.data?.type === "story";
  const { data: repliesData, isLoading: repliesLoading } = useStoryReplies(id!, isStory);

  if (isLoading) return <Loading />;
  if (!data?.data) return <div className="error">편지/사연을 찾을 수 없습니다</div>;

  const letter = data.data;
  const canWrite = hasPermission(PERMISSIONS.LETTERS_WRITE);
  const canDelete = hasPermission(PERMISSIONS.LETTERS_DELETE);

  const handleStatusChange = (status: LetterStatus, reason?: string) => {
    updateStatus.mutate({ id: letter._id, status, reason }, { onSuccess: () => setShowStatusModal(false) });
  };

  // 채택된 답장은 사연자 우편함에 전달되고 실물로 신청할 수 있다
  const handleAdopt = async (replyId: string, isAdopted: boolean) => {
    const ok = await askConfirm(isAdopted ? "이 답장의 채택을 취소하시겠습니까? 사연자 우편함에서 빠집니다." : "이 답장을 채택하시겠습니까? 사연자 우편함에 전달되고 실물 편지로 신청할 수 있게 됩니다.");
    if (!ok) return;
    try {
      const res = await toggleAdopt.mutateAsync(replyId);
      notify(res.data.isAdopted ? "답장을 채택했습니다." : "채택을 취소했습니다.");
    } catch {
      notify("채택 처리에 실패했습니다.", "error");
    }
  };

  const replies = repliesData?.data ?? [];

  const handleDelete = () => {
    deleteLetter.mutate(letter._id, { onSuccess: () => navigate("/letters") });
  };

  return (
    <div className="letter-detail-page">
      <div className="letter-detail-page__header">
        <div>
          <button className="letter-detail-page__back" onClick={() => navigate("/letters")}>
            ← 목록으로
          </button>
          <h1 className="letter-detail-page__title">{letter.title}</h1>
        </div>
        <div className="letter-detail-page__actions">
          {letter.replyToId && (
            <Link className="letter-detail-page__link" to={`/letters/${letter.replyToId}`}>
              원래 사연 보기
            </Link>
          )}
          {canWrite && letter.replyToId && !letter.isAdminReply && (
            <Button variant={letter.adoptedAt ? "secondary" : "primary"} onClick={() => handleAdopt(letter._id, !!letter.adoptedAt)} loading={toggleAdopt.isPending}>
              {letter.adoptedAt ? "채택 취소" : "채택"}
            </Button>
          )}
          {canWrite && letter.status !== "deleted" && (
            <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
              상태 변경
            </Button>
          )}
          {canDelete && letter.status !== "deleted" && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              삭제
            </Button>
          )}
        </div>
      </div>

      <div className="letter-detail-page__content">
        <LetterDetailComponent letter={letter} />
        {letter.replyToId && <p className="letter-detail-page__reply-note">{letter.isAdminReply ? "레터 답장 (채택 대상 아님)" : letter.adoptedAt ? `채택됨 · ${formatDateTime(letter.adoptedAt)}` : "채택 전 답장"}</p>}
      </div>

      {isStory && (
        <section className="letter-detail-page__content story-replies" aria-labelledby="story-replies-title">
          <h2 id="story-replies-title" className="story-replies__title">
            답장 {replies.length}통
          </h2>
          {repliesLoading ? (
            <Loading />
          ) : replies.length === 0 ? (
            <p className="story-replies__empty">아직 답장이 없습니다.</p>
          ) : (
            <table className="story-replies__table">
              <thead>
                <tr>
                  <th>작성자</th>
                  <th>구분</th>
                  <th>본문 미리보기</th>
                  <th>상태</th>
                  <th>작성일</th>
                  <th>채택</th>
                </tr>
              </thead>
              <tbody>
                {replies.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.authorName}
                      {r.isAnonymous && <span className="story-replies__sub"> (익명)</span>}
                    </td>
                    <td>{r.isAdminReply ? <span className="story-replies__tag story-replies__tag--team">레터 답장</span> : r.isAdopted ? <span className="story-replies__tag story-replies__tag--adopted">채택됨</span> : "일반 답장"}</td>
                    <td>
                      <Link to={`/letters/${r._id}`} className="story-replies__preview">
                        {r.preview || "(본문 없음)"}
                      </Link>
                    </td>
                    <td>
                      <span className={`letter-status letter-status--${r.status}`}>{LETTER_STATUS_LABELS[r.status]}</span>
                    </td>
                    <td>{formatDateTime(r.createdAt)}</td>
                    <td>
                      {canWrite && !r.isAdminReply ? (
                        <Button size="sm" variant={r.isAdopted ? "secondary" : "primary"} onClick={() => handleAdopt(r._id, r.isAdopted)} disabled={toggleAdopt.isPending}>
                          {r.isAdopted ? "채택 취소" : "채택"}
                        </Button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="상태 변경">
        <StatusModal currentStatus={letter.status} onConfirm={handleStatusChange} onCancel={() => setShowStatusModal(false)} loading={updateStatus.isPending} />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="편지/사연 삭제" size="sm">
        <div className="delete-confirm">
          <p>정말 이 편지/사연을 삭제하시겠습니까?</p>
          <p className="delete-confirm__name">{letter.title}</p>
          <div className="delete-confirm__actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLetter.isPending}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
