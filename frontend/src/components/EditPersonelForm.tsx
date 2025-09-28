// frontend/src/components/EditPersonelForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { updatePersonel, getClassifications } from '../services/api.service';

interface Personel {
  personel_id: number;
  nev: string;
  personal_security_data: {
    beosztas: string | null;
    rendfokozat: string | null;
    titoktartasi_szam: string | null;
    szbt_datum: Date | null;
    szbt_lejarat: Date | null;
    eu_datum: Date | null;
    eu_lejarat: Date | null;
    nemzeti_szint: { classification_id: number } | null;
    nato_szint: { classification_id: number } | null;
    eu_szint: { classification_id: number } | null;
  };
}

interface Classification {
  classification_id: number;
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
  const [nemzetiId, setNemzetiId] = useState<string>(String(personel.personal_security_data?.nemzeti_szint?.classification_id || ''));
  const [natoId, setNatoId] = useState<string>(String(personel.personal_security_data?.nato_szint?.classification_id || ''));
  const [euId, setEuId] = useState<string>(String(personel.personal_security_data?.eu_szint?.classification_id || ''));
  const [szbtDatum, setSzbtDatum] = useState(personel.personal_security_data?.szbt_datum ? new Date(personel.personal_security_data.szbt_datum).toISOString().split('T')[0] : '');
  const [szbtLejarat, setSzbtLejarat] = useState(personel.personal_security_data?.szbt_lejarat ? new Date(personel.personal_security_data.szbt_lejarat).toISOString().split('T')[0] : '');
  const [euDatum, setEuDatum] = useState(personel.personal_security_data?.eu_datum ? new Date(personel.personal_security_data.eu_datum).toISOString().split('T')[0] : '');
  const [euLejarat, setEuLejarat] = useState(personel.personal_security_data?.eu_lejarat ? new Date(personel.personal_security_data.eu_lejarat).toISOString().split('T')[0] : '');

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
        szbt_datum: szbtDatum ? new Date(szbtDatum) : null,
        szbt_lejarat: szbtLejarat ? new Date(szbtLejarat) : null,
        eu_datum: euDatum ? new Date(euDatum) : null,
        eu_lejarat: euLejarat ? new Date(euLejarat) : null,
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
            {/* A select mezők ugyanazok, mint az AddPersonelForm-ban */}
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