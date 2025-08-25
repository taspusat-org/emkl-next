// hooks/usePermissions.ts
import { getPermissionFn } from '@/lib/apis/menu.api';
import { RootState } from '@/lib/store/store';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

interface Permission {
  subject: string;
  action: string;
}

const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useSelector((state: RootState) => state.auth);

  // Array untuk pengecualian, bisa berisi subject atau action
  const exclusionList: (string | string[])[] = [
    'SHOW' // Contoh pengecualian untuk subject
    // Tambahkan pengecualian lainnya sesuai kebutuhan
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      const res = await getPermissionFn(String(id));
      const data = res.abilities;

      if (data) {
        setPermissions(data);
      }

      setLoading(false);
    };

    fetchPermissions();
  }, [id]);

  // Fungsi untuk memeriksa apakah subject atau action ada di dalam pengecualian
  const isExcluded = (subject: string, action: string): boolean => {
    // Memeriksa jika subject atau action ada di dalam exclusionList
    return exclusionList.some((exclusion) => {
      if (Array.isArray(exclusion)) {
        return (
          exclusion[0]?.toUpperCase() === subject?.toUpperCase() &&
          exclusion[1]?.toUpperCase() === action?.toUpperCase()
        );
      }
      return (
        exclusion?.toUpperCase() === subject?.toUpperCase() ||
        exclusion?.toUpperCase() === action?.toUpperCase()
      );
    });
  };

  const hasPermission = (className: string, method: string): boolean => {
    // Memeriksa jika subject atau action ada di dalam pengecualian
    if (isExcluded(className, method)) {
      return true; // Jika ada dalam pengecualian, selalu true
    }

    // Jika tidak ada di pengecualian, lanjutkan memeriksa hak akses
    return permissions.some(
      (permission) =>
        permission.subject?.toUpperCase() === className?.toUpperCase() &&
        permission.action?.toUpperCase() === method?.toUpperCase()
    );
  };

  return { hasPermission, loading };
};

export default usePermissions;
