"use client";

import { useSidebar } from "./ui/sidebar";
import { SidebarTrigger } from "./ui/sidebar";

export function SidebarTriggerButton() {
  const { isMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return <SidebarTrigger className="md:hidden" />;
}
