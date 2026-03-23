import { SessionProvider } from "@/context/SessionContext";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
