import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: (response) => {
      if (response.success) {
        setAuth(response.data.token, response.data.admin);
        navigate("/dashboard");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "로그인에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Letter Admin</h1>
        <form onSubmit={handleSubmit} className="login__form">
          {error && <div className="login__error">{error}</div>}
          <div className="login__field">
            <label>아이디</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="letter-admin" required />
          </div>
          <div className="login__field">
            <label>비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="login__button" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
