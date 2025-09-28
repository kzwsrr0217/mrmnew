// frontend/src/components/AddDocumentForm.tsx

import { useState, FormEvent } from 'react';
import { uploadDocument } from '../services/api.service';
import { DocumentType } from '../types'; // Ezt majd bővíteni kell

interface AddDocumentFormProps {
  systemId: number;
  onDocumentAdded: () => void;
  onCancel: () => void;
}

export function AddDocumentForm({ systemId, onDocumentAdded, onCancel }: AddDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocumentType>(DocumentType.EGYEB);
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file && (type === DocumentType.RENDSZERENGEDELY || type === DocumentType.UBSZ)) {
      setError('Ehhez a dokumentumtípushoz kötelező fájlt feltölteni.');
      return;
    }
    setError(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('system_id', String(systemId));
    formData.append('type', type);
    formData.append('registration_number', regNumber);

    try {
      await uploadDocument(formData);
      onDocumentAdded();
    } catch (err) {
      setError('Hiba a dokumentum feltöltése közben.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Új dokumentum feltöltése</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Típus:</label>
        <select value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
          {Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label>Nyilvántartási szám:</label>
        <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
      </div>
      <div>
        <label>Fájl (PDF):</label>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      </div>
      <button type="submit">Feltöltés</button>
      <button type="button" onClick={onCancel}>Mégse</button>
    </form>
  );
}