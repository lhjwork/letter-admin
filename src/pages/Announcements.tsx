import { useState } from "react";
import { useAnnouncement, useAnnouncements, useDeleteAnnouncement, useSaveAnnouncement } from "../hooks/useAnnouncements";
import type { Announcement, AnnouncementInput } from "../types";
import { formatDate } from "../utils/format";
import Table from "../components/common/Table";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Textarea from "../components/common/Textarea";
import Modal from "../components/common/Modal";
import Pagination from "../components/common/Pagination";
import { notify, askConfirm } from "../components/common/Notice";
import "./Announcements.scss";

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;
const EMPTY: AnnouncementInput = { title: "", content: "", isPinned: false, isPublished: true };

/** 공지 관리 (커뮤니티 /notices). 본문은 일반 텍스트, 줄바꿈만 유지 */
export default function Announcements() {
  const [page, setPage] = useState(1);
  // null = 닫힘, "new" = 새로 쓰기, 그 외 = 수정할 공지 id
  const [editing, setEditing] = useState<string | null>(null);
  const { data, isLoading } = useAnnouncements(page);
  const remove = useDeleteAnnouncement();
  const list = data?.data;

  const handleDelete = async (n: Announcement) => {
    if (!(await askConfirm(`"${n.title}" 공지를 삭제하시겠습니까? 되돌릴 수 없습니다.`))) return;
    try {
      await remove.mutateAsync(n._id);
      setEditing(null);
      notify("공지를 삭제했습니다.");
    } catch {
      notify("삭제에 실패했습니다.", "error");
    }
  };

  const columns = [
    { key: "isPinned", header: "고정", width: "70px", render: (n: Announcement) => (n.isPinned ? <span className="ann-badge ann-badge--pin">고정</span> : "") },
    { key: "title", header: "제목", render: (n: Announcement) => <button type="button" className="ann-link" onClick={() => setEditing(n._id)}>{n.title}</button> },
    { key: "isPublished", header: "게시", width: "90px", render: (n: Announcement) => <span className={`ann-badge ${n.isPublished ? "ann-badge--on" : ""}`}>{n.isPublished ? "게시 중" : "숨김"}</span> },
    { key: "createdAt", header: "작성일", width: "120px", render: (n: Announcement) => formatDate(n.createdAt) },
    { key: "actions", header: "", width: "80px", render: (n: Announcement) => <Button size="sm" variant="ghost" onClick={() => handleDelete(n)}>삭제</Button> },
  ];

  return (
    <div className="announcements">
      <div className="announcements__header">
        <h1 className="announcements__title">공지</h1>
        <Button onClick={() => setEditing("new")}>+ 새 공지</Button>
      </div>
      <Table columns={columns} data={list?.items ?? []} keyExtractor={(n) => n._id} loading={isLoading} emptyMessage="공지가 없습니다" />
      {list && <Pagination page={page} totalPages={list.pagination.totalPages} onPageChange={setPage} />}
      {editing && <AnnouncementEditor id={editing === "new" ? null : editing} onClose={() => setEditing(null)} onDelete={handleDelete} />}
    </div>
  );
}

function AnnouncementEditor({ id, onClose, onDelete }: { id: string | null; onClose: () => void; onDelete: (n: Announcement) => void }) {
  const { data, isLoading } = useAnnouncement(id);
  const loaded = data?.data;
  return (
    <Modal isOpen onClose={onClose} title={id ? "공지 수정" : "새 공지"} size="lg">
      {id && isLoading ? (
        <p>불러오는 중...</p>
      ) : (
        <AnnouncementForm
          id={id}
          initial={loaded ? { title: loaded.title, content: loaded.content ?? "", isPinned: loaded.isPinned, isPublished: loaded.isPublished } : EMPTY}
          onClose={onClose}
          onDelete={loaded ? () => onDelete(loaded) : undefined}
        />
      )}
    </Modal>
  );
}

function AnnouncementForm({ id, initial, onClose, onDelete }: { id: string | null; initial: AnnouncementInput; onClose: () => void; onDelete?: () => void }) {
  const save = useSaveAnnouncement();
  const [form, setForm] = useState<AnnouncementInput>(initial);
  const set = <K extends keyof AnnouncementInput>(k: K, v: AnnouncementInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, title: form.title.trim(), content: form.content.trim() };
    if (!data.title || !data.content) return notify("제목과 내용을 입력해주세요.", "error");
    try {
      await save.mutateAsync({ id: id ?? undefined, data });
      notify(id ? "공지를 수정했습니다." : "공지를 등록했습니다.");
      onClose();
    } catch {
      notify("저장에 실패했습니다.", "error");
    }
  };

  return (
    <form className="ann-form" onSubmit={submit}>
      <Input label={`제목 (${form.title.length}/${TITLE_MAX})`} value={form.title} maxLength={TITLE_MAX} onChange={(e) => set("title", e.target.value)} required />
      <Textarea
        label={`내용 (${form.content.length}/${CONTENT_MAX})`}
        helperText="일반 텍스트만 들어가요. 줄바꿈은 그대로 보여요."
        rows={14}
        value={form.content}
        maxLength={CONTENT_MAX}
        onChange={(e) => set("content", e.target.value)}
        required
      />
      <div className="ann-form__checks">
        <label>
          <input type="checkbox" checked={form.isPinned} onChange={(e) => set("isPinned", e.target.checked)} /> 목록 맨 위에 고정
        </label>
        <label>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} /> 게시 (끄면 사용자에게 안 보임)
        </label>
      </div>
      <div className="ann-form__actions">
        {onDelete && (
          <Button type="button" variant="danger" onClick={onDelete}>
            삭제
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" loading={save.isPending}>
          {id ? "수정" : "등록"}
        </Button>
      </div>
    </form>
  );
}
