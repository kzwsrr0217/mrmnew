// mrmnew/frontend/src/components/layout/Sidebar.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types';
import './layout.css';

export function Sidebar() {
    const { user } = useAuth();

    // Ha nincs user, vagy a user nem Alegységparancsnok, a teljes menüt mutatjuk
    const isApk = user?.role === UserRole.ALEGYSEGPARANCSNOK;

    if (isApk) {
        return (
            <aside className="app-sidebar">
                <h3>Menü</h3>
                <nav>
                    <Link to="/tickets">Feladatok</Link>
                </nav>
            </aside>
        );
    }

    // A már meglévő, teljes menü a többi felhasználónak
    // JAVÍTVA: Hozzáadva az UserRole.ADMIN
    const isApprover = user && [UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV, UserRole.SZBF].includes(user.role as UserRole);
    const canRequestAccess = user && [UserRole.ADMIN, UserRole.RBF].includes(user.role as UserRole);

    return (
        <aside className="app-sidebar">
            <h3>Táblák</h3>
            <nav>
                <Link to="/systems">Systems</Link>
                <Link to="/personel">Személyi állomány</Link>
                <Link to="/access">Access</Link>
                <Link to="/tickets">Feladatok</Link>
                <Link to="/reports">Jelentések</Link>
                <Link to="/logistics">Logisztika</Link>
            </nav>
            <h3>Folyamatok</h3>
            <nav>
                {isApprover && <Link to="/pending-requests">Jóváhagyási feladatok</Link>}
                {canRequestAccess && <Link to="/forms">Új hozzáférési kérelem</Link>}
            </nav>
            <h3>Adminisztráció</h3>
            <nav>
                {user?.role === UserRole.ADMIN && <Link to="/admin/dashboard">Műszerfal</Link>}
                {user?.role === UserRole.ADMIN && <Link to="/admin">Felhasználók</Link>}
                {user?.role === UserRole.ADMIN && <Link to="/audit">Napló</Link>}
                {user?.role === UserRole.ADMIN && <Link to="/admin/locations">Helyszínek</Link>}
                {user?.role === UserRole.ADMIN && <Link to="/admin/permits">Adatkezelési engedélyek</Link>}
                <Link to="/maintenance">Karbantartás</Link>
            </nav>
        </aside>
    );
}