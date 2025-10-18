// mrmnew/frontend/src/components/AddHardwareForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { createHardware, updateHardware, getClassifications, getHardwareForSystem } from '../services/api.service';
import { HardwareType, WorkstationType, StorageType, TempestLevel, Hardware, Location, Classification } from '../types';

interface AddHardwareFormProps {
  systemId: number;
  hardwareToEdit: Hardware | null;
  locations: Location[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddHardwareForm({ systemId, hardwareToEdit, locations, onSuccess, onCancel }: AddHardwareFormProps) {
  const [formData, setFormData] = useState({
    type: HardwareType.SZERVER,
    model_name: '',
    serial_number: '',
    manufacturer: '',
    notes: '',
    is_tempest: false,
    tempest_level: TempestLevel.A,
    tempest_cert_number: '',
    tempest_number: '',
    workstation_type: WorkstationType.ASZTALI,
    inventory_number: '',
    storage_size_gb: '',
    storage_type: StorageType.SSD,
    parent_hardware_id: '',
    locationId: '',
  });
  const [selectedClassificationIds, setSelectedClassificationIds] = useState<number[]>([]);
  const [availableClassifications, setAvailableClassifications] = useState<Classification[]>([]);
  const [potentialParents, setPotentialParents] = useState<Hardware[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [classRes, parentRes] = await Promise.all([
          getClassifications(),
          getHardwareForSystem(systemId)
        ]);
        setAvailableClassifications(classRes.data);
        const parentCandidates = parentRes.data.filter(hw => 
          hw.type === HardwareType.SZERVER || hw.type === HardwareType.MUNKAALLOMAS
        );
        setPotentialParents(parentCandidates);

        if (hardwareToEdit) {
          setFormData({
            type: hardwareToEdit.type,
            model_name: hardwareToEdit.model_name || '',
            serial_number: hardwareToEdit.serial_number || '',
            manufacturer: hardwareToEdit.manufacturer || '',
            notes: hardwareToEdit.notes || '',
            is_tempest: hardwareToEdit.is_tempest || false,
            tempest_level: hardwareToEdit.tempest_level || TempestLevel.A,
            tempest_cert_number: hardwareToEdit.tempest_cert_number || '',
            tempest_number: hardwareToEdit.tempest_number || '',
            workstation_type: hardwareToEdit.workstation_type || WorkstationType.ASZTALI,
            inventory_number: hardwareToEdit.inventory_number || '',
            storage_size_gb: hardwareToEdit.storage_size_gb?.toString() || '',
            storage_type: hardwareToEdit.storage_type || StorageType.SSD,
            parent_hardware_id: hardwareToEdit.parent_hardware_id?.toString() || '',
            locationId: hardwareToEdit.location?.id.toString() || '',
          });
          setSelectedClassificationIds(hardwareToEdit.classifications?.map(c => c.id) || []);
        }

      } catch (err) {
        setError('Az űrlaphoz szükséges adatok betöltése sikertelen.');
      }
    };
    loadDependencies();
  }, [systemId, hardwareToEdit]);

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
    setError(null);

    const payload = {
      ...formData,
      system_id: systemId,
      location: formData.locationId ? Number(formData.locationId) : null,
      storage_size_gb: formData.storage_size_gb ? parseInt(formData.storage_size_gb, 10) : null,
      parent_hardware_id: formData.parent_hardware_id ? parseInt(formData.parent_hardware_id, 10) : null,
      classification_ids: selectedClassificationIds,
    };
    delete (payload as any).locationId; // Tisztítás

    try {
      if (hardwareToEdit) {
        await updateHardware(hardwareToEdit.hardware_id, payload);
      } else {
        await createHardware(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(`Mentés sikertelen: ${err.response?.data?.message || 'Ellenőrizze az adatokat!'}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal large">
        <form onSubmit={handleSubmit}>
          <h4>{hardwareToEdit ? 'Hardver szerkesztése' : 'Új hardver rögzítése'}</h4>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div className="form-grid">
            <label>Telepítési hely:</label>
            <select name="locationId" value={formData.locationId} onChange={handleChange}>
              <option value="">-- Nincs kiválasztva --</option>
              {locations.map(loc => (<option key={loc.id} value={loc.id}>{loc.full_address}</option>))}
            </select>
            <label>Típus:</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              {Object.values(HardwareType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <fieldset>
            <legend>Alapvető adatok</legend>
            <div className="form-grid">
              <label>Gyártó:</label><input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
              <label>Modell:</label><input type="text" name="model_name" value={formData.model_name} onChange={handleChange} required />
              <label>Sorozatszám:</label><input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} required />
            </div>
            <label>Megjegyzés:</label><textarea name="notes" value={formData.notes} onChange={handleChange} />
          </fieldset>
          
          <fieldset>
            <legend>Minősítések:</legend>
            <div className="checkbox-group">
            {availableClassifications.map(c => (
              <div key={c.id}>
                <input type="checkbox" id={`class-checkbox-${c.id}`} checked={selectedClassificationIds.includes(c.id)} onChange={() => handleClassificationChange(c.id)} />
                <label htmlFor={`class-checkbox-${c.id}`}>{`${c.type} - ${c.level_name}`}</label>
              </div>
            ))}
            </div>
          </fieldset>
          
          <fieldset>
            <legend>TEMPEST Adatok</legend>
            <div>
              <input type="checkbox" id="is-tempest-checkbox" name="is_tempest" checked={formData.is_tempest} onChange={handleChange} />
              <label htmlFor="is-tempest-checkbox">Az eszköz TEMPEST minősítésű</label>
            </div>
            {formData.is_tempest && (
              <div className="form-grid">
                <label>TEMPEST Szint:</label><select name="tempest_level" value={formData.tempest_level} onChange={handleChange}>{Object.values(TempestLevel).map(t => <option key={t} value={t}>{t}</option>)}</select>
                <label>TEMPEST Tanúsítványszám:</label><input type="text" name="tempest_cert_number" value={formData.tempest_cert_number} onChange={handleChange} required={formData.is_tempest} />
                <label>TEMPEST Szám:</label><input type="text" name="tempest_number" value={formData.tempest_number} onChange={handleChange} />
              </div>
            )}
          </fieldset>
          
          {/* A többi fieldset... */}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ flex: 1 }}>Mentés</button>
            <button type="button" onClick={onCancel} style={{ flex: 1 }}>Mégse</button>
          </div>
        </form>
      </div>
    </div>
  );
}