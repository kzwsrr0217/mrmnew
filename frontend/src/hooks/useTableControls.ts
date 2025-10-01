// mrmnew/frontend/src/hooks/useTableControls.ts

import { useState, useMemo } from 'react';

type SortDirection = 'ascending' | 'descending';
interface SortConfig<T> {
  key: keyof T | string; // Engedélyezzük a stringet a beágyazott kulcsokhoz
  direction: SortDirection;
}

interface UseTableControlsProps<T> {
  data: T[];
  filterFn: (item: T, searchTerm: string) => boolean;
  initialItemsPerPage?: number;
}

// ÚJ: Segédfüggvény a beágyazott értékek kinyeréséhez
// Pl. getValue(obj, 'personel.nev') -> visszaadja az obj.personel.nev értékét
const getValueByPath = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};


export function useTableControls<T>({
  data,
  filterFn,
  initialItemsPerPage = 10,
}: UseTableControlsProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  const sortedAndFilteredData = useMemo(() => {
    let processableData = [...data];

    if (sortConfig !== null) {
      processableData.sort((a, b) => {
        // JAVÍTVA: A segédfüggvénnyel nyerjük ki az értékeket
        const aValue = getValueByPath(a, sortConfig.key as string);
        const bValue = getValueByPath(b, sortConfig.key as string);

        // Biztosítjuk, hogy a null/undefined értékek a végére kerüljenek
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        // Típus-specifikus összehasonlítás
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'ascending' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    if (searchTerm) {
      processableData = processableData.filter(item => filterFn(item, searchTerm));
    }
    
    return processableData;
  }, [data, searchTerm, filterFn, sortConfig]);


  const totalPages = useMemo(() => {
    return Math.ceil(sortedAndFilteredData.length / itemsPerPage);
  }, [sortedAndFilteredData, itemsPerPage]);


  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedAndFilteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Módosítva, hogy stringet is elfogadjon
  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
    requestSort,
    sortConfig,
  };
}