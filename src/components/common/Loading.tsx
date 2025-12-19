import "./Loading.scss";

interface LoadingProps {
  fullPage?: boolean;
  text?: string;
}

export default function Loading({ fullPage = false, text = "로딩 중..." }: LoadingProps) {
  const content = (
    <div className="loading">
      <div className="loading__spinner" />
      {text && <p className="loading__text">{text}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-fullpage">{content}</div>;
  }

  return content;
}
