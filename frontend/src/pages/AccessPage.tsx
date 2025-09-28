// mrmnew/frontend/src/pages/AccessPage.tsx

import { useState, useEffect } from 'react';
import { getAccessList, revokeAccess } from '../services/api.service';
import { GrantAccessForm } from '../components/GrantAccessForm';
import { useTableControls } from '../hooks/useTableControls';

interface Access {
    access_id: number;
    personel: { nev: string };
    system: { systemname: string };
    access_level: string;
}

export function AccessPage() {
    const [accessList, setAccessList] = useState<Access[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGrantForm, setShowGrantForm] = useState(false);

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
        sortConfig
    } = useTableControls({
        data: accessList,
        filterFn: (access, term) => 
            access.personel.nev.toLowerCase().includes(term.toLowerCase()) ||
            access.system.systemname.toLowerCase().includes(term.toLowerCase()),
    });

    const fetchAccessList = () => {
        setLoading(true);
        getAccessList()
            .then(res => setAccessList(res.data))
            .catch(() => setError('A hozzáférések betöltése sikertelen.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAccessList(); }, []);

    const handleRevoke = async (accessId: number) => {
        if(window.confirm('Biztosan visszavonja ezt a hozzáférést?')) {
            try {
                await revokeAccess(accessId);
                fetchAccessList();
            } catch (err) {
                alert('A hozzáférés visszavonása sikertelen.');
            }
        }
    };

    const handleAccessGranted = () => {
        setShowGrantForm(false);
        fetchAccessList();
    }
    
    const getSortIcon = (key: keyof Access) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="sort-icon">↕️</span>;
        return sortConfig.direction === 'ascending' ? <span className="sort-icon">🔼</span> : <span className="sort-icon">🔽</span>;
    };

    if(loading) return <p>Hozzáférések betöltése...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Hozzáférés adatok</h1>
                <button onClick={() => setShowGrantForm(true)}>Új hozzáférés</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
                <input type="text" placeholder="Keresés személy vagy rendszer alapján..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} style={{ width: '300px' }}/>
                <div>
                    <label>Elemek/oldal: </label>
                    <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}>
                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="personel-table">
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => requestSort('personel')}>Személy {getSortIcon('personel')}</th>
                            <th className="sortable" onClick={() => requestSort('system')}>Rendszer {getSortIcon('system')}</th>
                            <th className="sortable" onClick={() => requestSort('access_level')}>Jogosultság {getSortIcon('access_level')}</th>
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(access => (
                            <tr key={access.access_id}>
                                <td>{access.personel.nev}</td>
                                <td>{access.system.systemname}</td>
                                <td>{access.access_level.toUpperCase()}</td>
                                <td>
                                    <button onClick={() => handleRevoke(access.access_id)} style={{color: 'red'}}>Visszavonás</button>
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

            {showGrantForm && (<GrantAccessForm onAccessGranted={handleAccessGranted} onCancel={() => setShowGrantForm(false)} />)}
        </div>
    );
}