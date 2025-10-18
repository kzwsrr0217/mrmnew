// mrmnew/frontend/src/pages/AdminPage.tsx

import { useState, useEffect } from 'react';
import { getUsers, updateUserRole, resetUserPassword } from '../services/api.service';
import { UserRole } from '../types';
import { AddUserForm } from '../components/AddUserForm'; // <-- ÚJ IMPORT

interface User {
  id: number;
  username: string;
  role: UserRole;
}

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- ÚJ ÁLLAPOT A MODÁLIS ABLAKHOZ ---
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('Felhasználók betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    if (!window.confirm(`Biztosan módosítja a felhasználó szerepkörét erre: ${newRole}?`)) return;
    try {
      await updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      alert('Hiba a szerepkör módosítása közben.');
    }
  };

  const handlePasswordReset = async (userId: number, username: string) => {
    const newPassword = prompt(`Adjon meg új jelszót a(z) "${username}" felhasználónak:`);
    if (!newPassword || newPassword.length < 6) {
      alert('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      return;
    }
    try {
      await resetUserPassword(userId, newPassword);
      alert('A jelszó sikeresen módosítva.');
    } catch (err) {
      alert('Hiba a jelszó módosítása közben.');
    }
  };
  
  const handleUserAdded = () => {
    setShowAddUserForm(false);
    fetchUsers(); // Frissítjük a listát az új felhasználóval
  };

  if (loading) return <p>Betöltés...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Adminisztráció / Felhasználókezelés</h1>
        {/* --- ÚJ GOMB --- */}
        <button onClick={() => setShowAddUserForm(true)}>+ Új felhasználó</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table className="personel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Felhasználónév</th>
            <th>Szerepkör</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>
                <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}>
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => handlePasswordReset(user.id, user.username)}>
                  Új jelszó
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* --- ÚJ RÉSZ: A MODÁLIS ABLAK MEGJELENÍTÉSE --- */}
      {showAddUserForm && (
        <AddUserForm 
          onUserAdded={handleUserAdded} 
          onCancel={() => setShowAddUserForm(false)} 
        />
      )}
    </div>
  );
}