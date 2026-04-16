'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LockKeyhole, ShieldCheck, UserRound, KeyRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/app-logo';
import { useToast } from '@/hooks/use-toast';
import { USER_GEMINI_API_KEY_STORAGE_KEY } from '@/lib/ai-service';
import { getInstitutionalCode, getLocalSpecialistProfile, hasLocalAccessProfile, saveLocalSpecialistProfile } from '@/lib/local-access';
-'use client';
+
+import Image from 'next/image';
+import { ReactNode, useEffect, useState } from 'react';
+import { usePathname, useRouter } from 'next/navigation';
+import { LockKeyhole, ShieldCheck, UserRound, KeyRound } from 'lucide-react';
+import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { Button } from '@/components/ui/button';
+import { useToast } from '@/hooks/use-toast';
+import { saveLocalSpecialistProfile, hasLocalAccessProfile } from '@/lib/local-access';
+import { USER_GEMINI_API_KEY_STORAGE_KEY } from '@/lib/ai-service';

export function InstitutionalAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [institutionalCode, setInstitutionalCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [expectedCode, setExpectedCode] = useState('');

  const isEvaluationRoute = pathname.startsWith('/evaluacion/');

  // Initialize code and state from localStorage/env only on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const code =
      typeof process !== 'undefined' && process.env.NEXT_PUBLIC_INSTITUTIONAL_CODE
        ? process.env.NEXT_PUBLIC_INSTITUTIONAL_CODE
        : 'PIGEC-130-2026';
    setExpectedCode(code);

    const unlocked = hasLocalAccessProfile();
    if (unlocked) {
      try {
        const profileRaw = localStorage.getItem('pigec_local_specialist_profile');
        if (profileRaw) {
          const profile = JSON.parse(profileRaw);
          setFullName(profile.fullName || '');
          setEmail(profile.email || '');
          setApiKey(profile.apiKey || localStorage.getItem(USER_GEMINI_API_KEY_STORAGE_KEY) || '');
        }
      } catch {
        // silently ignore parse errors
      }
    }
    setIsUnlocked(unlocked);
    setReady(true);
  }, []);

  const handleUnlock = () => {
    setError('');

    if (institutionalCode.trim() !== expectedCode.trim()) {
      setError('Código Institucional Inválido');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setError('Ingresa nombre completo y correo electrónico.');
      return;
    }

    saveLocalSpecialistProfile({
      fullName,
      email,
      apiKey,
    });

    setIsUnlocked(true);
    toast({
      title: 'Acceso habilitado',
      description: 'Tu perfil local se guardó correctamente.',
    });

    router.replace('/dashboard');
  };

  if (!ready) {
    return <>{children}</>;
  }

  if (isEvaluationRoute || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-2xl border border-slate-200 shadow-2xl bg-white">
        <CardHeader className="space-y-6 text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.cbta130.png.png"
              alt="Logo CBTa 130"
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
              Bienvenido a la Plataforma del Protocolo de Intervención Psicopedagógica y Gestión del Entorno Comunitario del CBTa 130 (PIGEC-130)
            </CardTitle>
            <p className="text-base text-slate-600">
              Esta herramienta está diseñada para la gestión clínica y pedagógica, permitiendo la creación de expedientes, aplicación de evaluaciones y generación de informes diagnósticos mediante IA de manera local y segura.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutional-code" className="text-sm font-semibold text-slate-700">
                Código de Acceso Institucional
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="institutional-code"
                  type="password"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  placeholder="Ingresa el código"
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-full-name" className="text-sm font-semibold text-slate-700">
                Nombre Completo del Especialista
              </Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="specialist-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Dra. María Pérez"
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-email" className="text-sm font-semibold text-slate-700">
                Correo Electrónico
              </Label>
              <Input
                id="specialist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@institucion.mx"
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-api-key" className="text-sm font-semibold text-slate-700">
                API Key de Gemini (Opcional)
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="specialist-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Tu API Key personal (no se compartirá)"
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Si no la agregas, la app funcionará normalmente. Solo se deshabilitarán los botones que requieran generación de IA.
              </p>
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button
              className="w-full h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
              onClick={handleUnlock}
            >
              Configurar y Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InstitutionalAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [ready, setReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [institutionalCode, setInstitutionalCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const isEvaluationRoute = pathname.startsWith('/evaluacion/');
  const expectedCode = useMemo(() => getInstitutionalCode(), []);

  useEffect(() => {
    const profile = getLocalSpecialistProfile();
    const unlocked = hasLocalAccessProfile();

    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
      setApiKey(profile.apiKey || localStorage.getItem(USER_GEMINI_API_KEY_STORAGE_KEY) || '');
    }

    setIsUnlocked(unlocked);
    setReady(true);
  }, []);

  const handleUnlock = () => {
    setError('');

    if (institutionalCode.trim() !== expectedCode.trim()) {
      setError('Código Institucional Inválido');
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      setError('Ingresa nombre completo y correo electrónico.');
      return;
    }

    saveLocalSpecialistProfile({
      fullName,
      email,
      apiKey,
    });

    setIsUnlocked(true);
    toast({
      title: 'Acceso habilitado',
      description: 'Tu perfil local se guardó correctamente.',
    });

    router.replace('/dashboard');
  };

  if (!ready) {
    return <>{children}</>;
  }

  if (isEvaluationRoute || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#eef6ff,_#f8fafc_55%,_#e5eef8)] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-slate-200 shadow-xl bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <AppLogo name="PIGEC-130" logoUrl="" />
            <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
              Acceso Institucional
            </Badge>
          </div>
          <div>
            <CardTitle className="text-3xl flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-sky-700" />
              Bienvenida y Seguridad Institucional
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Ingresa el código institucional y registra tu perfil local. La API Key de Gemini es opcional.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutional-code">Código de Acceso Institucional</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="institutional-code"
                  value={institutionalCode}
                  onChange={(e) => setInstitutionalCode(e.target.value)}
                  className="pl-10"
                  placeholder="Ingresa el código"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-full-name">Nombre Completo del Especialista</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="specialist-full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  placeholder="Ej. Dra. María Pérez"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-email">Correo Electrónico</Label>
              <Input
                id="specialist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@institucion.mx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialist-api-key">API Key de Gemini (Opcional)</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="specialist-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10"
                  placeholder="Solo necesaria para generar informes con IA"
                />
              </div>
              <p className="text-xs text-slate-500">
                Si no la agregas, la app seguirá funcionando para pruebas, expedientes y captura local. Solo se deshabilitarán los botones de Generar Informe.
              </p>
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button className="w-full" onClick={handleUnlock}>
              Ingresar a la Plataforma
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Ventajas del acceso local institucional</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>El código institucional protege la entrada a la app.</li>
              <li>Tu identidad profesional se guarda localmente y se reutiliza en visitas futuras.</li>
              <li>Los datos permanecen en el navegador del especialista, reforzando la privacidad.</li>
              <li>La IA es opcional: puedes trabajar sin API Key y activar Gemini cuando lo necesites.</li>
            </ul>
            <div className="rounded-lg bg-white p-4 border border-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Código configurado</p>
              <p className="text-sm text-slate-700">
                Se valida con <strong>NEXT_PUBLIC_INSTITUTIONAL_CODE</strong> y usa <strong>PIGEC-130-2026</strong> como fallback local.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
