import { useState } from "react";
import { useAdmins, useCreateAdmin } from "../hooks/useAdmins";
import type { AdminQueryParams } from "../types";
import AdminTable from "../components/admins/AdminTable";
import AdminForm, { type AdminFormData } from "../components/admins/AdminForm";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import "./Admins.scss";

const ROLE_OPTIONS = [
  { value: "", label: "전체 역할" },
  { value: "super_admin", label: "최고 관리자" },
  { value: "admin", label: "관리자" },
  { value: "manager", label: "매니저" },
];

const STATUS_OPTIONS = [
  { value: "", label: "전체 상태" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

export default function Admins() {
  const [params, setParams] = useState<AdminQueryParams>({
    page: 1,
    limit: 10,
    search: "",
    role: "",
    status: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useAdmins(params);
  const createAdmin = useCreateAdmin();

  const handleCreate = (formData: AdminFormData) => {
    createAdmin.mutate(
      {
        username: formData.username!,
        password: formData.password!,
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions,
        department: formData.department,
      },
      {
        onSuccess: () => setShowCreateModal(false),
      }
    );
  };

  return (
    <div className="admins">
      <div className="admins__header">
        <h1 className="admins__title">관리자 관리</h1>
        <Button onClick={() => setShowCreateModal(true)}>관리자 추가</Button>
      </div>

      <div className="admins__filters">
        <Input placeholder="이름, 이메일 검색" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />
        <Select options={ROLE_OPTIONS} value={params.role} onChange={(e) => setParams({ ...params, role: e.target.value as AdminQueryParams["role"], page: 1 })} />
        <Select options={STATUS_OPTIONS} value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value as AdminQueryParams["status"], page: 1 })} />
      </div>

      <AdminTable admins={data?.data || []} loading={isLoading} />

      {data?.pagination && <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={(page) => setParams({ ...params, page })} />}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="관리자 추가">
        <AdminForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} loading={createAdmin.isPending} />
      </Modal>
    </div>
  );
}
