import { DEFAULT_CTF_API_URL } from '../config';
import { CtfStoredRoom } from '../types/ctf';

const KEY_API = 'rali_ctf_api_url_v1';
const KEY_STUDENT = 'rali_ctf_student_v1';
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

export function isValidApiUrl(url: string): boolean {
  return /^https:\/\/script\.google(usercontent)?\.com\/.+/i.test(url.trim());
}

export function buildStudentLink(token: string, api: string): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const params = new URLSearchParams({ t: token });
  if (!DEFAULT_CTF_API_URL || DEFAULT_CTF_API_URL !== api) params.set('api', api);
  return `${base}#/ctf?${params.toString()}`;
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
