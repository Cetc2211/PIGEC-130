'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Home, Wrench, Settings, ClipboardList, Users, BookText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/context/SessionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

const navItems = [
  { href: '/', label: 'Dashboard de Riesgo', icon: Home, roles: ['Clinico', 'Orientador'] },
  { href: '/screening', label: 'Módulo de Tamizaje', icon: ClipboardList, roles: ['Clinico'] },
  { href: '/educativa/evaluacion', label: 'Evaluación Educativa', icon: BookText, roles: ['Orientador', 'Clinico'] },
  { href: '/admin', label: 'Administración', icon: Settings, roles: ['Clinico'] },
  { href: '/tools', label: 'Herramientas', icon: Wrench, roles: ['Clinico', 'Orientador'] },
];

function RoleSwitcher() {
  const { role, setRole } = useSession();

  if (role === 'loading') {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="role-switcher" className="text-xs text-gray-500">Simular Rol de Usuario</Label>
      <Select value={role || ''} onValueChange={(value) => setRole(value as 'Orientador' | 'Clinico')}>
        <SelectTrigger id="role-switcher" className="w-full h-9 text-xs">
          <SelectValue placeholder="Seleccionar Rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Clinico">Rol: Clínico (Total)</SelectItem>
          <SelectItem value="Orientador">Rol: Orientador (Restringido)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useSession();

  if (role === 'loading') {
      return (
        <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4">
            <div className="text-sm text-gray-500">Cargando...</div>
        </aside>
      );
  }
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(role as string));

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
        {filteredNavItems.map((item) => (
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
      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-500" />
          <p className="text-sm font-semibold text-gray-700">Usuario: {role}</p>
        </div>
        <RoleSwitcher />
      </div>
    </aside>
  );
}
