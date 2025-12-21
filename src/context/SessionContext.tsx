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
  const [role, setRole] = useState<Role>('loading');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as Role;
      if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
        setRole(storedRole);
      } else {
        setRole('unauthenticated');
      }
    } catch (error) {
      // Si localStorage no está disponible (p. ej., en SSR), 
      // se mantiene en 'unauthenticated' o 'loading'.
      setRole('unauthenticated');
    }
  }, []);

  useEffect(() => {
    // Si no está autenticado y no está en la página de inicio, redirige al inicio.
    if (role === 'unauthenticated' && pathname !== '/') {
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
      setRole(newRole);
    }
  };

  const value = { role, setRole: handleSetRole as (role: Role) => void };
  
  // Muestra un loader genérico si la sesión aún se está cargando en cualquier página protegida.
  if (role === 'loading' && pathname !== '/') {
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
