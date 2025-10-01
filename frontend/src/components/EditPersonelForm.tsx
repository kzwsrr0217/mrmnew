// mrmnew/frontend/src/components/EditPersonelForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { updatePersonel, getClassifications } from '../services/api.service';

// Típusok frissítve a helyes 'id'-re
interface Personel {
  personel_id: number;
  nev: string;
  personal_security_data: {
    beosztas: string | null;
    rendfokozat: string | null;
    titoktartasi_szam: string | null;
    szbt_datum: Date | null;
    szbt_lejarat: Date | null;
    nato_datum: Date | null;
    nato_lejarat: Date | null;
    eu_datum: Date | null;
    eu_lejarat: Date | null;
    nemzeti_szint: { id: number } | null;
    nato_szint: { id: number } | null;
    eu_szint: { id: number } | null;
  };
}

interface Classification {
  id: number;
  type: string;
  level_name: string;
}

interface EditPersonelFormProps {
  personel: Personel;
  onPersonelUpdated: () => void;
  onCancel: () => void;
}

export function EditPersonelForm({ personel, onPersonelUpdated, onCancel }: EditPersonelFormProps) {
  const [nev, setNev] = useState(personel.nev);
  const [beosztas, setBeosztas] = useState(personel.personal_security_data?.beosztas || '');
  const [rendfokozat, setRendfokozat] = useState(personel.personal_security_data?.rendfokozat || '');
  const [titoktartasiSzam, setTitoktartasiSzam] = useState(personel.personal_security_data?.titoktartasi_szam || '');
  
  const formatDateForInput = (date: Date | null) => date ? new Date(date).toISOString().split('T')[0] : '';
  const [szbtDatum, setSzbtDatum] = useState(formatDateForInput(personel.personal_security_data?.szbt_datum));
  const [szbtLejarat, setSzbtLejarat] = useState(formatDateForInput(personel.personal_security_data?.szbt_lejarat));
  const [natoDatum, setNatoDatum] = useState(formatDateForInput(personel.personal_security_data?.nato_datum));
  const [natoLejarat, setNatoLejarat] = useState(formatDateForInput(personel.personal_security_data?.nato_lejarat));
  const [euDatum, setEuDatum] = useState(formatDateForInput(personel.personal_security_data?.eu_datum));
  const [euLejarat, setEuLejarat] = useState(formatDateForInput(personel.personal_security_data?.eu_lejarat));

  const [nemzetiId, setNemzetiId] = useState<string>(String(personel.personal_security_data?.nemzeti_szint?.id || ''));
  const [natoId, setNatoId] = useState<string>(String(personel.personal_security_data?.nato_szint?.id || ''));
  const [euId, setEuId] = useState<string>(String(personel.personal_security_data?.eu_szint?.id || ''));

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClassifications()
      .then(res => setClassifications(res.data))
      .catch(() => setError('A minősítések betöltése sikertelen.'));
  }, []);

  const filterClassifications = (type: string) => classifications.filter(c => c.type === type);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const payload = {
      nev,
      personal_security_data: {
        beosztas,
        rendfokozat,
        titoktartasi_szam: titoktartasiSzam,
        nemzeti_szint_id: nemzetiId ? Number(nemzetiId) : null,
        nato_szint_id: natoId ? Number(natoId) : null,
        eu_szint_id: euId ? Number(euId) : null,
        // JAVÍTVA: A dátumokat stringként küldjük, ha ki vannak töltve
        szbt_datum: szbtDatum || null,
        szbt_lejarat: szbtLejarat || null,
        nato_datum: natoDatum || null,
        nato_lejarat: natoLejarat || null,
        eu_datum: euDatum || null,
        eu_lejarat: euLejarat || null,
      },
    };

    try {
      await updatePersonel(personel.personel_id, payload);
      onPersonelUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt a személy módosítása közben.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Személy adatainak szerkesztése</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <input type="text" value={nev} onChange={e => setNev(e.target.value)} placeholder="Név" required />
          <input type="text" value={rendfokozat} onChange={e => setRendfokozat(e.target.value)} placeholder="Rendfokozat" />
          <input type="text" value={beosztas} onChange={e => setBeosztas(e.target.value)} placeholder="Beosztás" />
          <input type="text" value={titoktartasiSzam} onChange={e => setTitoktartasiSzam(e.target.value)} placeholder="Titoktartási nyilatkozat száma" />

          <fieldset>
            <legend>Személyi biztonsági tanúsítványok</legend>
            <div>
              <label>Nemzeti:</label>
              <select value={nemzetiId} onChange={e => setNemzetiId(e.target.value)}>
                <option value="">-- Nincs --</option>
                {/* JAVÍTVA: A key és a value is a helyes 'id'-t használja */}
                {filterClassifications('NEMZETI').map(c => <option key={c.id} value={c.id}>{c.level_name}</option>)}
              </select>
            </div>
            <div>
              <label>Nemzeti tanúsítvány dátuma:</label>
              <input type="date" value={szbtDatum} onChange={e => setSzbtDatum(e.target.value)} />
            </div>
            <div>
              <label>Nemzeti tanúsítvány lejárata:</label>
              <input type="date" value={szbtLejarat} onChange={e => setSzbtLejarat(e.target.value)} />
            </div>
            <div>
              <label>NATO:</label>
              <select value={natoId} onChange={e => setNatoId(e.target.value)}>
                <option value="">-- Nincs --</option>
                {filterClassifications('NATO').map(c => <option key={c.id} value={c.id}>{c.level_name}</option>)}
              </select>
            </div>
             <div>
                <label>NATO tanúsítvány dátuma:</label>
                <input type="date" value={natoDatum} onChange={e => setNatoDatum(e.target.value)} />
            </div>
             <div>
                <label>NATO tanúsítvány lejárata:</label>
                <input type="date" value={natoLejarat} onChange={e => setNatoLejarat(e.target.value)} />
            </div>
            <div>
              <label>EU:</label>
              <select value={euId} onChange={e => setEuId(e.target.value)}>
                <option value="">-- Nincs --</option>
                {filterClassifications('EU').map(c => <option key={c.id} value={c.id}>{c.level_name}</option>)}
              </select>
            </div>
            <div>
              <label>EU tanúsítvány dátuma:</label>
              <input type="date" value={euDatum} onChange={e => setEuDatum(e.target.value)} />
            </div>
            <div>
              <label>EU tanúsítvány lejárata:</label>
              <input type="date" value={euLejarat} onChange={e => setEuLejarat(e.target.value)} />
            </div>
          </fieldset>
          
          <button type="submit">Módosítások mentése</button>
          <button type="button" onClick={onCancel}>Mégse</button>
        </form>
      </div>
    </div>
  );
}