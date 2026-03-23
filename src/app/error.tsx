'use client'; // Los componentes de error deben ser componentes de cliente

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Copy, CheckCircle, Terminal } from 'lucide-react';
import { useState } from 'react';

// Función para guardar error en localStorage
function saveErrorToLocalStorage(error: Error & { digest?: string }) {
  if (typeof window === 'undefined') return;
  
  try {
    const errorLog = {
      id: `error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'error' as const,
      source: 'application',
      message: error.message || 'Error desconocido',
      stack: error.stack,
      digest: error.digest,
      url: window.location.href,
      userAgent: navigator.userAgent,
      resolved: false
    };
    
    // Obtener errores existentes
    const existing = localStorage.getItem('pigec_error_logs');
    let errors = existing ? JSON.parse(existing) : [];
    
    // Agregar nuevo error al inicio
    errors = [errorLog, ...errors].slice(0, 50); // Mantener solo los últimos 50
    
    localStorage.setItem('pigec_error_logs', JSON.stringify(errors));
    console.log('[PIGEC] Error guardado en consola local:', errorLog.id);
  } catch (e) {
    console.error('[PIGEC] Error guardando en localStorage:', e);
  }
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Guardar error en localStorage para la consola
    saveErrorToLocalStorage(error);
    
    // Registrar el error en consola del navegador
    console.error('=== ERROR EN APLICACIÓN PIGEC-130 ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Digest:', error.digest);
    console.error('Full Error:', error);
  }, [error]);

  const copyErrorDetails = () => {
    const errorDetails = `
ERROR PIGEC-130
==============
Mensaje: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack:
${error.stack || 'No disponible'}
Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
    `.trim();
    
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determinar tipo de error para mostrar icono apropiado
  const isErrorCritical = error.message?.toLowerCase().includes('critical') || 
                          error.message?.toLowerCase().includes('fatal');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-red-200">
        <div className="flex flex-col items-center">
          {/* Icono de error */}
          <div className={`p-4 rounded-full mb-4 ${isErrorCritical ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`h-12 w-12 ${isErrorCritical ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Ocurrió un Error Inesperado
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Algo no funcionó como se esperaba. Use el botón "Copiar Error" para obtener los detalles.
          </p>
        </div>
        
        {/* Detalles del error */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-red-600" />
            <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Mensaje de Error:</p>
          </div>
          <p className="text-sm text-red-800 font-mono break-all bg-white p-3 rounded-lg border border-red-100">
            {error.message || 'Error desconocido'}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-2 font-mono">
              ID de error: {error.digest}
            </p>
          )}
        </div>

        {/* Stack trace colapsable */}
        {error.stack && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <span className="font-medium">Ver stack trace completo</span>
            </summary>
            <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs font-mono max-h-40">
              {error.stack}
            </pre>
          </details>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={copyErrorDetails}
            variant="outline"
            className="flex items-center justify-center gap-2 border-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Error
              </>
            )}
          </Button>
          <Button
            onClick={() => reset()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de Nuevo
          </Button>
        </div>
        
        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Este error ha sido registrado automáticamente. 
            Vaya a <strong>Administración → Consola de Errores</strong> para ver el historial.
          </p>
        </div>
      </div>
    </div>
  );
}
