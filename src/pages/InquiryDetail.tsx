import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAnswerInquiry, useInquiry } from "../hooks/useInquiries";
import { usePermission } from "../hooks/usePermission";
import { PERMISSIONS, type InquiryDetail as Detail } from "../types";
import { formatDateTime } from "../utils/format";
import Button from "../components/common/Button";
import Textarea from "../components/common/Textarea";
import Loading from "../components/common/Loading";
import { notify } from "../components/common/Notice";
import { InquiryStatusBadge } from "./Inquiries";
import "./Inquiries.scss";

const ANSWER_MAX = 3000;

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useInquiry(id!);

  if (isLoading) return <Loading />;
  const q = data?.data;
  if (!q) return <div className="error">문의를 찾을 수 없습니다</div>;

  return (
    <div className="inquiries">
      <Link to="/inquiries" className="inquiries__back">
        ← 목록으로
      </Link>
      <div className="inq-card">
        <div className="inq-card__meta">
          <InquiryStatusBadge status={q.status} />
          <span>{q.category}</span>
          <span>{q.nickname}</span>
          {q.email && <span>{q.email}</span>}
          <span>{formatDateTime(q.createdAt)}</span>
        </div>
        <h1 className="inq-card__title">{q.title}</h1>
        <p className="inq-card__body">{q.content}</p>
      </div>
      {/* 답변이 바뀌면 폼을 새로 그린다 */}
      <AnswerForm key={q.answer ?? ""} q={q} />
    </div>
  );
}

function AnswerForm({ q }: { q: Detail }) {
  const { hasPermission } = usePermission();
  const canWrite = hasPermission(PERMISSIONS.INQUIRIES_WRITE);
  const save = useAnswerInquiry();
  const [answer, setAnswer] = useState(q.answer ?? "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = answer.trim();
    if (!text) return notify("답변을 입력해주세요.", "error");
    try {
      await save.mutateAsync({ id: q._id, answer: text });
      notify(q.answer ? "답변을 수정했습니다." : "답변을 저장했습니다. 사용자 문의 화면에 보입니다.");
    } catch {
      notify("답변 저장에 실패했습니다.", "error");
    }
  };

  return (
    <form className="inq-card" onSubmit={submit}>
      <h2 className="inq-card__subtitle">답변</h2>
      {q.answeredAt && (
        <p className="inq-card__meta">
          {q.answeredByName ?? "관리자"} · {formatDateTime(q.answeredAt)}
        </p>
      )}
      <Textarea
        label={`답변 내용 (${answer.length}/${ANSWER_MAX})`}
        helperText="일반 텍스트만 들어가요. 줄바꿈은 그대로 보여요."
        rows={10}
        value={answer}
        maxLength={ANSWER_MAX}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!canWrite}
      />
      {canWrite && (
        <div className="inq-card__actions">
          <Button type="submit" loading={save.isPending}>
            {q.answer ? "답변 수정" : "답변 저장"}
          </Button>
        </div>
      )}
    </form>
  );
}
