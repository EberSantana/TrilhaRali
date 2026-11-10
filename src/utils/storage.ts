import { Team, SubmissionLog, ClassSessionState, ClassPhase, RallyRoom } from '../types';
import { INITIAL_TEAMS } from '../data/missions';

const STORAGE_KEY_ROOMS = 'rali_sql_rooms_v2';
const STORAGE_KEY_ACTIVE_ROOM_ID = 'rali_sql_active_room_id_v2';
const STORAGE_KEY_APPS_SCRIPT_URL = 'rali_sql_apps_script_url_v1';

export const DEFAULT_SESSION_STATE: ClassSessionState = {
  totalSeconds: 100 * 60, // 100 minutos total
  timerSecondsRemaining: 85 * 60, // 70 min de sprint
  isRunning: false,
  isSubmissionsLocked: false,
  activePhase: 'sprint',
  soundEnabled: true,
};

function createDefaultInitialRoom(): RallyRoom {
  return {
    id: `sala_${Date.now()}`,
    nome: 'Rali Oficial - Turma 2026.1 (Lab 01)',
    disciplina: 'Banco de Dados - IFS Campus Tobias Barreto',
    dataCriacao: new Date().toISOString(),
    status: 'ativa',
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    logs: [],
    sessionState: { ...DEFAULT_SESSION_STATE },
    anotacoes: 'Dinâmica de 100 minutos com 50 missões e 10 equipes.',
  };
}

// BroadcastChannel for instant cross-tab real-time updates
let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel('rali_sql_live_channel');
  } catch {
    channel = null;
  }
}

export function subscribeToSync(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key?.startsWith('rali_sql_')) {
      callback();
    }
  };

  const handleBroadcast = () => {
    callback();
  };

  window.addEventListener('storage', handleStorage);
  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
}

export function notifySync() {
  if (channel) {
    try {
      channel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
}

// --- GESTÃO DE SALAS (ROOMS) ---

export function getRooms(): RallyRoom[] {
  if (typeof window === 'undefined') return [createDefaultInitialRoom()];
  try {
    const data = localStorage.getItem(STORAGE_KEY_ROOMS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  const initial = [createDefaultInitialRoom()];
  saveRooms(initial);
  return initial;
}

export function saveRooms(rooms: RallyRoom[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    notifySync();
  } catch {
    // ignore
  }
}

export function getActiveRoomId(): string {
  if (typeof window === 'undefined') return '';
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ROOM_ID);
  if (stored) return stored;
  const rooms = getRooms();
  const firstId = rooms[0]?.id || '';
  if (firstId) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ROOM_ID, firstId);
  }
  return firstId;
}

export function setActiveRoomId(roomId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_ROOM_ID, roomId);
  notifySync();
}

export function getActiveRoom(): RallyRoom {
  const rooms = getRooms();
  const activeId = getActiveRoomId();
  const found = rooms.find((r) => r.id === activeId);
  if (found) return found;
  if (rooms.length > 0) {
    setActiveRoomId(rooms[0].id);
    return rooms[0];
  }
  const defaultRoom = createDefaultInitialRoom();
  saveRooms([defaultRoom]);
  setActiveRoomId(defaultRoom.id);
  return defaultRoom;
}

export function createNewRoom(nome: string, disciplina: string, anotacoes?: string): RallyRoom {
  const newRoom: RallyRoom = {
    id: `sala_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nome: nome.trim() || `Rali - ${new Date().toLocaleDateString()}`,
    disciplina: disciplina.trim() || 'Banco de Dados - IFS',
    dataCriacao: new Date().toISOString(),
    status: 'ativa',
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    logs: [],
    sessionState: { ...DEFAULT_SESSION_STATE },
    anotacoes: anotacoes || '',
  };

  const rooms = getRooms();
  rooms.unshift(newRoom);
  saveRooms(rooms);
  setActiveRoomId(newRoom.id);
  return newRoom;
}

export function updateActiveRoom(updater: (room: RallyRoom) => RallyRoom) {
  const rooms = getRooms();
  const activeId = getActiveRoomId();
  const updatedRooms = rooms.map((r) => {
    if (r.id === activeId) {
      return updater(r);
    }
    return r;
  });
  saveRooms(updatedRooms);
}

// --- CONTEXTO DA SALA ATIVA ---

export function getTeams(): Team[] {
  return getActiveRoom().teams;
}

export function saveTeams(teams: Team[]) {
  updateActiveRoom((room) => ({
    ...room,
    teams,
  }));
}

export function getLogs(): SubmissionLog[] {
  return getActiveRoom().logs;
}

export function addLog(log: SubmissionLog) {
  updateActiveRoom((room) => ({
    ...room,
    logs: [log, ...room.logs].slice(0, 300),
  }));
}

export function getSessionState(): ClassSessionState {
  return getActiveRoom().sessionState;
}

export function saveSessionState(state: Partial<ClassSessionState>) {
  updateActiveRoom((room) => ({
    ...room,
    sessionState: { ...room.sessionState, ...state },
  }));
}

export function resetActiveRoomData() {
  updateActiveRoom((room) => ({
    ...room,
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    logs: [],
    sessionState: { ...DEFAULT_SESSION_STATE },
  }));
}

// --- GOOGLE APPS SCRIPT ---

export function getAppsScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_APPS_SCRIPT_URL) || '';
}

export function saveAppsScriptUrl(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_APPS_SCRIPT_URL, url.trim());
}

export function getPhaseFromElapsedSeconds(elapsedSeconds: number): ClassPhase {
  const elapsedMinutes = elapsedSeconds / 60;
  if (elapsedMinutes < 15) return 'briefing';
  if (elapsedMinutes < 85) return 'sprint';
  if (elapsedMinutes < 90) return 'hard_stop';
  return 'debriefing';
}
