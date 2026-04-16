export type WhatsAppBridgePayload = {
  version: string;
  createdAt: string;
  tokenId?: string;
  sessionId?: string;
  mode?: 'group' | 'individual';
  student?: {
    id?: string | null;
    name?: string;
    matricula?: string | null;
    grupoId?: string | null;
    grupoNombre?: string | null;
  };
  tests?: string[];
  completedTests?: string[];
  results?: Record<string, unknown>;
  [key: string]: unknown;
};

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }

  return Buffer.from(binary, 'binary').toString('base64');
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = typeof atob !== 'undefined'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function compressUtf8(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') return data;

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  await writer.write(data);
  await writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

async function decompressUtf8(data: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === 'undefined') return data;

  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  await writer.write(data);
  await writer.close();

  const buffer = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buffer);
}

export async function encodeEvaluationPayload(payload: WhatsAppBridgePayload): Promise<string> {
  const json = JSON.stringify(payload);
  const utf8 = new TextEncoder().encode(json);
  const compressed = await compressUtf8(utf8);
  const usedCompression = compressed.length < utf8.length;

  if (!usedCompression) {
    return `raw.${uint8ToBase64(utf8)}`;
  }

  return `gz.${uint8ToBase64(compressed)}`;
}

export async function decodeEvaluationPayload(code: string): Promise<WhatsAppBridgePayload> {
  const trimmed = code.trim();
  const normalized = trimmed.replace(/^PIGEC-WA1:/i, '');

  const [prefix, value] = normalized.includes('.')
    ? normalized.split('.', 2)
    : ['raw', normalized];

  const bytes = base64ToUint8(value);
  const decodedBytes = prefix === 'gz' ? await decompressUtf8(bytes) : bytes;
  const json = new TextDecoder().decode(decodedBytes);
  const parsed = JSON.parse(json) as WhatsAppBridgePayload;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Codigo de WhatsApp invalido');
  }

  return parsed;
}
