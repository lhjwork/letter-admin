import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin, useUpdateAdmin, useDeleteAdmin } from "../hooks/useAdmins";
import AdminDetailComponent from "../components/admins/AdminDetail";
import AdminForm, { type AdminFormData } from "../components/admins/AdminForm";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Loading from "../components/common/Loading";
import "./AdminDetail.scss";

export default function AdminDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, isLoading } = useAdmin(id!);
  const updateAdmin = useUpdateAdmin();
  const deleteAdmin = useDeleteAdmin();

  if (isLoading) return <Loading />;
  if (!data?.data) return <div className="error">관리자를 찾을 수 없습니다</div>;

  const admin = data.data;

  const handleUpdate = (formData: AdminFormData) => {
    updateAdmin.mutate(
      {
        id: admin._id,
        data: {
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
          department: formData.department,
          status: formData.status,
        },
      },
      {
        onSuccess: () => setShowEditModal(false),
      }
    );
  };

  const handleDelete = () => {
    deleteAdmin.mutate(admin._id, {
      onSuccess: () => navigate("/admins"),
    });
  };

  return (
    <div className="admin-detail-page">
      <div className="admin-detail-page__header">
        <div>
          <button className="admin-detail-page__back" onClick={() => navigate("/admins")}>
            ← 목록으로
          </button>
          <h1 className="admin-detail-page__title">{admin.name}</h1>
        </div>
        <div className="admin-detail-page__actions">
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            수정
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            삭제
          </Button>
        </div>
      </div>

      <div className="admin-detail-page__content">
        <AdminDetailComponent admin={admin} />
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="관리자 수정">
        <AdminForm admin={admin} onSubmit={handleUpdate} onCancel={() => setShowEditModal(false)} loading={updateAdmin.isPending} isEdit />
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="관리자 삭제" size="sm">
        <div className="delete-confirm">
          <p>정말 이 관리자를 삭제하시겠습니까?</p>
          <p className="delete-confirm__name">
            {admin.name} ({admin.username})
          </p>
          <div className="delete-confirm__actions">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteAdmin.isPending}>
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
