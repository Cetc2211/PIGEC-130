'use client';

import dynamic from 'next/dynamic';

// Deshabilitar SSR completamente para evitar error de hidratacion
const ExpedienteContent = dynamic(
  () => import('./ExpedienteContent').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center p-8">
        <div className="flex items-center gap-2 text-xl text-gray-600">
          <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
          Cargando expediente...
        </div>
      </div>
    )
  }
);

export default function ClinicalFilePage() {
  return <ExpedienteContent />;
}
