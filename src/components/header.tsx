import { Scale } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">Suite Integral</h1>
              <p className="text-sm text-gray-500">Sistema de Soporte a la Decisión | MTSS-CBTA 130</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* TODO: Implementar autenticación y perfiles */}
            <Button variant="outline">Admin</Button>
            <Button variant="ghost">Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
