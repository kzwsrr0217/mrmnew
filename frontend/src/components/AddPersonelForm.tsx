
// mrmnew/frontend/src/components/AddPersonelForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { createPersonel, getClassifications } from '../services/api.service';

interface Classification {
  id: number; // JAVÍTVA: classification_id -> id
  type: string;
  level_name: string;
}

interface AddPersonelFormProps {
  onPersonelAdded: () => void;
  onCancel: () => void;
}

export function AddPersonelForm({ onPersonelAdded, onCancel }: AddPersonelFormProps) {
  const [nev, setNev] = useState('');
  const [beosztas, setBeosztas] = useState('');
  const [rendfokozat, setRendfokozat] = useState('');
  const [titoktartasiSzam, setTitoktartasiSzam] = useState('');
  const [nemzetiId, setNemzetiId] = useState<string>('');
  const [natoId, setNatoId] = useState<string>('');
  const [euId, setEuId] = useState<string>('');
  const [szbtDatum, setSzbtDatum] = useState('');
  const [szbtLejarat, setSzbtLejarat] = useState('');
  const [natoDatum, setNatoDatum] = useState('');
  const [natoLejarat, setNatoLejarat] = useState('');
  const [euDatum, setEuDatum] = useState('');
  const [euLejarat, setEuLejarat] = useState('');

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
        szbt_datum: szbtDatum || null,
        szbt_lejarat: szbtLejarat || null,
        nato_datum: natoDatum || null,
        nato_lejarat: natoLejarat || null,
        eu_datum: euDatum || null,
        eu_lejarat: euLejarat || null,
      },
    };

    try {
      await createPersonel(payload);
      onPersonelAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt a személy létrehozása közben.');
    }
  };

 return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Új személy rögzítése</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <input type="text" value={nev} onChange={e => setNev(e.target.value)} placeholder="Név" required />
          <input type="text" value={rendfokozat} onChange={e => setRendfokozat(e.target.value)} placeholder="Rendfokozat" />
          <input type="text" value={beosztas} onChange={e => setBeosztas(e.target.value)} placeholder="Beosztás" />
          <input type="text" value={titoktartasiSzam} onChange={e => setTitoktartasiSzam(e.target.value)} placeholder="Titoktartási nyilatkozat száma" />

          <fieldset>
            <legend>Nemzeti minősítés</legend>
            <label>Szint:</label>
            <select value={nemzetiId} onChange={e => setNemzetiId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {/* JAVÍTVA: key={c.id} és value={c.id} */}
              {filterClassifications('NEMZETI').map(c => 
                <option key={c.id} value={c.id}>{c.level_name}</option>
              )}
            </select>
            <label>Tanúsítvány dátuma:</label>
            <input type="date" value={szbtDatum} onChange={e => setSzbtDatum(e.target.value)} />
            <label>Tanúsítvány lejárata:</label>
            <input type="date" value={szbtLejarat} onChange={e => setSzbtLejarat(e.target.value)} />
          </fieldset>


          <fieldset>
            <legend>NATO minősítés</legend>
            <label>Szint:</label>
            <select value={natoId} onChange={e => setNatoId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {filterClassifications('NATO').map(c => 
                <option key={c.id} value={c.id}>{c.level_name}</option>
              )}
            </select>
            <label>Tanúsítvány dátuma:</label>
            <input type="date" value={natoDatum} onChange={e => setNatoDatum(e.target.value)} />
            <label>Tanúsítvány lejárata:</label>
            <input type="date" value={natoLejarat} onChange={e => setNatoLejarat(e.target.value)} />
          </fieldset>

          <fieldset>
            <legend>EU minősítés</legend>
            <label>Szint:</label>
            <select value={euId} onChange={e => setEuId(e.target.value)}>
              <option value="">-- Nincs --</option>
              {filterClassifications('EU').map(c => 
                <option key={c.classification_id} value={c.classification_id}>{c.level_name}</option>
              )}
            </select>
            <label>Tanúsítvány dátuma:</label>
            <input type="date" value={euDatum} onChange={e => setEuDatum(e.target.value)} />
            <label>Tanúsítvány lejárata:</label>
            <input type="date" value={euLejarat} onChange={e => setEuLejarat(e.target.value)} />
          </fieldset>
          
          <button type="submit">Létrehozás</button>
          <button type="button" onClick={onCancel}>Mégse</button>
        </form>
      </div>
    </div>
  );
}