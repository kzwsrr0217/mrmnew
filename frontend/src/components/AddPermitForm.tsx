// mrmnew/frontend/src/components/AddPermitForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { createSystemPermit, updateSystemPermit, getClassifications } from '../services/api.service';
import { Modal } from './Modal';

// Típusdefiníciók frissítve az 'id'-re
interface Permit {
  permit_id: number;
  engedely_szam: string;
  kerelem_szam: string;
  kiallitas_datuma: string;
  ervenyesseg_datuma: string;
  nemzeti_classification?: { id: number };
  nato_classification?: { id: number };
  eu_classification?: { id: number };
}

interface Classification {
  id: number;
  type: string;
  level_name: string;
}

interface AddPermitFormProps {
  systemId: number;
  permit?: Permit | null;
  onPermitChange: () => void;
  onCancel: () => void;
}

export function AddPermitForm({ systemId, permit, onPermitChange, onCancel }: AddPermitFormProps) {
  const [engedelySzam, setEngedelySzam] = useState('');
  const [kerelemSzam, setKerelemSzam] = useState('');
  const [kiallitasDatuma, setKiallitasDatuma] = useState('');
  const [ervenyessegDatuma, setErvenyessegDatuma] = useState('');
  const [nemzetiId, setNemzetiId] = useState<string>('');
  const [natoId, setNatoId] = useState<string>('');
  const [euId, setEuId] = useState<string>('');

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!permit;

  useEffect(() => {
    getClassifications()
      .then(res => setClassifications(res.data))
      .catch(() => setError('A minősítések betöltése sikertelen.'));

    if (isEditMode && permit) {
      setEngedelySzam(permit.engedely_szam || '');
      setKerelemSzam(permit.kerelem_szam || '');
      // A bejövő dátumot YYYY-MM-DD formátumra alakítjuk az input mező számára
      setKiallitasDatuma(permit.kiallitas_datuma ? permit.kiallitas_datuma.split('T')[0] : '');
      setErvenyessegDatuma(permit.ervenyesseg_datuma ? permit.ervenyesseg_datuma.split('T')[0] : '');
      setNemzetiId(String(permit.nemzeti_classification?.id || ''));
      setNatoId(String(permit.nato_classification?.id || ''));
      setEuId(String(permit.eu_classification?.id || ''));
    }
  }, [permit, isEditMode]);
  
  const filterClassifications = (type: string) => classifications.filter(c => c.type === type);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    // A backend a dátumot egyszerű 'YYYY-MM-DD' stringként várja.
    const payload = {
      system_id: systemId,
      engedely_szam: engedelySzam,
      kerelem_szam: kerelemSzam,
      kiallitas_datuma: kiallitasDatuma, // A stringet küldjük, nem Date objektumot
      ervenyesseg_datuma: ervenyessegDatuma, // A stringet küldjük, nem Date objektumot
      nemzeti_classification_id: nemzetiId ? Number(nemzetiId) : null,
      nato_classification_id: natoId ? Number(natoId) : null,
      eu_classification_id: euId ? Number(euId) : null,
    };
    // A null értékeket töröljük a tisztább API hívás érdekében
    Object.keys(payload).forEach(key => (payload[key] === null) && delete payload[key]);

    try {
      if (isEditMode && permit) {
        await updateSystemPermit(permit.permit_id, payload);
      } else {
        await createSystemPermit(payload);
      }
      onPermitChange(); // Sikeres mentés után frissítjük a szülő komponenst
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt az engedély mentése közben.');
    }
  };
  
  return (
    <Modal title={isEditMode ? 'Engedély módosítása' : 'Új engedély rögzítése'} onClose={onCancel}>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label>Engedély száma:</label>
          <input type="text" value={engedelySzam} onChange={e => setEngedelySzam(e.target.value)} required />
        </div>
        <div>
          <label>Kérelem száma:</label>
          <input type="text" value={kerelemSzam} onChange={e => setKerelemSzam(e.target.value)} />
        </div>
        <div>
          <label>Kiállítás dátuma:</label>
          <input type="date" value={kiallitasDatuma} onChange={e => setKiallitasDatuma(e.target.value)} required />
        </div>
          <div>
          <label>Érvényesség dátuma:</label>
          <input type="date" value={ervenyessegDatuma} onChange={e => setErvenyessegDatuma(e.target.value)} required />
        </div>

        <fieldset>
          <legend>Minősítések</legend>
          <div>
            <label>Nemzeti:</label>
            <select value={nemzetiId} onChange={e => setNemzetiId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {/* JAVÍTVA: A key és a value is a helyes 'id'-t használja */}
              {filterClassifications('NEMZETI').map(c => 
                <option key={c.id} value={c.id}>{c.level_name}</option>
              )}
            </select>
          </div>
          <div>
            <label>NATO:</label>
            <select value={natoId} onChange={e => setNatoId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {filterClassifications('NATO').map(c => 
                <option key={c.id} value={c.id}>{c.level_name}</option>
              )}
            </select>
          </div>
          <div>
            <label>EU:</label>
            <select value={euId} onChange={e => setEuId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {filterClassifications('EU').map(c => 
                <option key={c.id} value={c.id}>{c.level_name}</option>
              )}
            </select>
          </div>
        </fieldset>

        <div className="form-actions">
            <button type="button" onClick={onCancel}>Mégse</button>
            <button type="submit">{isEditMode ? 'Módosítás' : 'Hozzáadás'}</button>
        </div>
      </form>
    </Modal>
  );
}