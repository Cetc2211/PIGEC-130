'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Role = 'Clinico' | 'Orientador' | 'loading' | 'unauthenticated' | null;

interface SessionContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const roleState = useState<Role>('loading');
  const role = roleState[0];
  const setRole = roleState[1];
  
  const mountedState = useState(false);
  const mounted = mountedState[0];
  const setMounted = mountedState[1];
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
        setRole(storedRole);
      } else {
        setRole('unauthenticated');
      }
    } catch (error) {
      setRole('unauthenticated');
    }
  }, [setRole]);

  useEffect(() => {
    const isEvaluacionPage = pathname?.startsWith('/evaluacion');
    if (role === 'unauthenticated' && pathname !== '/' && !isEvaluacionPage) {
        router.replace('/');
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

  const isEvaluacionPage = pathname?.startsWith('/evaluacion');
  if (mounted && role === 'loading' && pathname !== '/' && !isEvaluacionPage) {
    return (
        <div className="flex h-screen w-full items-center justify-center p-8">
            <div className="flex items-center gap-2 text-xl text-gray-600">
                Cargando Sesion...
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
