import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangePassword } from "../hooks/useAuth";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./ChangePassword.scss";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const changePassword = useChangePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다");
      return;
    }

    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다");
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setSuccess(true);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: Error) => {
          setError(err.message || "비밀번호 변경에 실패했습니다");
        },
      }
    );
  };

  return (
    <div className="change-password">
      <div className="change-password__header">
        <button className="change-password__back" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="change-password__title">비밀번호 변경</h1>
      </div>

      <div className="change-password__card">
        {success && <div className="change-password__success">비밀번호가 성공적으로 변경되었습니다</div>}
        {error && <div className="change-password__error">{error}</div>}

        <form onSubmit={handleSubmit} className="change-password__form">
          <Input label="현재 비밀번호" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="새 비밀번호" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="새 비밀번호 확인" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <div className="change-password__actions">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              취소
            </Button>
            <Button type="submit" loading={changePassword.isPending}>
              변경
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
