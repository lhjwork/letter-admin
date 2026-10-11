import { useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import "./Notice.scss";

// 브라우저 alert/confirm 대신 쓰는 알림 토스트와 확인 창. <NoticeHost /> 는 App 에 한 번만 둔다.
type Toast = { id: number; text: string; tone: "info" | "error" };
type Ask = { text: string; resolve: (ok: boolean) => void };

let pushToast: ((t: Toast) => void) | null = null;
let openAsk: ((a: Ask) => void) | null = null;
let seq = 0;

/** 결과 알림. 3초 뒤 사라진다 */
export function notify(text: string, tone: Toast["tone"] = "info") {
  pushToast?.({ id: ++seq, text, tone });
}

/** 확인 창. 확인=true, 취소·닫기=false */
export function askConfirm(text: string): Promise<boolean> {
  return new Promise((resolve) => (openAsk ? openAsk({ text, resolve }) : resolve(false)));
}

export function NoticeHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ask, setAsk] = useState<Ask | null>(null);

  useEffect(() => {
    pushToast = (t) => {
      setToasts((ts) => [...ts, t]);
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== t.id)), 3000);
    };
    openAsk = setAsk;
    return () => {
      pushToast = null;
      openAsk = null;
    };
  }, []);

  const answer = (ok: boolean) => {
    ask?.resolve(ok);
    setAsk(null);
  };

  return (
    <>
      <div className="notice-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.tone === "error" ? "alert" : "status"} className={`notice notice--${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
      <Modal isOpen={!!ask} onClose={() => answer(false)} title="확인" size="sm">
        <p className="notice-confirm__text">{ask?.text}</p>
        <div className="notice-confirm__actions">
          <Button variant="secondary" onClick={() => answer(false)}>
            취소
          </Button>
          <Button autoFocus onClick={() => answer(true)}>
            확인
          </Button>
        </div>
      </Modal>
    </>
  );
}
