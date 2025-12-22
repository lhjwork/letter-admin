import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useUserDetail, useBanUser, useUnbanUser, useDeleteUser } from "../hooks/useUsers";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS } from "../types";
import UserDetailComponent from "../components/users/UserDetail";
import UserStats from "../components/users/UserStats";
import UserLetters from "../components/users/UserLetters";
import BanModal from "../components/users/BanModal";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Loading from "../components/common/Loading";
import "./UserDetail.scss";

type TabType = "info" | "stats" | "letters";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: userData, isLoading: userLoading } = useUser(id!);
  const { data: userDetailData, isLoading: detailLoading } = useUserDetail(id!);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();

  const isLoading = userLoading || detailLoading;

  if (isLoading) return <Loading />;
  if (!userData?.data) return <div className="error">사용자를 찾을 수 없습니다</div>;

  const user = userData.data;
  const userDetail = userDetailData?.data;
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

  const tabs = [
    { id: "info" as TabType, label: "기본 정보", icon: "👤" },
    { id: "stats" as TabType, label: "통계", icon: "📊" },
    { id: "letters" as TabType, label: "편지 목록", icon: "📝" },
  ];

  return (
    <div className="user-detail-page">
      <div className="user-detail-page__header">
        <div>
          <button className="user-detail-page__back" onClick={() => navigate("/users")}>
            ← 목록으로
          </button>
          <h1 className="user-detail-page__title">{user.name}</h1>
          <div className="user-detail-page__subtitle">{user.email}</div>
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

      <div className="user-detail-page__tabs">
        {tabs.map((tab) => (
          <button key={tab.id} className={`user-detail-page__tab ${activeTab === tab.id ? "user-detail-page__tab--active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            <span className="user-detail-page__tab-icon">{tab.icon}</span>
            <span className="user-detail-page__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="user-detail-page__content">
        {activeTab === "info" && <UserDetailComponent user={user} />}
        {activeTab === "stats" &&
          (userDetail?.stats ? (
            <UserStats stats={userDetail.stats} />
          ) : (
            <div className="user-detail-page__no-data">
              <p>통계 정보를 불러올 수 없습니다.</p>
              <p className="user-detail-page__hint">백엔드 API가 구현되지 않았을 수 있습니다.</p>
            </div>
          ))}
        {activeTab === "letters" && <UserLetters userId={user._id} />}
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
