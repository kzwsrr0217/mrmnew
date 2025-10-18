// mrmnew/frontend/src/components/AssignFromLogisticsModal.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getStockItems, assignLogisticsItem, getClassifications, getHardwareForSystem } from '../services/api.service';
import { useTableControls } from '../hooks/useTableControls';
import { HardwareType, WorkstationType, StorageType, TempestLevel, Hardware, Classification } from '../types';

// A logisztikai tétel interface-e
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
  
  // Új state-ek az űrlaphoz
  const [selectedItem, setSelectedItem] = useState<LogisticsItem | null>(null);
  const [formData, setFormData] = useState<any>({
    type: HardwareType.SZERVER,
    is_tempest: false,
    tempest_level: TempestLevel.A,
    workstation_type: WorkstationType.ASZTALI,
    storage_type: StorageType.SSD,
  });
  const [availableClassifications, setAvailableClassifications] = useState<Classification[]>([]);
  const [potentialParents, setPotentialParents] = useState<Hardware[]>([]);
  const [selectedClassificationIds, setSelectedClassificationIds] = useState<number[]>([]);

  const { paginatedData, totalPages, currentPage, setCurrentPage, itemsPerPage, handleItemsPerPageChange, searchTerm, handleSearchChange } = useTableControls({
    data: items,
    filterFn: (item, term) => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        (item.serial_number && item.serial_number.toLowerCase().includes(term.toLowerCase()))
  });

  // Adatok betöltése a listához és az űrlaphoz
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [stockRes, classRes, parentRes] = await Promise.all([
          getStockItems(),
          getClassifications(),
          getHardwareForSystem(systemId)
        ]);
        setItems(stockRes.data);
        setAvailableClassifications(classRes.data);
        setPotentialParents(parentRes.data.filter(hw => hw.type === HardwareType.SZERVER || hw.type === HardwareType.MUNKAALLOMAS));
      } catch {
        setError('A szükséges adatok betöltése sikertelen.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [systemId]);

  const handleSelectForAssignment = (item: LogisticsItem) => {
    setSelectedItem(item);
    // Űrlap feltöltése alapértelmezett és logisztikai adatokkal
    setFormData({
      ...formData,
      model_name: item.name,
      serial_number: item.serial_number || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };

  const handleClassificationChange = (id: number) => {
    setSelectedClassificationIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedItem) return;

    const payload = {
        ...formData,
        itemId: selectedItem.id,
        systemId: systemId,
        storage_size_gb: formData.storage_size_gb ? parseInt(formData.storage_size_gb, 10) : null,
        parent_hardware_id: formData.parent_hardware_id ? parseInt(formData.parent_hardware_id, 10) : null,
        classification_ids: selectedClassificationIds,
    };

    try {
        await assignLogisticsItem(payload);
        onSuccess();
    } catch (err: any) {
        const errorMessage = Array.isArray(err.response?.data?.message)
        ? err.response.data.message.join(', ')
        : err.response?.data?.message || 'Hiba a hozzárendelés közben.';
      setError(errorMessage);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal large">
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>&times;</button>
        
        {selectedItem ? (
          // --- RÉSZLETES ŰRLAP NÉZET ---
          <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '1rem' }}>
             <h4>{selectedItem.name} hozzárendelése</h4>
             <p>Kérjük, adja meg a létrehozandó hardver adatait.</p>
             {error && <p style={{ color: 'red' }}>{error}</p>}

             <div className="form-grid">
                <label>Típus:</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {Object.values(HardwareType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>

             <fieldset>
               <legend>Alapvető adatok</legend>
               <div className="form-grid">
                 <label>Gyártó:</label><input type="text" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} />
                 <label>Modell:</label><input type="text" name="model_name" value={formData.model_name || ''} onChange={handleChange} required />
                 <label>Sorozatszám:</label><input type="text" name="serial_number" value={formData.serial_number || ''} onChange={handleChange} required />
               </div>
               <label>Megjegyzés:</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} />
             </fieldset>

             <fieldset>
               <legend>TEMPEST Adatok</legend>
               <input type="checkbox" id="is-tempest-checkbox-assign" name="is_tempest" checked={formData.is_tempest} onChange={handleChange} />
               <label htmlFor="is-tempest-checkbox-assign">TEMPEST minősítésű</label>
               {formData.is_tempest && (
                 <div className="form-grid">
                   <label>Szint:</label><select name="tempest_level" value={formData.tempest_level} onChange={handleChange}>{Object.values(TempestLevel).map(t => <option key={t} value={t}>{t}</option>)}</select>
                   <label>Tan. szám:</label><input type="text" name="tempest_cert_number" value={formData.tempest_cert_number || ''} onChange={handleChange} required={formData.is_tempest} />
                 </div>
               )}
             </fieldset>

             {formData.type === HardwareType.MUNKAALLOMAS && (
                <fieldset><legend>Munkaállomás Adatok</legend><label>Jelleg:</label><select name="workstation_type" value={formData.workstation_type} onChange={handleChange}>{Object.values(WorkstationType).map(t => <option key={t} value={t}>{t}</option>)}</select></fieldset>
             )}

             {formData.type === HardwareType.ADATTAROLO && (
                <fieldset>
                  <legend>Adattároló Adatok</legend>
                  <div className="form-grid">
                    <label>Méret (GB):</label><input type="number" name="storage_size_gb" value={formData.storage_size_gb || ''} onChange={handleChange} />
                    <label>Technológia:</label><select name="storage_type" value={formData.storage_type} onChange={handleChange}>{Object.values(StorageType).map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                  <label>Szülő Eszköz:</label>
                  <select name="parent_hardware_id" value={formData.parent_hardware_id || ''} onChange={handleChange}>
                    <option value="">-- Önálló --</option>
                    {potentialParents.map(p => (<option key={p.hardware_id} value={p.hardware_id}>{p.model_name} (S/N: {p.serial_number})</option>))}
                  </select>
                </fieldset>
             )}

             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <button type="submit" style={{ flex: 1 }}>Hozzárendelés és Létrehozás</button>
               <button type="button" onClick={() => setSelectedItem(null)} style={{ flex: 1 }}>Vissza a listához</button>
             </div>
          </form>
        ) : (
          // --- KIVÁLASZTÓ LISTA NÉZET ---
          <>
            <h3>Hardver Hozzárendelése Logisztikai Készletről</h3>
            <input type="text" placeholder="Keresés..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} style={{ width: '300px', margin: '1rem 0' }}/>
            {loading && <p>Betöltés...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Megnevezés</th><th>Gyári szám</th><th>Művelet</th></tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.serial_number || '-'}</td>
                      <td><button onClick={() => handleSelectForAssignment(item)}>Hozzárendel</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* JAVÍTÁS: A lapozó vezérlők hozzáadva */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
              <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Előző</button>
              <span style={{ margin: '0 1rem' }}>Oldal: {currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Következő</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}