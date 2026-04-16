type LocalAdminUser = {
  email: string;
};

const LOCAL_ADMIN_EMAIL = 'mpcecil...@gmail.com';

export function useAdmin() {
  const user: LocalAdminUser = { email: LOCAL_ADMIN_EMAIL };

  return {
    isAdmin: true,
    loading: false,
    user,
  };
}