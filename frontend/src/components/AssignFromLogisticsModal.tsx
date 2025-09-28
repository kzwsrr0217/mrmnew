// mrmnew/frontend/src/components/AssignFromLogisticsModal.tsx

import { useState, useEffect } from 'react';
import { getStockItems, assignLogisticsItem } from '../services/api.service';
import { useTableControls } from '../hooks/useTableControls';

interface LogisticsItem {
  id: number;
  name: string;
  logistics_id: string;
  serial_number: string;
  location: string;
}

interface AssignFromLogisticsModalProps {
  systemId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignFromLogisticsModal({ systemId, onClose, onSuccess }: AssignFromLogisticsModalProps) {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
  } = useTableControls({
    data: items,
    filterFn: (item, term) => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.logistics_id.toLowerCase().includes(term.toLowerCase()) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(term.toLowerCase()))
  });

  useEffect(() => {
    getStockItems()
      .then(res => setItems(res.data))
      .catch(() => setError('A logisztikai készlet betöltése sikertelen.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAssign = async (itemId: number) => {
    if (!window.confirm('Biztosan hozzárendeli ezt az eszközt a rendszerhez? Ezzel a tétel kiadásra kerül a raktárról.')) return;

    try {
      await assignLogisticsItem(itemId, systemId);
      onSuccess();
    } catch (err) {
      alert('A hozzárendelés sikertelen.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '80vw' }}>
        <h3>Hardver Hozzárendelése Logisztikai Készletről</h3>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>X</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
          <input
            type="text"
            placeholder="Keresés (név, HETK kód, S/N)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '300px' }}
          />
          <div>
            <label>Elemek/oldal: </label>
            <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        {loading && <p>Betöltés...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="table-container">
          <table className="personel-table">
            <thead>
              <tr>
                <th>Megnevezés</th>
                <th>HETK Kód</th>
                <th>Gyári szám</th>
                <th>Leltárhely</th>
                <th>Művelet</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.logistics_id}</td>
                  <td>{item.serial_number || '-'}</td>
                  <td>{item.location}</td>
                  <td>
                    <button onClick={() => handleAssign(item.id)}>Hozzárendel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Előző</button>
          <span style={{ margin: '0 1rem' }}>Oldal: {currentPage} / {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Következő</button>
        </div>
      </div>
    </div>
  );
}