'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TEMPORARY_AUTH_BYPASS } from '@/lib/auth-bypass';

type Role = 'Admin' | 'Clinico' | 'Orientador' | 'loading' | 'unauthenticated' | null;

type LocalSessionUser = {
  email: string;
  role: 'Admin';
  name: string;
};

const LOCAL_ADMIN_USER: LocalSessionUser = {
  email: 'mpcecil...@gmail.com',
  role: 'Admin',
  name: 'Administrador Local',
};

interface SessionContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: LocalSessionUser;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Admin');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Bypass local total: siempre iniciar como Admin local sin esperar Firebase.
    setRole('Admin');
    setLoading(false);

    try {
      localStorage.setItem('userRole', 'Admin');
      localStorage.setItem('localAdminEmail', LOCAL_ADMIN_USER.email);
    } catch {
      // No-op cuando localStorage no esta disponible.
    }
  }, []);

  useEffect(() => {
    if (TEMPORARY_AUTH_BYPASS || role === 'Admin') {
      return;
    }

    // Rutas públicas que NO requieren autenticación
    const isPublicRoute =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith('/evaluacion/');

    // If not authenticated and not on a public route, redirect to home.
    if (role === 'unauthenticated' && !isPublicRoute) {
        router.replace('/login');
    }
  }, [role, pathname, router]);

  const handleSetRole = (newRole: Role) => {
    if (newRole) {
      if(newRole !== 'unauthenticated' && newRole !== 'loading'){
        localStorage.setItem('userRole', newRole);
      } else {
        localStorage.removeItem('userRole');
      }
    }
    setRole(newRole);
  };

  const value = {
    role,
    setRole: handleSetRole as (role: Role) => void,
    user: LOCAL_ADMIN_USER,
    loading,
  };
  
  // Show a generic loader if the session is still loading on any protected page.
  // Skip for public routes (/, /evaluacion/*) so students can see the evaluation page
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/evaluacion/');
  if (loading && role === 'loading' && !isPublicPage && !TEMPORARY_AUTH_BYPASS) {
    return (
        <div className="flex h-screen w-full items-center justify-center p-8">
            <div className="flex items-center gap-2 text-xl text-gray-600">
                Cargando Sesión...
            </div>
        </div>
    );
  }
  
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
