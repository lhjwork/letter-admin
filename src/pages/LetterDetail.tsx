import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLetter, useUpdateLetterStatus, useDeleteLetter } from "../hooks/useLetters";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS, type LetterStatus } from "../types";
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

  if (isLoading) return <Loading />;
  if (!data?.data) return <div className="error">편지/사연을 찾을 수 없습니다</div>;

  const letter = data.data;
  const canWrite = hasPermission(PERMISSIONS.LETTERS_WRITE);
  const canDelete = hasPermission(PERMISSIONS.LETTERS_DELETE);

  const handleStatusChange = (status: LetterStatus, reason?: string) => {
    updateStatus.mutate({ id: letter._id, status, reason }, { onSuccess: () => setShowStatusModal(false) });
  };

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
      </div>

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
