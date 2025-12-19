'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

type Role = 'Clinico' | 'Orientador' | 'loading' | 'unauthenticated' | null;

interface SessionContextType {
  role: Role;
  setRole: (role: Role) => void;
  showSidebar: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('loading');
  const pathname = usePathname();

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role;
    if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
      setRole(storedRole);
    } else {
      setRole('unauthenticated');
    }
  }, []);

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

  const showSidebar = role !== 'unauthenticated' && role !== 'loading' && pathname !== '/';

  const value = { role, setRole: handleSetRole as (role: Role) => void, showSidebar };
  
  if (role === 'loading' && pathname !== '/') {
    return <div className="flex h-screen w-full items-center justify-center"><p>Cargando Sesión...</p></div>;
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
