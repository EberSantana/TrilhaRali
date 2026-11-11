import { DEFAULT_CTF_API_URL } from '../config';
import { CtfStoredRoom, RoomTipo } from '../types/ctf';

const KEY_API = 'rali_ctf_api_url_v1';
const KEY_STUDENT = 'rali_ctf_student_v1';
const KEY_RALI_STUDENT = 'rali_nfc_student_v1';
const KEY_ROOMS = 'rali_ctf_teacher_rooms_v1';

// --- Parâmetros do link de convite: #/ctf?t=TOKEN&api=URL ---

export interface CtfLinkParams {
  token?: string;
  api?: string;
}

export function parseCtfHash(hash: string = typeof window !== 'undefined' ? window.location.hash : ''): CtfLinkParams {
  const queryStart = hash.indexOf('?');
  if (queryStart < 0) return {};
  const params = new URLSearchParams(hash.slice(queryStart + 1));
  const token = (params.get('t') || params.get('token') || '').trim().toUpperCase();
  const api = (params.get('api') || '').trim();
  return { token: token || undefined, api: isValidApiUrl(api) ? api : undefined };
}

/** Só aceita a URL do Web App publicado (…/macros/s/ID/exec), não a do editor nem a da planilha. */
export function isValidApiUrl(url: string): boolean {
  return /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[\w-]+\/exec\/?$/i.test(url.trim());
}

/** Explica por que uma URL colada não serve, para o professor corrigir sozinho. */
export function explainInvalidApiUrl(url: string): string {
  const u = url.trim();
  if (/docs\.google\.com\/spreadsheets/i.test(u)) {
    return 'Este é o link da planilha. Cole a URL do Web App do Apps Script (termina em /exec).';
  }
  if (/script\.google\.com\/.*\/(edit|home)/i.test(u) || /script\.google\.com\/home/i.test(u)) {
    return 'Este é o link do editor do Apps Script. Em Implantar > Nova implantação > Aplicativo da Web, copie a "URL do app da Web" (termina em /exec).';
  }
  return 'Cole a URL do Web App (começa com https://script.google.com/macros/s/ e termina em /exec).';
}

export function buildStudentLink(token: string, api: string, tipo: RoomTipo = 'ctf'): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const params = new URLSearchParams({ t: token });
  if (!DEFAULT_CTF_API_URL || DEFAULT_CTF_API_URL !== api) params.set('api', api);
  return `${base}#/${tipo === 'rali' ? 'rali' : 'ctf'}?${params.toString()}`;
}

// --- URL do backend (Apps Script) ---

export function getCtfApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_CTF_API_URL;
  return parseCtfHash().api || localStorage.getItem(KEY_API) || DEFAULT_CTF_API_URL;
}

export function saveCtfApiUrl(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_API, url.trim());
}

export async function ctfCall<T>(action: string, payload: Record<string, unknown> = {}, apiUrl: string = getCtfApiUrl()): Promise<T> {
  if (!apiUrl) {
    throw new Error('O backend do CTF ainda não foi configurado. Peça o link de convite ao professor.');
  }
  let res: Response;
  try {
    // text/plain evita o preflight CORS, que o Apps Script não responde
    res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
    });
  } catch {
    throw new Error('Sem conexão com o servidor do CTF. Verifique a internet e tente de novo.');
  }
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Resposta inesperada do servidor. Confira se o Web App está publicado para "Qualquer pessoa".');
  }
  if (data && data.error) throw new Error(String(data.error));
  return data as T;
}

// --- Sessão do aluno (retomar após recarregar a página) ---

export interface CtfStudentSession {
  token: string;
  nome: string;
}

export function getStudentSession(): CtfStudentSession | null {
  try {
    const raw = localStorage.getItem(KEY_STUDENT);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.token && s.nome ? s : null;
  } catch {
    return null;
  }
}

export function saveStudentSession(s: CtfStudentSession) {
  try {
    localStorage.setItem(KEY_STUDENT, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function clearStudentSession() {
  try {
    localStorage.removeItem(KEY_STUDENT);
  } catch {
    // ignore
  }
}

// --- Sessão da equipe no Rali NFC ---

export function getRaliSession(): CtfStudentSession | null {
  try {
    const raw = localStorage.getItem(KEY_RALI_STUDENT);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s && s.token && s.nome ? s : null;
  } catch {
    return null;
  }
}

export function saveRaliSession(s: CtfStudentSession) {
  try {
    localStorage.setItem(KEY_RALI_STUDENT, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function clearRaliSession() {
  try {
    localStorage.removeItem(KEY_RALI_STUDENT);
  } catch {
    // ignore
  }
}

// --- Salas criadas pelo professor neste navegador (guarda a chave de administração) ---

export function getTeacherRooms(): CtfStoredRoom[] {
  try {
    const raw = localStorage.getItem(KEY_ROOMS);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveTeacherRooms(rooms: CtfStoredRoom[]) {
  try {
    localStorage.setItem(KEY_ROOMS, JSON.stringify(rooms));
  } catch {
    // ignore
  }
}
