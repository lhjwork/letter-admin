import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useBanUser, useUnbanUser, useDeleteUser } from "../hooks/useUsers";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import UserDetailComponent from "../components/users/UserDetail";
import BanModal from "../components/users/BanModal";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Loading from "../components/common/Loading";
import "./UserDetail.scss";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading } = useUser(id!);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();

  if (isLoading) return <Loading />;
  if (!data?.data) return <div className="error">사용자를 찾을 수 없습니다</div>;

  const user = data.data;
  const canWrite = hasPermission(PERMISSIONS.USERS_WRITE);
  const canDelete = hasPermission(PERMISSIONS.USERS_DELETE);

  const handleBan = (reason: string) => {
    banUser.mutate({ id: user._id, reason }, { onSuccess: () => setShowBanModal(false) });
  };

  const handleUnban = () => {
    unbanUser.mutate(user._id);
  };

  const handleDelete = () => {
    deleteUser.mutate(user._id, { onSuccess: () => navigate("/users") });
  };

  return (
    <div className="user-detail-page">
      <div className="user-detail-page__header">
        <div>
          <button className="user-detail-page__back" onClick={() => navigate("/users")}>
            ← 목록으로
          </button>
          <h1 className="user-detail-page__title">{user.name}</h1>
        </div>
        <div className="user-detail-page__actions">
          {canWrite && user.status === "active" && (
            <Button variant="danger" onClick={() => setShowBanModal(true)}>
              정지
            </Button>
          )}
          {canWrite && user.status === "banned" && (
            <Button variant="secondary" onClick={handleUnban} loading={unbanUser.isPending}>
              정지 해제
            </Button>
          )}
          {canDelete && user.status !== "deleted" && (
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              삭제
            </Button>
          )}
        </div>
      </div>

      <div className="user-detail-page__content">
        <UserDetailComponent user={user} />
      </div>

      <Modal isOpen={showBanModal} onClose={() => setShowBanModal(false)} title="사용자 정지">
        <BanModal userName={user.name} onConfirm={handleBan} onCancel={() => setShowBanModal(false)} loading={banUser.isPending} />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="사용자 삭제" size="sm">
        <div className="delete-confirm">
          <p>정말 이 사용자를 삭제하시겠습니까?</p>
          <p className="delete-confirm__name">
            {user.name} ({user.email})
          </p>
          <div className="delete-confirm__actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteUser.isPending}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
