import { useMemo } from 'react';
import { getLocalSpecialistProfile, isLocalAdminEmail } from '@/lib/local-access';

type LocalAdminUser = {
  email: string;
  name: string;
};

export function useAdmin() {
  const profile = useMemo(() => getLocalSpecialistProfile(), []);

  const user: LocalAdminUser = {
    email: profile?.email || '',
    name: profile?.fullName || '',
  };

  return {
    isAdmin: isLocalAdminEmail(profile?.email),
    loading: false,
    user,
  };
}