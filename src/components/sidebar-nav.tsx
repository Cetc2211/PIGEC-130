"use client";

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';
import { Home, Users, FileText, Settings, Import } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Panel', icon: Home },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/import', label: 'Importar Resultados', icon: Import },
  { href: '/reports', label: 'Informes', icon: FileText, disabled: true },
  { href: '/settings', label: 'Ajustes', icon: Settings, disabled: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
            disabled={item.disabled}
            aria-disabled={item.disabled}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
