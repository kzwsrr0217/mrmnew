// mrmnew/frontend/src/hooks/useTableControls.ts

import { useState, useMemo } from 'react';

// Új típus a rendezési konfigurációnak
type SortDirection = 'ascending' | 'descending';
interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

interface UseTableControlsProps<T> {
  data: T[];
  filterFn: (item: T, searchTerm: string) => boolean;
  initialItemsPerPage?: number;
}

export function useTableControls<T>({
  data,
  filterFn,
  initialItemsPerPage = 10,
}: UseTableControlsProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  // --- ÚJ RENDEZÉSI ÁLLAPOT ---
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);

  // A szűrt ÉS RENDEZETT adatok
  const sortedAndFilteredData = useMemo(() => {
    let processableData = [...data];

    // 1. RENDEZÉS
    if (sortConfig !== null) {
      processableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Dátumok, számok és szövegek kezelése
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    // 2. SZŰRÉS
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

  // --- ÚJ FÜGGVÉNY A RENDEZÉS KEZELÉSÉHEZ ---
  const requestSort = (key: keyof T) => {
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
    requestSort, // <-- ÚJ
    sortConfig,  // <-- ÚJ
  };
}