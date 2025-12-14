'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Role = 'Clinico' | 'Orientador' | 'loading' | 'unauthenticated' | null;

interface SessionContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('loading');

  // Simula la carga inicial del rol desde localStorage al montar la app
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as Role;
    if (storedRole && (storedRole === 'Clinico' || storedRole === 'Orientador')) {
      setRole(storedRole);
    } else {
      // Si no hay rol guardado, o no es válido, se puede establecer uno por defecto.
      // Aquí, para la simulación, dejaremos que el usuario elija con el switcher.
      // En una app real, podría ser 'unauthenticated'.
      // Por defecto, lo iniciamos como 'Clinico' para la demo.
      const defaultRole = 'Clinico';
      setRole(defaultRole);
      localStorage.setItem('userRole', defaultRole);
    }
  }, []);

  const handleSetRole = (newRole: Role) => {
    if (newRole) {
      localStorage.setItem('userRole', newRole);
      setRole(newRole);
    }
  };

  const value = { role, setRole: handleSetRole as (role: Role) => void };

  return (
    <SessionContext.Provider value={value}>
      {role === 'loading' ? <div className="flex h-screen w-full items-center justify-center"><p>Cargando Sesión...</p></div> : children}
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
