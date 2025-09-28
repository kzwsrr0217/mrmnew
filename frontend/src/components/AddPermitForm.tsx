// frontend/src/components/AddPermitForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { createSystemPermit, updateSystemPermit, getClassifications } from '../services/api.service';

// Típusdefiníciók
interface Permit {
  permit_id: number;
  engedely_szam: string;
  kerelem_szam: string;
  kiallitas_datuma: string;
  ervenyesseg_datuma: string;
  nemzeti_classification?: { classification_id: number };
  nato_classification?: { classification_id: number };
  eu_classification?: { classification_id: number };
}

interface Classification {
  classification_id: number;
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
  // Állapotváltozók az űrlap mezőihez
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

  // Adatok betöltése és űrlap feltöltése (ha szerkesztés van)
  useEffect(() => {
    getClassifications()
      .then(res => setClassifications(res.data))
      .catch(() => setError('A minősítések betöltése sikertelen.'));

    if (isEditMode && permit) {
      setEngedelySzam(permit.engedely_szam || '');
      setKerelemSzam(permit.kerelem_szam || '');
      setKiallitasDatuma(new Date(permit.kiallitas_datuma).toISOString().split('T')[0]);
      setErvenyessegDatuma(new Date(permit.ervenyesseg_datuma).toISOString().split('T')[0]);
      setNemzetiId(String(permit.nemzeti_classification?.classification_id || ''));
      setNatoId(String(permit.nato_classification?.classification_id || ''));
      setEuId(String(permit.eu_classification?.classification_id || ''));
    }
  }, [permit, isEditMode]);
  
  // A minősítések szűrése típus szerint
  const filterClassifications = (type: string) => classifications.filter(c => c.type === type);

  // Űrlap elküldése
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload = {
      system_id: systemId,
      engedely_szam: engedelySzam,
      kerelem_szam: kerelemSzam,
      kiallitas_datuma: new Date(kiallitasDatuma),
      ervenyesseg_datuma: new Date(ervenyessegDatuma),
      nemzeti_classification_id: nemzetiId ? Number(nemzetiId) : undefined,
      nato_classification_id: natoId ? Number(natoId) : undefined,
      eu_classification_id: euId ? Number(euId) : undefined,
    };

    try {
      if (isEditMode && permit) {
        await updateSystemPermit(permit.permit_id, payload);
      } else {
        await createSystemPermit(payload);
      }
      onPermitChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt az engedély mentése közben.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="add-permit-form">
      <h4>{isEditMode ? 'Engedély módosítása' : 'Új engedély rögzítése'}</h4>
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
            {filterClassifications('NEMZETI').map(c => 
              <option key={c.classification_id} value={c.classification_id}>{c.level_name}</option>
            )}
          </select>
        </div>
        <div>
          <label>NATO:</label>
          <select value={natoId} onChange={e => setNatoId(e.target.value)}>
            <option value="">-- Nincs --</option>
            {filterClassifications('NATO').map(c => 
              <option key={c.classification_id} value={c.classification_id}>{c.level_name}</option>
            )}
          </select>
        </div>
        <div>
          <label>EU:</label>
          <select value={euId} onChange={e => setEuId(e.target.value)}>
            <option value="">-- Nincs --</option>
            {filterClassifications('EU').map(c => 
              <option key={c.classification_id} value={c.classification_id}>{c.level_name}</option>
            )}
          </select>
        </div>
      </fieldset>

      <button type="submit">{isEditMode ? 'Módosítás' : 'Hozzáadás'}</button>
      <button type="button" onClick={onCancel}>Mégse</button>
    </form>
  );
}