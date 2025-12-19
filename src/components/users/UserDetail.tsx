import type { User } from "../../types";
import { USER_STATUS_LABELS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";
import "./UserDetail.scss";

interface UserDetailProps {
  user: User;
}

export default function UserDetail({ user }: UserDetailProps) {
  return (
    <div className="user-detail">
      <div className="user-detail__header">
        <div className="user-detail__avatar">{user.image ? <img src={user.image} alt={user.name} /> : <span>{user.name.charAt(0)}</span>}</div>
        <div className="user-detail__info">
          <h2 className="user-detail__name">{user.name}</h2>
          <p className="user-detail__email">{user.email}</p>
        </div>
        <span className={`user-status user-status--${user.status}`}>{USER_STATUS_LABELS[user.status]}</span>
      </div>

      <div className="user-detail__section">
        <h3>연동 계정</h3>
        {user.oauthAccounts.length > 0 ? (
          <div className="user-detail__oauth">
            {user.oauthAccounts.map((acc, idx) => (
              <span key={idx} className={`oauth-badge oauth-badge--${acc.provider}`}>
                {acc.provider}
              </span>
            ))}
          </div>
        ) : (
          <p className="user-detail__empty">연동된 계정이 없습니다</p>
        )}
      </div>

      <div className="user-detail__section">
        <h3>배송지 ({user.addresses.length})</h3>
        {user.addresses.length > 0 ? (
          <div className="user-detail__addresses">
            {user.addresses.map((addr) => (
              <div key={addr._id} className="address-card">
                <div className="address-card__header">
                  <span className="address-card__name">{addr.addressName}</span>
                  {addr.isDefault && <span className="address-card__default">기본</span>}
                </div>
                <p className="address-card__recipient">
                  {addr.recipientName} / {addr.phone}
                </p>
                <p className="address-card__address">
                  [{addr.zipCode}] {addr.address} {addr.addressDetail}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="user-detail__empty">등록된 배송지가 없습니다</p>
        )}
      </div>

      {user.status === "banned" && (
        <div className="user-detail__section user-detail__section--warning">
          <h3>정지 정보</h3>
          <p>
            <strong>정지일:</strong> {user.bannedAt ? formatDateTime(user.bannedAt) : "-"}
          </p>
          <p>
            <strong>사유:</strong> {user.bannedReason || "-"}
          </p>
        </div>
      )}

      <div className="user-detail__section">
        <h3>기타 정보</h3>
        <p>
          <strong>가입일:</strong> {formatDateTime(user.createdAt)}
        </p>
        <p>
          <strong>수정일:</strong> {formatDateTime(user.updatedAt)}
        </p>
      </div>
    </div>
  );
}
