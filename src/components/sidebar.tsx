'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Scale, Home, Wrench, Settings, ClipboardList, Users, BookText, LogOut, FolderKanban, CreditCard, FileText, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/context/SessionContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard de Riesgo', icon: Home, roles: ['Clinico', 'Orientador'] },
  { href: '/orientacion', label: 'Panel de Orientacion', icon: BookText, roles: ['Orientador'] },
  { href: '/educativa/evaluacion', label: 'Evaluacion Educativa', icon: BookText, roles: ['Orientador', 'Clinico'] },
  { href: '/screening', label: 'Gestion de Pruebas', icon: ClipboardList, roles: ['Clinico'] },
  { href: '/admin/expedientes', label: 'Expedientes', icon: FileText, roles: ['Clinico', 'Orientador'] },
  { href: '/admin/matriculas', label: 'Matriculas', icon: CreditCard, roles: ['Clinico', 'Orientador'] },
  { href: '/tools', label: 'Repositorio de Recursos', icon: FolderKanban, roles: ['Clinico', 'Orientador'] },
  { href: '/admin', label: 'Administracion', icon: Settings, roles: ['Clinico'] },
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
          <SelectItem value="Clinico">Rol: Clinico (Total)</SelectItem>
          <SelectItem value="Orientador">Rol: Orientador (Restringido)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useSession();
  
  const mountedState = useState(false);
  const mounted = mountedState[0];
  const setMounted = mountedState[1];

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  if (!mounted) {
    return (
      <aside className="w-64 h-screen bg-white shadow-md flex flex-col sticky top-0">
        <div className="flex items-center justify-center h-full">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </aside>
    );
  }

  if (role === 'loading' || role === 'unauthenticated') {
      return null;
  }
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(role as string));

  const handleLogout = () => {
    setRole('unauthenticated');
    router.push('/');
  }

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col sticky top-0">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-gray-800">PIGEC-130</h1>
            <p className="text-xs text-gray-500">Suite Integral</p>
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
        <RoleSwitcher />
        <Button variant="ghost" className="w-full justify-start text-gray-600" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5"/>
            Cerrar Sesion
        </Button>
      </div>
    </aside>
  );
}
