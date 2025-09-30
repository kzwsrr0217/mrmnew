// mrmnew/frontend/src/components/layout/Sidebar.tsx

import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { UserRole } from '../../types';
import './layout.css';

export function Sidebar() {
  const { user } = useAuth();

  // Egyszerűsített jogosultságkezelés
  const isAdmin = user?.role === UserRole.ADMIN;
  const isApprover = user && [UserRole.BV, UserRole.HBV, UserRole.HHBV, UserRole.SZBF].includes(user.role as UserRole);
  const canRequestAccess = user && [UserRole.ADMIN, UserRole.RBF].includes(user.role as UserRole);
  const isApk = user?.role === UserRole.ALEGYSEGPARANCSNOK;

  // Külön menü az alegységparancsnokoknak
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

  // Teljes menü a többi felhasználónak
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
        {isAdmin && <Link to="/admin/dashboard">Műszerfal</Link>}
        {isAdmin && <Link to="/admin">Felhasználók</Link>}
        {isAdmin && <Link to="/audit">Napló</Link>}
        {isAdmin && <Link to="/admin/locations">Helyszínek</Link>}
        {isAdmin && <Link to="/admin/permits">Adatkezelési engedélyek</Link>}
        {/* --- ÚJ MENÜPONT --- */}
        {isAdmin && <Link to="/admin/classifications">Minősítési szintek</Link>}
        <Link to="/maintenance">Karbantartás</Link>
      </nav>
    </aside>
  );
}