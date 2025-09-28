// mrmnew/frontend/src/pages/LogisticsPage.tsx

import { useState, useEffect } from 'react';
import { getLogisticsItems } from '../services/api.service';
import { useTableControls } from '../hooks/useTableControls';
import { AddLogisticsItemForm } from '../components/AddLogisticsItemForm';
import { AssignToSystemModal } from '../components/AssignToSystemModal';

interface LogisticsItem {
  id: number;
  name: string;
  type: string;
  status: string;
  logistics_id: string;
  serial_number: string;
  quantity: number;
  location: string;
  assigned_hardware: {
    system: {
      systemname: string;
    }
  } | null;
}

export function LogisticsPage() {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assigningItem, setAssigningItem] = useState<LogisticsItem | null>(null);

  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
    requestSort,
    sortConfig,
  } = useTableControls({
    data: items,
    filterFn: (item, term) => {
        const lowerCaseTerm = term.toLowerCase();
        return (
            item.name.toLowerCase().includes(lowerCaseTerm) ||
            (item.logistics_id && item.logistics_id.toLowerCase().includes(lowerCaseTerm)) ||
            (item.serial_number && item.serial_number.toLowerCase().includes(lowerCaseTerm)) ||
            (item.location && item.location.toLowerCase().includes(lowerCaseTerm))
        );
    }
  });

  const fetchItems = () => {
    setLoading(true);
    getLogisticsItems()
      .then(res => setItems(res.data))
      .catch(() => setError('A logisztikai adatok betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleItemAdded = () => {
    setShowAddForm(false);
    fetchItems();
  }

  const handleItemAssigned = () => {
    setAssigningItem(null);
    fetchItems();
  };
  
  const getSortIcon = (key: keyof LogisticsItem) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="sort-icon">↕️</span>;
    return sortConfig.direction === 'ascending' ? <span className="sort-icon">🔼</span> : <span className="sort-icon">🔽</span>;
  };

  if (loading) return <p>Betöltés...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Logisztikai Nyilvántartás</h1>
        <button onClick={() => setShowAddForm(true)}>Új tétel manuális rögzítése</button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Keresés (név, HETK, S/N, hely)..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ width: '300px' }}
        />
        <div>
          <label>Elemek/oldal: </label>
          <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="personel-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('type')}>Típus {getSortIcon('type')}</th>
              <th className="sortable" onClick={() => requestSort('name')}>Név {getSortIcon('name')}</th>
              <th>Gyári szám</th>
              <th>HETK Kód</th>
              <th className="sortable" onClick={() => requestSort('quantity')}>Mennyiség {getSortIcon('quantity')}</th>
              <th className="sortable" onClick={() => requestSort('location')}>Hely {getSortIcon('location')}</th>
              <th className="sortable" onClick={() => requestSort('status')}>Státusz {getSortIcon('status')}</th>
              <th>Hozzárendelt rendszer</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(item => (
              <tr key={item.id}>
                <td>{item.type}</td>
                <td>{item.name}</td>
                <td>{item.serial_number || '-'}</td>
                <td>{item.logistics_id || '-'}</td>
                <td>{item.quantity}</td>
                <td>{item.location || '-'}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === 'Raktáron' && item.type === 'Eszköz' ? (
                    <button onClick={() => setAssigningItem(item)}>
                      Hozzárendelés
                    </button>
                  ) : (
                    item.assigned_hardware?.system?.systemname || '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              Előző
          </button>
          <span style={{ margin: '0 1rem' }}>
              Oldal: {currentPage} / {totalPages || 1}
          </span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
              Következő
          </button>
      </div>

      {showAddForm && <AddLogisticsItemForm onSuccess={handleItemAdded} onCancel={() => setShowAddForm(false)} />}
      
      {assigningItem && (
        <AssignToSystemModal
          item={assigningItem}
          onClose={() => setAssigningItem(null)}
          onSuccess={handleItemAssigned}
        />
      )}
    </div>
  );
}