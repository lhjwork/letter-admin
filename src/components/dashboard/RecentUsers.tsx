import { Link } from "react-router-dom";
import type { User } from "../../types";
import { formatDate } from "../../utils/format";
import "./RecentUsers.scss";

interface RecentUsersProps {
  users: User[];
}

export default function RecentUsers({ users }: RecentUsersProps) {
  return (
    <div className="recent-users">
      <h3 className="recent-users__title">최근 가입 사용자</h3>
      <div className="recent-users__list">
        {users.length === 0 ? (
          <p className="recent-users__empty">최근 가입한 사용자가 없습니다</p>
        ) : (
          users.map((user) => (
            <Link key={user._id} to={`/users/${user._id}`} className="recent-users__item">
              <div className="recent-users__avatar">{user.image ? <img src={user.image} alt={user.name} /> : <span>{user.name.charAt(0)}</span>}</div>
              <div className="recent-users__info">
                <span className="recent-users__name">{user.name}</span>
                <span className="recent-users__email">{user.email}</span>
              </div>
              <span className="recent-users__date">{formatDate(user.createdAt)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
