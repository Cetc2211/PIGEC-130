import type { OfficialGroup } from '@/lib/placeholder-data';
import type { WhatsAppBridgePayload } from '@/lib/data-utils';

const EXPEDIENTES_KEY = 'pigec_expedientes';
const OFFICIAL_GROUPS_KEY = 'pigec_official_groups';
const WHATSAPP_IMPORTS_KEY = 'pigec_whatsapp_imports';

type StoredExpediente = {
  id?: string;
  studentId?: string;
  [key: string]: unknown;
};

type StoredWhatsAppImport = {
  id: string;
  importedAt: string;
  payload: WhatsAppBridgePayload;
};

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function safeParseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function getExpedientes<T = StoredExpediente>(): T[] {
  if (!isBrowser()) return [];
  return safeParseArray<T>(localStorage.getItem(EXPEDIENTES_KEY));
}

export function saveExpediente(expediente: StoredExpediente): void {
  if (!isBrowser()) return;
  const current = getExpedientes<StoredExpediente>();

  const matchIndex = current.findIndex((item) => {
    if (expediente.id && item.id) return item.id === expediente.id;
    if (expediente.studentId && item.studentId) return item.studentId === expediente.studentId;
    return false;
  });

  if (matchIndex >= 0) {
    current[matchIndex] = { ...current[matchIndex], ...expediente };
  } else {
    current.push(expediente);
  }

  localStorage.setItem(EXPEDIENTES_KEY, JSON.stringify(current));
}

export function saveExpedienteLocal(expediente: StoredExpediente): void {
  saveExpediente(expediente);
}

export function saveOfficialGroupStructure(group: OfficialGroup): void {
  if (!isBrowser()) return;
  const current = safeParseArray<OfficialGroup>(localStorage.getItem(OFFICIAL_GROUPS_KEY));
  const idx = current.findIndex((g) => g.id === group.id);

  if (idx >= 0) {
    current[idx] = { ...current[idx], ...group };
  } else {
    current.push(group);
  }

  localStorage.setItem(OFFICIAL_GROUPS_KEY, JSON.stringify(current));
}

export function getOfficialGroupStructures(): OfficialGroup[] {
  if (!isBrowser()) return [];
  return safeParseArray<OfficialGroup>(localStorage.getItem(OFFICIAL_GROUPS_KEY));
}

export function saveImportedWhatsAppEvaluation(payload: WhatsAppBridgePayload): string {
  if (!isBrowser()) return '';

  const importId = `wa-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const imports = safeParseArray<StoredWhatsAppImport>(localStorage.getItem(WHATSAPP_IMPORTS_KEY));

  imports.push({
    id: importId,
    importedAt: new Date().toISOString(),
    payload,
  });

  localStorage.setItem(WHATSAPP_IMPORTS_KEY, JSON.stringify(imports));

  const studentId = payload.student?.id ?? undefined;
  const studentName = payload.student?.name ?? 'Consultante (WhatsApp)';

  saveExpedienteLocal({
    id: `exp-wa-${importId}`,
    studentId,
    studentName,
    origen: 'whatsapp_bridge',
    fechaActualizacion: new Date().toISOString(),
    whatsappBridgeData: payload,
  });

  return importId;
}

export function getImportedWhatsAppEvaluations(): StoredWhatsAppImport[] {
  if (!isBrowser()) return [];
  return safeParseArray<StoredWhatsAppImport>(localStorage.getItem(WHATSAPP_IMPORTS_KEY));
}
