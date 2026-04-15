'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { TEMPORARY_AUTH_BYPASS, TEMPORARY_ACCESS_ROLE } from '@/lib/auth-bypass';

type Role = 'Clinico' | 'Orientador' | 'loading' | 'unauthenticated' | null;

interface SessionContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('loading');
  const [firebaseUser, authLoading] = useAuthState(auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (TEMPORARY_AUTH_BYPASS) {
      try {
        const storedRole = localStorage.getItem('userRole') as Role;
        if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
          setRole(storedRole);
        } else {
          setRole(TEMPORARY_ACCESS_ROLE);
        }
      } catch {
        setRole(TEMPORARY_ACCESS_ROLE);
      }
      return;
    }

    if (authLoading) {
      setRole('loading');
      return;
    }

    if (!firebaseUser) {
      localStorage.removeItem('userRole');
      setRole('unauthenticated');
      return;
    }

    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
        setRole(storedRole);
      } else {
        // Si hay sesión Firebase pero no rol guardado, usar clínico por defecto.
        setRole('Clinico');
      }
    } catch {
      // If localStorage is not available (e.g., in SSR),
      // usar un rol por defecto cuando existe sesión Firebase.
      setRole('Clinico');
    }
  }, [authLoading, firebaseUser]);

  useEffect(() => {
    if (TEMPORARY_AUTH_BYPASS) {
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

  const value = { role, setRole: handleSetRole as (role: Role) => void };
  
  // Show a generic loader if the session is still loading on any protected page.
  // Skip for public routes (/, /evaluacion/*) so students can see the evaluation page
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/evaluacion/');
  if (role === 'loading' && !isPublicPage && !TEMPORARY_AUTH_BYPASS) {
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
