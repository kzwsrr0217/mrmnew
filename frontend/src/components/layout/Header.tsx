// mrmnew/frontend/src/components/layout/Header.tsx

import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
    const { user, notifications, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    // JAVÍTVA: Biztonságos hozzáférés az értesítésekhez
    const notificationCount = (notifications?.openTickets?.length || 0) + (notifications?.pendingApprovals?.length || 0);

    return (
        <header className="app-header">
            <h2>Minősített Rendszer Menedzsment</h2>
            {user && (
                <div className="user-info">
                    <span>
                        Üdv, {user.username}
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                    </span>
                    <button onClick={handleLogout}>Kijelentkezés</button>
                </div>
            )}
        </header>
    )
}