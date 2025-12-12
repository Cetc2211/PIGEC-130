'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Home, Wrench, Settings, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard de Riesgo', icon: Home },
  { href: '/tools', label: 'Herramientas', icon: Wrench },
  { href: '/admin', label: 'Administración', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-800">Suite Integral</h1>
            <p className="text-xs text-gray-500">Soporte a la Decisión</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900',
              pathname === item.href ? 'bg-gray-100 text-gray-900 font-semibold' : ''
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        {/* TODO: Implementar autenticación y perfiles */}
        <p className="text-sm text-gray-500">Usuario: Admin</p>
      </div>
    </aside>
  );
}
