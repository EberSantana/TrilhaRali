/**
 * Terminal Linux SIMULADO para a sala de aula: um shell de brinquedo com sistema de arquivos virtual,
 * que roda 100% no navegador do aluno (nada toca o computador dele). Cobre o básico de uma aula:
 * navegar, criar/copiar/mover/apagar, ler arquivos, filtrar com pipes, permissões (chmod) e scripts simples.
 */

export interface FsNode {
  type: 'file' | 'dir';
  mode: number; // ex.: 0o644
  owner: string;
  group: string;
  mtime: number;
  content: string; // arquivos
  children: Record<string, FsNode>; // diretórios
  link?: string; // link simbólico (ln -s)
}

export interface ShellState {
  root: FsNode;
  cwd: string;
  user: string;
  host: string;
  env: Record<string, string>;
  history: string[];
  lastCode: number;
  depth: number;
  piped?: boolean; // saída vai para outro comando ou arquivo (ls passa a listar um por linha)
  procs: { pid: number; user: string; cmd: string }[];
}

export interface ShellResult {
  out: string;
  clear?: boolean;
}

interface Cmd {
  out: string;
  err: string;
  code: number;
}

const HOME = '/home/aluno';
const NOW0 = Date.UTC(2026, 10, 11, 16, 0, 0);

const file = (content: string, mode = 0o644, owner = 'aluno'): FsNode => ({ type: 'file', mode, owner, group: owner, mtime: NOW0, content, children: {} });
const dir = (children: Record<string, FsNode> = {}, mode = 0o755, owner = 'aluno'): FsNode => ({ type: 'dir', mode, owner, group: owner, mtime: NOW0, content: '', children });

function linhasLog(): string {
  const base = [
    ['08:00:01', 'INFO', 'Sistema iniciado'],
    ['08:00:07', 'INFO', 'Servico de rede ativo'],
    ['08:03:44', 'AVISO', 'Uso de disco em 81%'],
    ['08:10:12', 'ERRO', 'Falha ao conectar no banco de dados'],
    ['08:10:15', 'INFO', 'Nova tentativa de conexao'],
    ['08:10:16', 'INFO', 'Conexao estabelecida'],
    ['09:21:30', 'ERRO', 'Timeout na requisicao /api/notas'],
    ['09:45:02', 'AVISO', 'Memoria acima de 70%'],
    ['10:02:58', 'INFO', 'Backup concluido'],
    ['10:30:11', 'ERRO', 'Permissao negada para /var/backup'],
  ];
  return base.map(([h, n, m]) => `2026-11-11 ${h} [${n}] ${m}`).join('\n') + '\n';
}

function linhasAcesso(): string {
  return [
    '192.168.0.15 GET /index.html 200',
    '192.168.0.22 GET /notas.html 200',
    '192.168.0.15 GET /admin 403',
    '10.0.0.9 GET /index.html 200',
    '192.168.0.22 POST /login 200',
    '192.168.0.31 GET /admin 403',
    '192.168.0.15 GET /sobre.html 200',
    '10.0.0.9 GET /logo.png 404',
    '192.168.0.31 GET /admin 403',
    '192.168.0.15 POST /login 401',
  ].join('\n') + '\n';
}

export function createFs(): FsNode {
  return dir(
    {
      home: dir({
        professor: dir({ 'provas.txt': file('Gabarito da prova de sexta\n', 0o600, 'professor') }, 0o755, 'professor'),
        aluno: dir({
          'notas.txt': file('Aula de Linux\nlistar: ls\nentrar na pasta: cd\nver o conteudo: cat\n'),
          'segredo.txt': file('A senha do wifi do laboratorio e: rali2026\n', 0o000),
          '.bashrc': file('# configuracoes do terminal\nexport LANG=pt_BR.UTF-8\n'),
          documentos: dir({
            'relatorio.txt': file('Relatorio de redes\nlinha 2\nlinha 3\nErro na linha 4\nlinha 5\n'),
            'lista_compras.txt': file('arroz\nfeijao\ncafe\nleite\ncafe\nacucar\n'),
            'alunos.csv': file('nome,turma,nota\nAna,A,9\nBruno,B,7\nCarla,A,8\nDiego,B,6\n'),
          }),
          projetos: dir({
            'script.sh': file('#!/bin/bash\necho "Ola do script!"\npwd\nls\n'),
            site: dir({
              'index.html': file('<html>\n<body>\n<h1>Meu site</h1>\n</body>\n</html>\n'),
              'estilo.css': file('body { color: #222; }\n'),
            }),
          }),
          downloads: dir(),
        }),
      }),
      etc: dir(
        {
          hostname: file('rali-lab\n', 0o644, 'root'),
          passwd: file('root:x:0:0:root:/root:/bin/bash\naluno:x:1000:1000:Aluno:/home/aluno:/bin/bash\nprofessor:x:1001:1001:Professor:/home/professor:/bin/bash\n', 0o644, 'root'),
          'os-release': file('NAME="Rali Linux"\nVERSION="1.0"\n', 0o644, 'root'),
          hosts: file('127.0.0.1 localhost\n192.168.0.10 servidor-escola\n', 0o644, 'root'),
        },
        0o755,
        'root'
      ),
      var: dir(
        {
          log: dir({ 'sistema.log': file(linhasLog(), 0o644, 'root'), 'acesso.log': file(linhasAcesso(), 0o644, 'root') }, 0o755, 'root'),
          www: dir(
            {
              html: dir(
                {
                  'index.html': file('<html>\n<body>Escola</body>\n</html>\n', 0o644, 'www-data'),
                  'sobre.html': file('<html>\n<body>Sobre</body>\n</html>\n', 0o644, 'www-data'),
                  'estilo.css': file('body { margin: 0; }\n', 0o644, 'www-data'),
                  imagens: dir({ 'logo.png': file('PNG', 0o644, 'www-data') }, 0o755, 'www-data'),
                },
                0o755,
                'www-data'
              ),
            },
            0o755,
            'root'
          ),
        },
        0o755,
        'root'
      ),
      srv: dir(
        {
          escola: dir(
            {
              'alunos.csv': file('nome,curso,faltas\nAna,Informatica,2\nBruno,Informatica,5\nCarla,Administracao,0\nDiego,Informatica,7\nElisa,Administracao,3\n', 0o644, 'root'),
              'avisos.txt': file('Prova de Banco de Dados na sexta\nEntregar relatorio ate quarta\nLaboratorio 2 fechado para manutencao\nProva de Redes adiada\n', 0o644, 'root'),
              turmas: dir(
                {
                  'info1.txt': file('Turma: Informatica 1\nAlunos: 32\nSala: Lab 01\n', 0o644, 'root'),
                  'info2.txt': file('Turma: Informatica 2\nAlunos: 28\nSala: Lab 03\n', 0o644, 'root'),
                  'adm1.txt': file('Turma: Administracao 1\nAlunos: 35\nSala: 12\n', 0o644, 'root'),
                },
                0o755,
                'root'
              ),
            },
            0o755,
            'root'
          ),
        },
        0o755,
        'root'
      ),
      opt: dir(
        {
          rali: dir(
            {
              'versao.txt': file('Trilha Rali v8.0\n', 0o644, 'root'),
              'config.ini': file('[servidor]\nporta=8080\nmodo=producao\n[banco]\nhost=localhost\nnome=escola_db\n', 0o644, 'root'),
              '.chave': file('chave: ZEBRA42\n', 0o644, 'root'),
            },
            0o755,
            'root'
          ),
        },
        0o755,
        'root'
      ),
      proc: dir(
        {
          cpuinfo: file('processor\t: 0\nmodel name\t: Rali Virtual CPU @ 2.40GHz\ncpu cores\t: 2\n', 0o444, 'root'),
          meminfo: file('MemTotal:        4046848 kB\nMemFree:         1523212 kB\nMemAvailable:    2870144 kB\nSwapTotal:       2097148 kB\nSwapFree:        2097148 kB\n', 0o444, 'root'),
        },
        0o555,
        'root'
      ),
      tmp: dir({}, 0o777, 'root'),
    },
    0o755,
    'root'
  );
}

const baseProcs = () => [
  { pid: 1, user: 'root', cmd: 'systemd' },
  { pid: 101, user: 'aluno', cmd: 'bash' },
  { pid: 150, user: 'aluno', cmd: 'firefox' },
  { pid: 151, user: 'aluno', cmd: 'python3 servidor.py' },
];

export function createShell(): ShellState {
  return {
    root: createFs(),
    cwd: HOME,
    user: 'aluno',
    host: 'rali-lab',
    env: { HOME, USER: 'aluno', SHELL: '/bin/bash', PWD: HOME, LANG: 'pt_BR.UTF-8' },
    history: [],
    lastCode: 0,
    depth: 0,
    procs: baseProcs(),
  };
}

// ---------- caminhos ----------

export function resolvePath(st: ShellState, p: string): string {
  let path = p === '~' || p.startsWith('~/') ? HOME + p.slice(1) : p;
  if (!path.startsWith('/')) path = `${st.cwd}/${path}`;
  const out: string[] = [];
  path.split('/').forEach((seg) => {
    if (!seg || seg === '.') return;
    if (seg === '..') out.pop();
    else out.push(seg);
  });
  return '/' + out.join('/');
}

function nodeAt(st: ShellState, abs: string): FsNode | null {
  let cur = st.root;
  for (const seg of abs.split('/').filter(Boolean)) {
    if (cur.type !== 'dir' || !cur.children[seg]) return null;
    cur = cur.children[seg];
  }
  return cur;
}

function splitParent(abs: string): { parent: string; name: string } {
  const parts = abs.split('/').filter(Boolean);
  const name = parts.pop() ?? '';
  return { parent: '/' + parts.join('/'), name };
}

function can(st: ShellState, n: FsNode, bit: 4 | 2 | 1): boolean {
  const cls = n.owner === st.user ? (n.mode >> 6) & 7 : n.mode & 7;
  return (cls & bit) !== 0;
}

const display = (st: ShellState, abs: string) => (abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs);
export const promptOf = (st: ShellState) => `${st.user}@${st.host}:${display(st, st.cwd)}$`;

// ---------- tokenização ----------

interface Tok {
  text: string;
  quoted: boolean;
  op?: '|' | '>' | '>>' | '&&' | ';';
}

function expandVars(st: ShellState, s: string): string {
  return s.replace(/\$(\?|[A-Za-z_][A-Za-z0-9_]*)/g, (_m, name: string) => (name === '?' ? String(st.lastCode) : st.env[name] ?? ''));
}

export function tokenize(st: ShellState, line: string): Tok[] {
  const toks: Tok[] = [];
  let cur = '';
  let has = false;
  let quoted = false;
  const push = () => {
    if (has) toks.push({ text: cur, quoted });
    cur = '';
    has = false;
    quoted = false;
  };
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'") {
      const j = line.indexOf("'", i + 1);
      if (j < 0) throw new Error("aspas simples sem fechar");
      cur += line.slice(i + 1, j);
      has = quoted = true;
      i = j;
    } else if (c === '"') {
      const j = line.indexOf('"', i + 1);
      if (j < 0) throw new Error('aspas duplas sem fechar');
      cur += expandVars(st, line.slice(i + 1, j));
      has = quoted = true;
      i = j;
    } else if (c === '\\' && i + 1 < line.length) {
      cur += line[++i];
      has = true;
    } else if (c === '#' && !has) {
      break;
    } else if (/\s/.test(c)) {
      push();
    } else if (c === '|' || c === ';' || c === '>' || (c === '&' && line[i + 1] === '&')) {
      push();
      const op = c === '&' ? '&&' : c === '>' && line[i + 1] === '>' ? '>>' : c;
      if (op === '&&' || op === '>>') i++;
      toks.push({ text: op, quoted: false, op: op as Tok['op'] });
    } else {
      // $VAR e ~ sem aspas
      if (c === '$') {
        const m = /^\$(\?|[A-Za-z_][A-Za-z0-9_]*)/.exec(line.slice(i));
        if (m) {
          cur += expandVars(st, m[0]);
          has = true;
          i += m[0].length - 1;
          continue;
        }
      }
      cur += c;
      has = true;
    }
  }
  push();
  return toks;
}

function globToRegExp(pat: string): RegExp {
  const esc = pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.');
  return new RegExp(`^${esc}$`);
}

function expandGlobs(st: ShellState, t: Tok): string[] {
  if (t.quoted || !/[*?]/.test(t.text)) return [t.text.startsWith('~') && !t.quoted ? resolvePath(st, t.text) : t.text];
  const idx = t.text.lastIndexOf('/');
  const dirPart = idx >= 0 ? t.text.slice(0, idx + 1) : '';
  const pat = idx >= 0 ? t.text.slice(idx + 1) : t.text;
  const d = nodeAt(st, resolvePath(st, dirPart || '.'));
  if (!d || d.type !== 'dir') return [t.text];
  const re = globToRegExp(pat);
  const hits = Object.keys(d.children)
    .filter((n) => re.test(n) && (pat.startsWith('.') || !n.startsWith('.')))
    .sort()
    .map((n) => dirPart + n);
  return hits.length ? hits : [t.text];
}

// ---------- comandos ----------

const ok = (out = ''): Cmd => ({ out, err: '', code: 0 });
const bad = (err: string, code = 1): Cmd => ({ out: '', err, code });

function parseFlags(args: string[], withValue: string[] = []): { flags: Set<string>; vals: Record<string, string>; rest: string[] } {
  const flags = new Set<string>();
  const vals: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.length > 1 && a[0] === '-' && !/^-\d+$/.test(a)) {
      const letters = a.slice(1);
      if (withValue.includes(letters[0])) {
        vals[letters[0]] = letters.length > 1 ? letters.slice(1) : args[++i] ?? '';
      } else {
        for (const l of letters) flags.add(l);
      }
    } else rest.push(a);
  }
  return { flags, vals, rest };
}

const fmtDate = (t: number) => {
  const d = new Date(t);
  const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][d.getUTCMonth()];
  return `${m} ${String(d.getUTCDate()).padStart(2, ' ')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

function modeStr(n: FsNode): string {
  const bits = 'rwxrwxrwx';
  let s = n.link ? 'l' : n.type === 'dir' ? 'd' : '-';
  for (let i = 0; i < 9; i++) s += n.mode & (1 << (8 - i)) ? bits[i] : '-';
  return s;
}

function sizeOf(n: FsNode): number {
  return n.type === 'dir' ? 4096 : new TextEncoder().encode(n.content).length;
}

function lsLine(name: string, n: FsNode): string {
  return `${modeStr(n)} 1 ${n.owner.padEnd(6)} ${n.group.padEnd(6)} ${String(sizeOf(n)).padStart(5)} ${fmtDate(n.mtime)} ${name}${n.link ? ' -> ' + n.link : ''}`;
}

const lines = (s: string): string[] => {
  if (!s) return [];
  const l = s.split('\n');
  if (l[l.length - 1] === '') l.pop();
  return l;
};
const withNl = (l: string[]) => (l.length ? l.join('\n') + '\n' : '');

type Impl = (st: ShellState, args: string[], stdin: string) => Cmd;

function readInputs(st: ShellState, names: string[], stdin: string, cmd: string): { text: string; err: string; code: number; named: { name: string; text: string }[] } {
  if (names.length === 0) return { text: stdin, err: '', code: 0, named: [{ name: '-', text: stdin }] };
  let err = '';
  let code = 0;
  const named: { name: string; text: string }[] = [];
  names.forEach((nm) => {
    let n = nodeAt(st, resolvePath(st, nm));
    if (n && n.link) n = nodeAt(st, resolvePath(st, n.link));
    if (!n) {
      err += `${cmd}: ${nm}: Arquivo ou diretório inexistente\n`;
      code = 1;
    } else if (n.type === 'dir') {
      err += `${cmd}: ${nm}: É um diretório\n`;
      code = 1;
    } else if (!can(st, n, 4)) {
      err += `${cmd}: ${nm}: Permissão negada\n`;
      code = 1;
    } else named.push({ name: nm, text: n.content });
  });
  return { text: named.map((x) => x.text).join(''), err, code, named };
}

function walk(n: FsNode, base: string, visit: (path: string, node: FsNode) => void) {
  visit(base, n);
  if (n.type === 'dir') Object.keys(n.children).sort().forEach((k) => walk(n.children[k], base === '/' ? `/${k}` : `${base}/${k}`, visit));
}

function applyMode(cur: number, spec: string, isDir: boolean): number | null {
  if (/^[0-7]{3,4}$/.test(spec)) return parseInt(spec.slice(-3), 8);
  let mode = cur;
  for (const part of spec.split(',')) {
    const m = /^([ugoa]*)([+\-=])([rwxX]*)$/.exec(part);
    if (!m) return null;
    const who = m[1] || 'a';
    let bits = 0;
    if (m[3].includes('r')) bits |= 4;
    if (m[3].includes('w')) bits |= 2;
    if (m[3].includes('x') || (m[3].includes('X') && isDir)) bits |= 1;
    for (const w of who === 'a' ? ['u', 'g', 'o'] : who.split('')) {
      const shift = w === 'u' ? 6 : w === 'g' ? 3 : 0;
      const mask = 7 << shift;
      if (m[2] === '+') mode |= bits << shift;
      else if (m[2] === '-') mode &= ~(bits << shift);
      else mode = (mode & ~mask) | (bits << shift);
    }
  }
  return mode;
}

const COMMANDS: Record<string, Impl> = {
  help: () =>
    ok(
      [
        'Comandos disponíveis (terminal simulado: nada aqui afeta o seu computador):',
        '  navegar ....... pwd  ls [-l -a]  cd  tree  find',
        '  arquivos ...... cat  head  tail  touch  mkdir [-p]  cp [-r]  mv  rm [-r -f]  rmdir',
        '  texto ......... echo  grep [-i -n -v -c]  wc [-l -w -c]  sort [-r -n]  uniq [-c]  cut -d -f',
        '  permissões .... chmod  (ex.: chmod 755 arq, chmod +x arq)  ls -l',
        '  sistema ....... whoami  id  hostname  uname -a  date  uptime  w  free  du  df  ps  kill  history  clear',
        '  rede (simul.) . ping  ip  ifconfig  netstat  ss  traceroute  nslookup  dig  whois  wget  curl  ssh  scp  nmap',
        '  compactar ..... tar cf/tf/xf  gzip  gunzip  zip  unzip  rsync      links ... ln -s',
        '  usuários ...... who  last  groups  su  umask  passwd  (useradd/usermod/userdel só o root)',
        '  disco/serviços  lsblk  blkid  mount  top  htop  systemctl status  apt list  (instalar pede root)',
        '  outros ........ locate  whereis  man  stat  diff  less  basename  dirname',
        '  extras ........ pipes (cmd | cmd), redirecionamento (> e >>), && e ;, ./script.sh, TAB completa, ↑ ↓ histórico',
        '  dica .......... use  reset  para voltar o sistema de arquivos ao início',
      ].join('\n') + '\n'
    ),
  pwd: (st) => ok(st.cwd + '\n'),
  whoami: (st) => ok(st.user + '\n'),
  id: (st) => ok(`uid=1000(${st.user}) gid=1000(${st.user}) grupos=1000(${st.user})\n`),
  hostname: (st) => ok(st.host + '\n'),
  uname: (_st, a) => ok(a.includes('-r') ? '6.1.0-rali\n' : a.includes('-a') ? 'Linux rali-lab 6.1.0-rali #1 SMP x86_64 GNU/Linux\n' : 'Linux\n'),
  date: () => ok(new Date().toString() + '\n'),
  env: (st) => ok(Object.entries(st.env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'),
  printenv: (st, a) => (a[0] ? ok((st.env[a[0]] ?? '') + (st.env[a[0]] !== undefined ? '\n' : '')) : COMMANDS.env(st, [], '')),
  history: (st) => ok(st.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n') + (st.history.length ? '\n' : '')),
  sudo: (st) => bad(`${st.user} não está no arquivo sudoers. Este incidente será relatado.\n`),
  exit: () => ok('Para sair, é só fechar o terminal.\n'),
  which: (_st, a) => ok(a.map((c) => (COMMANDS[c] ? `/usr/bin/${c}\n` : '')).join('')),

  echo: (_st, a) => {
    const noNl = a[0] === '-n';
    const text = (noNl ? a.slice(1) : a).join(' ');
    return ok(noNl ? text : text + '\n');
  },

  cd: (st, a) => {
    const target = resolvePath(st, a[0] ?? '~');
    const n = nodeAt(st, target);
    if (!n) return bad(`cd: ${a[0]}: Arquivo ou diretório inexistente\n`);
    if (n.type !== 'dir') return bad(`cd: ${a[0]}: Não é um diretório\n`);
    if (!can(st, n, 1)) return bad(`cd: ${a[0]}: Permissão negada\n`);
    st.cwd = target;
    st.env.PWD = target;
    return ok();
  },

  ls: (st, a) => {
    const { flags, rest } = parseFlags(a);
    const long = flags.has('l');
    const all = flags.has('a') || flags.has('A');
    const targets = rest.length ? rest : ['.'];
    let out = '';
    let err = '';
    const multi = targets.length > 1;
    targets.forEach((t, i) => {
      const n = nodeAt(st, resolvePath(st, t));
      if (!n) {
        err += `ls: não foi possível acessar '${t}': Arquivo ou diretório inexistente\n`;
        return;
      }
      if (n.type === 'file') {
        out += long ? lsLine(t, n) + '\n' : t + '\n';
        return;
      }
      if (!can(st, n, 4)) {
        err += `ls: não foi possível abrir o diretório '${t}': Permissão negada\n`;
        return;
      }
      if (multi) out += `${i ? '\n' : ''}${t}:\n`;
      let names = Object.keys(n.children).sort((x, y) => x.localeCompare(y));
      if (!all) names = names.filter((x) => !x.startsWith('.'));
      const entries: [string, FsNode][] = all ? [['.', n], ['..', n], ...names.map((x) => [x, n.children[x]] as [string, FsNode])] : names.map((x) => [x, n.children[x]] as [string, FsNode]);
      if (long) out += `total ${Math.max(1, entries.length) * 4}\n` + entries.map(([nm, nd]) => lsLine(nm, nd)).join('\n') + (entries.length ? '\n' : '');
      else out += entries.length ? entries.map(([nm]) => nm).join(st.piped ? '\n' : '  ') + '\n' : '';
    });
    return { out, err, code: err ? 2 : 0 };
  },

  cat: (st, a, stdin) => {
    const { flags, rest } = parseFlags(a);
    const r = readInputs(st, rest, stdin, 'cat');
    let text = r.text;
    if (flags.has('n')) text = lines(text).map((l, i) => `${String(i + 1).padStart(6)}\t${l}`).join('\n') + (text ? '\n' : '');
    return { out: text, err: r.err, code: r.code };
  },

  head: (st, a, stdin) => {
    const { vals, rest, flags } = parseFlags(a, ['n']);
    const num = vals.n ? parseInt(vals.n, 10) : (Array.from(flags).join('').match(/\d+/) ? 10 : 10);
    const nArg = rest.find((x) => /^-\d+$/.test(x));
    const n = nArg ? Math.abs(parseInt(nArg, 10)) : Number.isFinite(num) ? num : 10;
    const r = readInputs(st, rest.filter((x) => x !== nArg), stdin, 'head');
    return { out: withNl(lines(r.text).slice(0, n)), err: r.err, code: r.code };
  },

  tail: (st, a, stdin) => {
    const { vals, rest } = parseFlags(a, ['n']);
    const nArg = rest.find((x) => /^-\d+$/.test(x));
    const n = vals.n ? parseInt(vals.n, 10) : nArg ? Math.abs(parseInt(nArg, 10)) : 10;
    const r = readInputs(st, rest.filter((x) => x !== nArg), stdin, 'tail');
    const l = lines(r.text);
    return { out: withNl(l.slice(Math.max(0, l.length - n))), err: r.err, code: r.code };
  },

  wc: (st, a, stdin) => {
    const { flags, rest } = parseFlags(a);
    const r = readInputs(st, rest, stdin, 'wc');
    const one = (name: string, t: string) => {
      const l = (t.match(/\n/g) ?? []).length;
      const w = t.split(/\s+/).filter(Boolean).length;
      const c = new TextEncoder().encode(t).length;
      const cols = flags.size === 0 ? [l, w, c] : [flags.has('l') ? l : null, flags.has('w') ? w : null, flags.has('c') ? c : null].filter((x): x is number => x !== null);
      return cols.join(' ') + (name && name !== '-' ? ` ${name}` : '');
    };
    return { out: r.named.map((x) => one(x.name, x.text)).join('\n') + (r.named.length ? '\n' : ''), err: r.err, code: r.code };
  },

  grep: (st, a, stdin) => {
    const { flags, rest } = parseFlags(a);
    const pat = rest[0];
    if (pat === undefined) return bad('Uso: grep [-i -n -v -c] padrão [arquivo...]\n', 2);
    let re: RegExp;
    try {
      re = new RegExp(pat, flags.has('i') ? 'i' : '');
    } catch {
      re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags.has('i') ? 'i' : '');
    }
    let alvos = rest.slice(1);
    if (flags.has('r') || flags.has('R')) {
      const exp: string[] = [];
      (alvos.length ? alvos : ['.']).forEach((t) => {
        const n = nodeAt(st, resolvePath(st, t));
        if (n && n.type === 'dir') walk(n, t.replace(/\/$/, ''), (p, x) => x.type === 'file' && exp.push(p));
        else exp.push(t);
      });
      alvos = exp;
    }
    const r = readInputs(st, alvos, stdin, 'grep');
    const showName = r.named.length > 1;
    let out = '';
    let found = 0;
    r.named.forEach(({ name, text }) => {
      let count = 0;
      lines(text).forEach((l, i) => {
        if (re.test(l) !== flags.has('v')) {
          count++;
          if (!flags.has('c')) out += `${showName ? name + ':' : ''}${flags.has('n') ? i + 1 + ':' : ''}${l}\n`;
        }
      });
      if (flags.has('c')) out += `${showName ? name + ':' : ''}${count}\n`;
      found += count;
    });
    return { out, err: r.err, code: r.err ? 2 : found > 0 ? 0 : 1 };
  },

  sort: (st, a, stdin) => {
    const { flags, rest } = parseFlags(a);
    const r = readInputs(st, rest, stdin, 'sort');
    let l = lines(r.text);
    l = flags.has('n') ? l.sort((x, y) => parseFloat(x) - parseFloat(y) || x.localeCompare(y)) : l.sort((x, y) => x.localeCompare(y));
    if (flags.has('r')) l.reverse();
    if (flags.has('u')) l = l.filter((x, i) => l.indexOf(x) === i);
    return { out: withNl(l), err: r.err, code: r.code };
  },

  uniq: (st, a, stdin) => {
    const { flags, rest } = parseFlags(a);
    const r = readInputs(st, rest, stdin, 'uniq');
    const outL: string[] = [];
    let prev: string | null = null;
    let n = 0;
    const flush = () => {
      if (prev !== null) outL.push(flags.has('c') ? `${String(n).padStart(7)} ${prev}` : prev);
    };
    lines(r.text).forEach((l) => {
      if (l === prev) n++;
      else {
        flush();
        prev = l;
        n = 1;
      }
    });
    flush();
    return { out: withNl(outL), err: r.err, code: r.code };
  },

  cut: (st, a, stdin) => {
    const { vals, rest } = parseFlags(a, ['d', 'f']);
    const d = vals.d ?? '\t';
    const fields = (vals.f ?? '1').split(',').map((x) => parseInt(x, 10) - 1);
    const r = readInputs(st, rest, stdin, 'cut');
    return { out: withNl(lines(r.text).map((l) => l.split(d).filter((_x, i) => fields.includes(i)).join(d))), err: r.err, code: r.code };
  },

  touch: (st, a) => {
    let err = '';
    a.forEach((nm) => {
      const abs = resolvePath(st, nm);
      const ex = nodeAt(st, abs);
      if (ex) {
        ex.mtime = Date.now();
        return;
      }
      const { parent, name } = splitParent(abs);
      const p = nodeAt(st, parent);
      if (!p || p.type !== 'dir') err += `touch: não foi possível tocar '${nm}': Arquivo ou diretório inexistente\n`;
      else if (!can(st, p, 2)) err += `touch: não foi possível tocar '${nm}': Permissão negada\n`;
      else p.children[name] = { ...file('', 0o644, st.user), mtime: Date.now() };
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  mkdir: (st, a) => {
    const { flags, rest } = parseFlags(a);
    let err = '';
    rest.forEach((nm) => {
      const abs = resolvePath(st, nm);
      if (nodeAt(st, abs)) {
        if (!flags.has('p')) err += `mkdir: não foi possível criar o diretório '${nm}': O arquivo já existe\n`;
        return;
      }
      const parts = abs.split('/').filter(Boolean);
      let cur = st.root;
      for (let i = 0; i < parts.length; i++) {
        const last = i === parts.length - 1;
        if (!cur.children[parts[i]]) {
          if (!last && !flags.has('p')) {
            err += `mkdir: não foi possível criar o diretório '${nm}': Arquivo ou diretório inexistente\n`;
            return;
          }
          if (!can(st, cur, 2)) {
            err += `mkdir: não foi possível criar o diretório '${nm}': Permissão negada\n`;
            return;
          }
          cur.children[parts[i]] = { ...dir({}, 0o755, st.user), mtime: Date.now() };
        }
        cur = cur.children[parts[i]];
      }
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  rmdir: (st, a) => {
    let err = '';
    a.forEach((nm) => {
      const abs = resolvePath(st, nm);
      const n = nodeAt(st, abs);
      if (!n) err += `rmdir: falha ao remover '${nm}': Arquivo ou diretório inexistente\n`;
      else if (n.type !== 'dir') err += `rmdir: falha ao remover '${nm}': Não é um diretório\n`;
      else if (Object.keys(n.children).length) err += `rmdir: falha ao remover '${nm}': O diretório não está vazio\n`;
      else delete nodeAt(st, splitParent(abs).parent)!.children[splitParent(abs).name];
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  rm: (st, a) => {
    const { flags, rest } = parseFlags(a);
    let err = '';
    rest.forEach((nm) => {
      const abs = resolvePath(st, nm);
      const n = nodeAt(st, abs);
      if (abs === '/' || abs === st.cwd || st.cwd.startsWith(abs + '/')) {
        err += `rm: não é seguro remover '${nm}'\n`;
        return;
      }
      if (!n) {
        if (!flags.has('f')) err += `rm: não foi possível remover '${nm}': Arquivo ou diretório inexistente\n`;
        return;
      }
      if (n.type === 'dir' && !flags.has('r') && !flags.has('R')) {
        err += `rm: não foi possível remover '${nm}': É um diretório\n`;
        return;
      }
      const { parent, name } = splitParent(abs);
      const p = nodeAt(st, parent)!;
      if (!can(st, p, 2)) {
        err += `rm: não foi possível remover '${nm}': Permissão negada\n`;
        return;
      }
      delete p.children[name];
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  cp: (st, a) => {
    const { flags, rest } = parseFlags(a);
    if (rest.length < 2) return bad('cp: faltou o operando de destino\n');
    const dest = rest[rest.length - 1];
    const destAbs = resolvePath(st, dest);
    const destNode = nodeAt(st, destAbs);
    let err = '';
    const clone = (n: FsNode): FsNode => ({ ...n, owner: st.user, group: st.user, mtime: Date.now(), children: Object.fromEntries(Object.entries(n.children).map(([k, v]) => [k, clone(v)])) });
    rest.slice(0, -1).forEach((src) => {
      const s = nodeAt(st, resolvePath(st, src));
      if (!s) {
        err += `cp: não foi possível obter estado de '${src}': Arquivo ou diretório inexistente\n`;
        return;
      }
      if (s.type === 'dir' && !flags.has('r') && !flags.has('R')) {
        err += `cp: -r não especificado; omitindo o diretório '${src}'\n`;
        return;
      }
      if (s.type === 'file' && !can(st, s, 4)) {
        err += `cp: não foi possível abrir '${src}' para leitura: Permissão negada\n`;
        return;
      }
      const target = destNode && destNode.type === 'dir' ? { parent: destAbs, name: splitParent(resolvePath(st, src)).name } : splitParent(destAbs);
      const p = nodeAt(st, target.parent);
      if (!p || p.type !== 'dir') err += `cp: não foi possível criar '${dest}': Arquivo ou diretório inexistente\n`;
      else if (!can(st, p, 2)) err += `cp: não foi possível criar '${dest}': Permissão negada\n`;
      else p.children[target.name] = clone(s);
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  mv: (st, a) => {
    if (a.length < 2) return bad('mv: faltou o operando de destino\n');
    const dest = a[a.length - 1];
    const destAbs = resolvePath(st, dest);
    const destNode = nodeAt(st, destAbs);
    let err = '';
    a.slice(0, -1).forEach((src) => {
      const sAbs = resolvePath(st, src);
      const s = nodeAt(st, sAbs);
      if (!s) {
        err += `mv: não foi possível obter estado de '${src}': Arquivo ou diretório inexistente\n`;
        return;
      }
      const sp = splitParent(sAbs);
      const target = destNode && destNode.type === 'dir' ? { parent: destAbs, name: sp.name } : splitParent(destAbs);
      const p = nodeAt(st, target.parent);
      const from = nodeAt(st, sp.parent)!;
      if (!p || p.type !== 'dir') err += `mv: não foi possível mover '${src}' para '${dest}': Arquivo ou diretório inexistente\n`;
      else if (!can(st, p, 2) || !can(st, from, 2)) err += `mv: não foi possível mover '${src}': Permissão negada\n`;
      else {
        delete from.children[sp.name];
        p.children[target.name] = s;
      }
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  chmod: (st, a) => {
    const { flags, rest } = parseFlags(a.map((x) => (/^-[rwxX]/.test(x) && !/^-R$/.test(x) ? ' ' + x : x))); // "-x" é modo, não opção
    const args = rest.map((x) => x.trim());
    if (args.length < 2) return bad('Uso: chmod MODO arquivo...  (ex.: chmod 755 arq  ou  chmod +x arq)\n');
    const [spec, ...targets] = args;
    let err = '';
    targets.forEach((t) => {
      const n = nodeAt(st, resolvePath(st, t));
      if (!n) {
        err += `chmod: não foi possível acessar '${t}': Arquivo ou diretório inexistente\n`;
        return;
      }
      if (n.owner !== st.user) {
        err += `chmod: alterando as permissões de '${t}': Operação não permitida\n`;
        return;
      }
      const apply = (x: FsNode) => {
        const m = applyMode(x.mode, spec, x.type === 'dir');
        if (m === null) {
          err = `chmod: modo inválido: '${spec}'\n`;
          return;
        }
        x.mode = m;
        if (flags.has('R')) Object.values(x.children).forEach(apply);
      };
      apply(n);
    });
    return { out: '', err, code: err ? 1 : 0 };
  },

  chown: (st, a) => bad(`chown: alterando o dono de '${a[a.length - 1] ?? ''}': Operação não permitida (só o root pode)\n`),

  find: (st, a) => {
    let start = '.';
    const opts: string[] = [];
    a.forEach((x, i) => {
      if (i === 0 && !x.startsWith('-')) start = x;
      else opts.push(x);
    });
    const nameIdx = opts.indexOf('-name');
    const typeIdx = opts.indexOf('-type');
    const re = nameIdx >= 0 ? globToRegExp(opts[nameIdx + 1] ?? '*') : null;
    const type = typeIdx >= 0 ? opts[typeIdx + 1] : null;
    const abs = resolvePath(st, start);
    const root = nodeAt(st, abs);
    if (!root) return bad(`find: '${start}': Arquivo ou diretório inexistente\n`);
    const out: string[] = [];
    walk(root, abs, (p, n) => {
      const nm = p.split('/').pop() ?? '';
      if (re && !re.test(nm)) return;
      if (type === 'f' && n.type !== 'file') return;
      if (type === 'd' && n.type !== 'dir') return;
      out.push(start === '.' ? (p === st.cwd ? '.' : '.' + p.slice(st.cwd.length)) : start === abs ? p : p.replace(abs, start));
    });
    return ok(withNl(out));
  },

  tree: (st, a) => {
    const start = a[0] ?? '.';
    const n = nodeAt(st, resolvePath(st, start));
    if (!n) return bad(`tree: ${start}: Arquivo ou diretório inexistente\n`);
    let dirs = 0;
    let files = 0;
    const out: string[] = [start];
    const rec = (d: FsNode, prefix: string) => {
      const names = Object.keys(d.children).filter((x) => !x.startsWith('.')).sort();
      names.forEach((nm, i) => {
        const last = i === names.length - 1;
        out.push(`${prefix}${last ? '└── ' : '├── '}${nm}`);
        if (d.children[nm].type === 'dir') {
          dirs++;
          rec(d.children[nm], prefix + (last ? '    ' : '│   '));
        } else files++;
      });
    };
    if (n.type === 'dir') rec(n, '');
    return ok(out.join('\n') + `\n\n${dirs} diretórios, ${files} arquivos\n`);
  },
};

const MANUAL: Record<string, string> = {
  ls: 'ls - lista o conteúdo de uma pasta. Opções: -l (detalhado), -a (inclui ocultos).',
  cd: 'cd - muda de pasta. "cd" sozinho vai para a sua pasta pessoal; "cd .." sobe um nível.',
  pwd: 'pwd - mostra a pasta em que você está.',
  cat: 'cat - mostra o conteúdo de um arquivo.',
  rm: 'rm - apaga arquivos. -r apaga pastas, -f não pergunta. Cuidado: não tem lixeira!',
  cp: 'cp origem destino - copia arquivos (-r para pastas).',
  mv: 'mv origem destino - move ou renomeia.',
  mkdir: 'mkdir pasta - cria uma pasta (-p cria o caminho inteiro).',
  touch: 'touch arquivo - cria um arquivo vazio ou atualiza a data dele.',
  chmod: 'chmod modo arquivo - muda permissões. 4=ler, 2=escrever, 1=executar. Ex.: chmod 755 arq, chmod +x arq.',
  grep: 'grep padrão arquivos - procura texto. -i ignora maiúsculas, -n mostra a linha, -r procura em pastas.',
  tar: 'tar - agrupa arquivos. cf cria, tf lista, xf extrai. Ex.: tar cf backup.tar documentos',
  ps: 'ps - lista processos. "ps aux" mostra todos, com detalhes.',
  kill: 'kill PID - encerra o processo com aquele número.',
  find: 'find pasta -name "*.txt" - procura arquivos pelo nome.',
  df: 'df -h - mostra o espaço dos discos.',
  ln: 'ln -s origem link - cria um atalho (link simbólico) para um arquivo.',
  gzip: 'gzip arquivo - comprime (vira arquivo.gz); gunzip desfaz.',
  systemctl: 'systemctl status nome - mostra se um serviço está rodando (start/stop pedem root).',
  sudo: 'sudo comando - roda como administrador. Aqui você não tem esse poder.',
  chown: 'chown dono arquivo - muda o dono; só o root pode.',
  top: 'top - mostra os processos que mais usam CPU e memória.',
  du: 'du -sh pasta - mostra o tamanho de uma pasta.',
};

const NET_NOTE = '(simulado: este terminal não tem acesso à internet)\n';

const EXTRA: Record<string, Impl> = {
  uptime: () => ok(' 16:40:12 up 2:14,  1 user,  load average: 0,12, 0,08, 0,05\n'),
  w: (st) => ok(` 16:40:12 up 2:14,  1 user,  load average: 0,12, 0,08, 0,05\nUSER     TTY      DESDE   COMANDO\n${st.user.padEnd(8)} pts/0    14:26   bash\n`),
  free: (_st, a) => {
    const h = a.includes('-h');
    return ok(
      h
        ? '               total        usado       livre\nMem:           3,9Gi       1,2Gi       1,5Gi\nSwap:          2,0Gi          0B       2,0Gi\n'
        : '               total        usado       livre\nMem:         4046848     1223636     1523212\nSwap:        2097148           0     2097148\n'
    );
  },
  df: (_st, a) => ok(a.includes('-h') ? 'Sist. Arq.     Tam. Usado Disp. Uso% Montado em\n/dev/sda1       40G   12G   26G  32% /\ntmpfs          2,0G     0  2,0G   0% /tmp\n' : 'Sist. Arq.   1K-blocos     Usado Disponível Uso% Montado em\n/dev/sda1     41943040  12582912   27262976  32% /\n'),
  du: (st, a) => {
    const { flags, rest } = parseFlags(a);
    const targets = rest.length ? rest : ['.'];
    let out = '';
    let err = '';
    targets.forEach((t) => {
      const n = nodeAt(st, resolvePath(st, t));
      if (!n) {
        err += `du: não foi possível acessar '${t}': Arquivo ou diretório inexistente\n`;
        return;
      }
      let total = 0;
      walk(n, '/', (_p, x) => {
        total += sizeOf(x);
      });
      const hum = total >= 1024 ? `${(total / 1024).toFixed(1).replace('.', ',')}K` : `${total}`;
      out += `${flags.has('h') || flags.has('s') ? hum : Math.ceil(total / 1024)}\t${t}\n`;
    });
    return { out, err, code: err ? 1 : 0 };
  },
  ps: (st, a) => {
    const aux = a.some((x) => x.includes('a') || x.includes('u') || x.includes('x'));
    const procs = [...st.procs, { pid: 300 + st.history.length, user: st.user, cmd: 'ps' }];
    if (!aux) return ok('  PID TTY          TIME CMD\n' + procs.filter((p) => p.user === st.user).map((p) => `${String(p.pid).padStart(5)} pts/0    00:00:00 ${p.cmd.split(' ')[0]}`).join('\n') + '\n');
    return ok('USUARIO   PID %CPU %MEM COMANDO\n' + procs.map((p) => `${p.user.padEnd(8)} ${String(p.pid).padStart(4)}  0,${p.pid % 9}  1,${p.pid % 7} ${p.cmd}`).join('\n') + '\n');
  },
  kill: (st, a) => {
    if (!a.length) return bad('kill: uso: kill PID\n');
    let err = '';
    a.filter((x) => !x.startsWith('-')).forEach((x) => {
      const pid = parseInt(x, 10);
      const p = st.procs.find((q) => q.pid === pid);
      if (!p) err += `kill: (${x}) - Nenhum processo encontrado\n`;
      else if (p.user !== st.user) err += `kill: (${x}) - Operação não permitida (processo de ${p.user})\n`;
      else if (p.cmd === 'bash') err += 'kill: este é o seu próprio terminal; deixe ele vivo :)\n';
      else st.procs = st.procs.filter((q) => q.pid !== pid);
    });
    return { out: '', err, code: err ? 1 : 0 };
  },
  killall: (st, a) => {
    if (!a[0]) return bad('killall: uso: killall nome\n');
    const alvo = st.procs.filter((p) => p.cmd.split(' ')[0] === a[0]);
    if (!alvo.length) return bad(`${a[0]}: nenhum processo encontrado\n`);
    if (alvo.some((p) => p.user !== st.user || p.cmd === 'bash')) return bad(`${a[0]}: Operação não permitida\n`);
    st.procs = st.procs.filter((p) => p.cmd.split(' ')[0] !== a[0]);
    return ok();
  },
  ping: (_st, a) => {
    const h = a.find((x) => !x.startsWith('-'));
    if (!h) return bad('ping: uso: ping destino\n');
    const t = [23.4, 21.9, 22.7, 24.1];
    return ok(`PING ${h} (93.184.216.34) 56 bytes de dados\n` + t.map((x, i) => `64 bytes de ${h}: icmp_seq=${i + 1} ttl=57 tempo=${x} ms`).join('\n') + `\n\n--- estatísticas de ${h} ---\n4 pacotes enviados, 4 recebidos, 0% de perda\n${NET_NOTE}`);
  },
  whois: (_st, a) => (a[0] ? ok(`Domínio: ${a[0]}\nResponsável: Exemplo Instituição\nCriado em: 2010-05-12\nServidores DNS: ns1.${a[0]}\n${NET_NOTE}`) : bad('whois: uso: whois domínio\n')),
  dig: (_st, a) => {
    if (!a.length) return bad('dig: uso: dig domínio  (ou  dig -x IP)\n');
    if (a[0] === '-x') return ok(`;; RESPOSTA: ${a[1] ?? ''}  PTR  servidor.exemplo.com.\n${NET_NOTE}`);
    return ok(`;; RESPOSTA\n${a[0]}.   300  IN  A  93.184.216.34\n${NET_NOTE}`);
  },
  wget: (st, a) => {
    const { flags, rest } = parseFlags(a);
    const url = rest[0];
    if (!url) return bad('wget: uso: wget URL\n');
    const name = url.split('/').filter(Boolean).pop() || 'index.html';
    const err = writeFile(st, name, `<html><body>Conteúdo simulado de ${url}</body></html>\n`, false);
    return err ? bad(err) : ok(`${flags.has('c') ? 'Continuando download...\n' : ''}'${name}' salvo [46 bytes]\n${NET_NOTE}`);
  },
  curl: (st, a) => {
    const { vals, rest } = parseFlags(a, ['o']);
    const url = rest[0];
    if (!url) return bad('curl: uso: curl URL  (ou  curl -o arquivo URL)\n');
    const html = `<html><body>Conteúdo simulado de ${url}</body></html>\n`;
    if (vals.o) {
      const err = writeFile(st, vals.o, html, false);
      return err ? bad(err) : ok(`Gravado em ${vals.o}\n`);
    }
    return ok(html);
  },
  ssh: (_st, a) => {
    const alvo = a.find((x) => !x.startsWith('-') && /@|\./.test(x));
    return bad(`ssh: não foi possível conectar${alvo ? ' em ' + alvo : ''}: ambiente simulado, sem rede.\n`, 255);
  },
  locate: (st, a) => {
    if (!a[0]) return bad('locate: uso: locate nome\n');
    const out: string[] = [];
    walk(st.root, '/', (p, n) => {
      if (n !== st.root && (p.split('/').pop() ?? '').includes(a[0])) out.push(p);
    });
    return out.length ? ok(withNl(out)) : { out: '', err: '', code: 1 };
  },
  whereis: (_st, a) => ok(a.map((c) => (COMMANDS[c] || ['cd', 'echo'].includes(c) ? `${c}: /usr/bin/${c}\n` : `${c}:\n`)).join('')),
  man: (_st, a) => {
    if (!a[0]) return bad('Qual manual você quer? Ex.: man ls\n');
    return MANUAL[a[0]] ? ok(`MANUAL: ${MANUAL[a[0]]}\n`) : bad(`Sem manual para ${a[0]}. Use help.\n`);
  },
  tar: (st, a) => {
    const flags = (a[0] ?? '').replace(/^-/, '');
    const archive = a[1];
    if (!flags || !archive) return bad('tar: uso: tar cf arquivo.tar pasta  |  tar tf arquivo.tar  |  tar xf arquivo.tar\n');
    const verbose = flags.includes('v');
    if (flags.includes('c')) {
      const files: Record<string, FsNode> = {};
      let err = '';
      a.slice(2).forEach((t) => {
        const n = nodeAt(st, resolvePath(st, t));
        if (!n) err += `tar: ${t}: Arquivo ou diretório inexistente\n`;
        else files[t] = n;
      });
      if (err) return bad(err);
      const w = writeFile(st, archive, 'TARv1:' + JSON.stringify(files), false);
      const lista = verbose ? Object.keys(files).map((f) => f + '\n').join('') : '';
      return w ? bad(w) : ok(lista);
    }
    const n = nodeAt(st, resolvePath(st, archive));
    if (!n || n.type !== 'file' || !n.content.startsWith('TARv1:')) return bad(`tar: ${archive}: não é um arquivo tar válido\n`);
    const files = JSON.parse(n.content.slice(6)) as Record<string, FsNode>;
    if (flags.includes('t')) {
      const out: string[] = [];
      Object.entries(files).forEach(([k, v]) => walk(v, k.replace(/\/$/, ''), (p) => out.push(p)));
      return ok(withNl(out));
    }
    if (flags.includes('x')) {
      let err = '';
      Object.entries(files).forEach(([k, v]) => {
        const { name } = splitParent(resolvePath(st, k));
        const p = nodeAt(st, st.cwd)!;
        if (!can(st, p, 2)) err += `tar: ${k}: Permissão negada\n`;
        else p.children[name] = JSON.parse(JSON.stringify(v));
      });
      return err ? bad(err) : ok(verbose ? Object.keys(files).map((f) => f + '\n').join('') : '');
    }
    return bad('tar: use c (criar), t (listar) ou x (extrair)\n');
  },
};
Object.assign(COMMANDS, EXTRA);

const SIM_ROOT = (st: ShellState, cmd: string): Cmd => bad(`${cmd}: permissão negada: só o administrador (root) pode fazer isso. Você é "${st.user}".\n`);

const EXTRA2: Record<string, Impl> = {
  who: (st) => ok(`${st.user}   pts/0   2026-11-11 14:26\n`),
  last: (st) => ok(`${st.user}   pts/0   rali-lab   Qua Nov 11 14:26   ainda logado\nreboot   system boot  6.1.0-rali   Qua Nov 11 14:24\n`),
  groups: (st) => ok(`${st.user} cdrom audio users\n`),
  su: (st) => bad(`su: falha de autenticação (${st.user} não conhece a senha de root)\n`),
  umask: () => ok('0022\n'),
  useradd: (st) => SIM_ROOT(st, 'useradd'),
  adduser: (st) => SIM_ROOT(st, 'adduser'),
  usermod: (st) => SIM_ROOT(st, 'usermod'),
  userdel: (st) => SIM_ROOT(st, 'userdel'),
  gpasswd: (st) => SIM_ROOT(st, 'gpasswd'),
  passwd: (st) => ok(`Alterando a senha de ${st.user}.\n(simulado: a senha não é alterada de verdade)\n`),
  mount: () => ok('/dev/sda1 on / type ext4 (rw,relatime)\ntmpfs on /tmp type tmpfs (rw)\nproc on /proc type proc (rw)\n'),
  umount: (st) => SIM_ROOT(st, 'umount'),
  fdisk: (st) => SIM_ROOT(st, 'fdisk'),
  parted: (st) => SIM_ROOT(st, 'parted'),
  mkfs: (st) => SIM_ROOT(st, 'mkfs'),
  fsck: (st) => SIM_ROOT(st, 'fsck'),
  lsblk: () => ok('NOME   TAM  TIPO PONTO DE MONTAGEM\nsda     40G  disk\n└─sda1  40G  part /\n'),
  blkid: () => ok('/dev/sda1: UUID="3f2a9c1e-77aa-4d10-9c3e-0b5f1d2e8a11" TYPE="ext4"\n'),
  lsof: (st) => ok('COMANDO  PID  USUARIO  ARQUIVO\nbash     101  ' + st.user + '    /home/aluno\nfirefox  150  ' + st.user + '    /home/aluno/downloads\n'),
  vmstat: () => ok('procs  memória   swap   cpu\n r  b   livre   si so  us sy id\n 0  0 1523212   0  0   2  1 97\n'),
  iostat: () => ok('CPU: %user 2,1  %system 1,0  %idle 96,9\nDispositivo   tps   kB_lidos/s\nsda          3,2   41,5\n'),
  top: (st) => ok('top - 16:40:12 up 2:14, 1 user, load average: 0,12\nTarefas: ' + (st.procs.length + 1) + ' total\n  PID USUARIO  %CPU %MEM COMANDO\n' + st.procs.map((p) => `${String(p.pid).padStart(5)} ${p.user.padEnd(8)} 0,${p.pid % 9}  1,${p.pid % 7} ${p.cmd}`).join('\n') + '\n(foto do momento; no Linux de verdade o top atualiza sozinho. Saia com q)\n'),
  htop: (st) => COMMANDS.top(st, [], ''),
  pkill: (st, a) => COMMANDS.killall(st, a, ''),
  nice: (st, a) => (a.length ? COMMANDS.echo(st, ['(simulado) rodaria com prioridade menor:', ...a.filter((x) => x !== '-n' && !/^-?\d+$/.test(x))], '') : ok('0\n')),
  renice: () => ok('(simulado) prioridade alterada\n'),
  jobs: () => ok(''),
  bg: () => bad('bg: não há tarefas suspensas\n'),
  fg: () => bad('fg: não há tarefas em segundo plano\n'),
  strace: (_st, a) => ok(`execve("/usr/bin/${a[0] ?? 'programa'}", ...) = 0\nbrk(NULL) = 0x55d4c0\nopenat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY) = 3\nwrite(1, "...", 12) = 12\nexit_group(0) = ?\n(simulado: só um exemplo do que o strace mostra)\n`),
  systemctl: (st, a) => {
    const [acao, srv] = a;
    if (acao === 'status') return ok(`● ${srv ?? 'sistema'}.service - serviço de exemplo\n   Ativo: ativo (rodando) desde Qua 2026-11-11 14:24\n`);
    if (['start', 'stop', 'restart', 'enable', 'disable'].includes(acao)) return SIM_ROOT(st, 'systemctl ' + acao);
    return bad('Uso: systemctl status|start|stop|restart nome\n');
  },
  service: (st, a) => COMMANDS.systemctl(st, [a[1] ?? '', a[0] ?? ''], ''),
  apt: (st, a) => (a[0] === 'list' || a[0] === 'search' ? ok('git/estável 2.39 amd64\nnano/estável 7.2 amd64\nhtop/estável 3.2 amd64\n') : SIM_ROOT(st, 'apt ' + (a[0] ?? ''))),
  'apt-get': (st, a) => SIM_ROOT(st, 'apt-get ' + (a[0] ?? '')),
  'apt-cache': (_st, a) => ok(a[0] === 'search' ? 'htop - visualizador de processos interativo\n' : 'apt-cache: use  apt-cache search nome\n'),
  dpkg: (st, a) => (a[0] === '-l' ? ok('ii  bash   5.2  shell\nii  coreutils  9.1  comandos básicos\n') : SIM_ROOT(st, 'dpkg')),
  yum: (st) => SIM_ROOT(st, 'yum'),
  dnf: (st) => SIM_ROOT(st, 'dnf'),
  rpm: (st) => SIM_ROOT(st, 'rpm'),
  pacman: (st) => SIM_ROOT(st, 'pacman'),
  snap: (st, a) => (a[0] === 'list' ? ok('Nome  Versão\ncore  16\n') : SIM_ROOT(st, 'snap')),
  flatpak: (st) => SIM_ROOT(st, 'flatpak'),
  brew: () => bad('brew: não instalado neste terminal simulado\n'),
  ifconfig: () => ok('eth0: flags=UP,BROADCAST,RUNNING\n      inet 192.168.0.23  máscara 255.255.255.0  broadcast 192.168.0.255\nlo:   inet 127.0.0.1  máscara 255.0.0.0\n' + NET_NOTE),
  ip: (_st, a) => (a[0] === 'addr' || a[0] === 'a' ? ok('1: lo    inet 127.0.0.1/8\n2: eth0  inet 192.168.0.23/24\n') : ok('default via 192.168.0.1 dev eth0\n192.168.0.0/24 dev eth0\n')),
  netstat: () => ok('Proto  Endereço local   Estado\ntcp    0.0.0.0:22       OUVINDO\ntcp    0.0.0.0:80       OUVINDO\ntcp    192.168.0.23:5432  ESTABELECIDA\n'),
  ss: () => COMMANDS.netstat(null as never, [], ''),
  traceroute: (_st, a) => ok(`traceroute para ${a[0] ?? 'destino'}\n 1  192.168.0.1  1,2 ms\n 2  10.10.0.1  8,4 ms\n 3  200.17.141.1  15,7 ms\n 4  ${a[0] ?? 'destino'}  23,0 ms\n${NET_NOTE}`),
  nslookup: (_st, a) => (a[0] ? ok(`Servidor:  192.168.0.1\nNome:      ${a[0]}\nEndereço:  93.184.216.34\n${NET_NOTE}`) : bad('nslookup: uso: nslookup domínio\n')),
  scp: (_st, a) => bad(`scp: não foi possível copiar ${a[0] ?? ''}: ambiente simulado, sem rede.\n`, 1),
  nmap: (_st, a) => ok(`Varredura em ${a[0] ?? '192.168.0.1'} (simulada)\nPORTA   ESTADO  SERVIÇO\n22/tcp  aberta  ssh\n80/tcp  aberta  http\n443/tcp fechada https\n${NET_NOTE}(use nmap só em redes que você tem autorização para testar!)\n`),
  tcpdump: (st) => SIM_ROOT(st, 'tcpdump'),
  less: (st, a, stdin) => COMMANDS.cat(st, a, stdin),
  more: (st, a, stdin) => COMMANDS.cat(st, a, stdin),
  sleep: () => ok(''),
  basename: (_st, a) => ok((a[0] ?? '').split('/').filter(Boolean).pop() + '\n'),
  dirname: (_st, a) => ok('/' + (a[0] ?? '').split('/').filter(Boolean).slice(0, -1).join('/') + '\n'),
  stat: (st, a) => {
    const n = nodeAt(st, resolvePath(st, a[0] ?? ''));
    return n ? ok(`  Arquivo: ${a[0]}\n  Tamanho: ${sizeOf(n)}   Tipo: ${n.type === 'dir' ? 'diretório' : 'arquivo'}\n  Acesso: (${n.mode.toString(8).padStart(4, '0')}/${modeStr(n)})  Dono: ${n.owner}\n`) : bad(`stat: não foi possível obter estado de '${a[0] ?? ''}': Arquivo ou diretório inexistente\n`);
  },
  diff: (st, a) => {
    const r = readInputs(st, a.slice(0, 2), '', 'diff');
    if (r.code || r.named.length < 2) return { out: '', err: r.err, code: 2 };
    const x = lines(r.named[0].text);
    const y = lines(r.named[1].text);
    let out = '';
    for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) out += `${i + 1}c${i + 1}\n${x[i] !== undefined ? '< ' + x[i] + '\n' : ''}---\n${y[i] !== undefined ? '> ' + y[i] + '\n' : ''}`;
    return { out, err: '', code: out ? 1 : 0 };
  },
  ln: (st, a) => {
    const { flags, rest } = parseFlags(a);
    if (rest.length < 2) return bad('ln: uso: ln -s origem nome_do_link\n');
    const src = nodeAt(st, resolvePath(st, rest[0]));
    if (!src) return bad(`ln: não foi possível acessar '${rest[0]}': Arquivo ou diretório inexistente\n`);
    const err = writeFile(st, rest[1], flags.has('s') ? '' : src.content, false);
    if (err) return bad(err);
    if (flags.has('s')) {
      const l = nodeAt(st, resolvePath(st, rest[1]))!;
      l.link = rest[0];
      l.mode = 0o777;
    }
    return ok();
  },
  gzip: (st, a) => {
    let err = '';
    a.filter((x) => !x.startsWith('-')).forEach((nm) => {
      const abs = resolvePath(st, nm);
      const n = nodeAt(st, abs);
      if (!n || n.type !== 'file') err += `gzip: ${nm}: Arquivo inexistente\n`;
      else {
        const e = writeFile(st, nm + '.gz', 'GZv1:' + n.content, false);
        if (e) err += e;
        else delete nodeAt(st, splitParent(abs).parent)!.children[splitParent(abs).name];
      }
    });
    return { out: '', err, code: err ? 1 : 0 };
  },
  gunzip: (st, a) => {
    let err = '';
    a.forEach((nm) => {
      const abs = resolvePath(st, nm);
      const n = nodeAt(st, abs);
      if (!n || !n.content.startsWith('GZv1:') || !nm.endsWith('.gz')) err += `gunzip: ${nm}: não está em formato gzip\n`;
      else {
        const e = writeFile(st, nm.slice(0, -3), n.content.slice(5), false);
        if (e) err += e;
        else delete nodeAt(st, splitParent(abs).parent)!.children[splitParent(abs).name];
      }
    });
    return { out: '', err, code: err ? 1 : 0 };
  },
  zip: (st, a) => {
    const { flags, rest } = parseFlags(a);
    if (rest.length < 2) return bad('zip: uso: zip arquivo.zip pasta_ou_arquivos...\n');
    return COMMANDS.tar(st, [flags.has('r') ? 'cvf' : 'cvf', ...rest], '');
  },
  unzip: (st, a) => COMMANDS.tar(st, ['xvf', a[0] ?? ''], ''),
  rsync: (st, a) => {
    const { rest } = parseFlags(a);
    return rest.length >= 2 ? COMMANDS.cp(st, ['-r', ...rest], '') : bad('rsync: uso: rsync -av origem destino\n');
  },
};
Object.assign(COMMANDS, EXTRA2);

// ---------- execução ----------

function runCommand(st: ShellState, words: string[], stdin: string): Cmd {
  const [name, ...args] = words;
  if (!name) return ok();
  // VAR=valor
  const asg = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(name);
  if (asg && args.length === 0) {
    st.env[asg[1]] = asg[2];
    return ok();
  }
  if (name === 'export') {
    args.forEach((x) => {
      const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(x);
      if (m) st.env[m[1]] = m[2];
    });
    return ok();
  }
  if (name === 'bash' || name === 'sh' || name.startsWith('./') || name.startsWith('/') || name.includes('/')) {
    const path = name === 'bash' || name === 'sh' ? args[0] : name;
    if (!path) return ok();
    const n = nodeAt(st, resolvePath(st, path));
    if (!n) return bad(`${name}: ${path}: Arquivo ou diretório inexistente\n`, 127);
    if (n.type === 'dir') return bad(`${name}: ${path}: É um diretório\n`, 126);
    const viaShell = name === 'bash' || name === 'sh';
    if (!can(st, n, viaShell ? 4 : 1)) return bad(`${name}: ${path}: Permissão negada\n`, 126);
    if (st.depth > 3) return bad('script: recursão demais\n');
    st.depth++;
    let out = '';
    let err = '';
    let code = 0;
    for (const l of n.content.split('\n')) {
      const r = execLine(st, l, false);
      out += r.out;
      code = st.lastCode;
    }
    st.depth--;
    return { out, err, code };
  }
  const impl = COMMANDS[name];
  if (!impl) return bad(`${name}: comando não encontrado\n`, 127);
  return impl(st, args, stdin);
}

function writeFile(st: ShellState, path: string, text: string, append: boolean): string {
  const abs = resolvePath(st, path);
  const ex = nodeAt(st, abs);
  if (ex) {
    if (ex.type === 'dir') return `bash: ${path}: É um diretório\n`;
    if (!can(st, ex, 2)) return `bash: ${path}: Permissão negada\n`;
    ex.content = append ? ex.content + text : text;
    ex.mtime = Date.now();
    return '';
  }
  const { parent, name } = splitParent(abs);
  const p = nodeAt(st, parent);
  if (!p || p.type !== 'dir') return `bash: ${path}: Arquivo ou diretório inexistente\n`;
  if (!can(st, p, 2)) return `bash: ${path}: Permissão negada\n`;
  p.children[name] = { ...file(text, 0o644, st.user), mtime: Date.now() };
  return '';
}

/** Executa uma linha (com ; && | > >>). Devolve o que deve aparecer na tela. */
function execLine(st: ShellState, line: string, record: boolean): ShellResult {
  let toks: Tok[];
  try {
    toks = tokenize(st, line);
  } catch (e) {
    st.lastCode = 2;
    return { out: `bash: erro de sintaxe: ${(e as Error).message}\n` };
  }
  // quebra em comandos por ; e &&
  const groups: { toks: Tok[]; cond: boolean }[] = [];
  let cur: Tok[] = [];
  let cond = false;
  toks.forEach((t) => {
    if (t.op === ';' || t.op === '&&') {
      groups.push({ toks: cur, cond });
      cur = [];
      cond = t.op === '&&';
    } else cur.push(t);
  });
  groups.push({ toks: cur, cond });

  let screen = '';
  let clear = false;
  for (const g of groups) {
    if (g.cond && st.lastCode !== 0) continue;
    if (g.toks.length === 0) continue;
    // pipeline
    const stages: Tok[][] = [[]];
    g.toks.forEach((t) => (t.op === '|' ? stages.push([]) : stages[stages.length - 1].push(t)));
    let stdin = '';
    let code = 0;
    let err = '';
    for (let i = 0; i < stages.length; i++) {
      let redir: { path: string; append: boolean } | null = null;
      const words: string[] = [];
      const st2 = stages[i];
      for (let k = 0; k < st2.length; k++) {
        const t = st2[k];
        if (t.op === '>' || t.op === '>>') {
          const target = st2[k + 1];
          if (!target) {
            err += 'bash: erro de sintaxe: faltou o arquivo depois do >\n';
            code = 2;
            break;
          }
          redir = { path: target.text, append: t.op === '>>' };
          k++;
        } else words.push(...expandGlobs(st, t));
      }
      if (code === 2 && err) break;
      if (words[0] === 'clear') {
        clear = true;
        screen = '';
        stdin = '';
        continue;
      }
      if (words[0] === 'reset') {
        const fresh = createShell();
        st.root = fresh.root;
        st.cwd = fresh.cwd;
        st.env = fresh.env;
        screen += 'Sistema de arquivos restaurado ao início.\n';
        code = 0;
        continue;
      }
      st.piped = i < stages.length - 1 || redir !== null;
      const r = runCommand(st, words, stdin);
      st.piped = false;
      err += r.err;
      code = r.code;
      if (redir) {
        err += writeFile(st, redir.path, r.out, redir.append);
        stdin = '';
      } else stdin = r.out;
    }
    st.lastCode = code;
    screen += stdin + err;
  }
  if (record && line.trim()) st.history.push(line.trim());
  return { out: screen, clear };
}

export function runLine(st: ShellState, line: string): ShellResult {
  if (line.length > 500) return { out: 'bash: linha muito longa\n' };
  return execLine(st, line, true);
}

/** Autocompletar com TAB: comando (primeira palavra) ou caminho. */
export function complete(st: ShellState, line: string): { line: string; options: string[] } {
  const m = /^(.*?)(\S*)$/.exec(line)!;
  const before = m[1];
  const word = m[2];
  const first = before.trim() === '';
  let cands: string[];
  let base = '';
  if (first && !word.includes('/')) {
    cands = [...Object.keys(COMMANDS), 'clear', 'reset', 'export'].filter((c) => c.startsWith(word));
  } else {
    const idx = word.lastIndexOf('/');
    base = idx >= 0 ? word.slice(0, idx + 1) : '';
    const part = idx >= 0 ? word.slice(idx + 1) : word;
    const d = nodeAt(st, resolvePath(st, base || '.'));
    cands = d && d.type === 'dir' ? Object.keys(d.children).filter((n) => n.startsWith(part) && (part.startsWith('.') || !n.startsWith('.'))).map((n) => base + n + (d.children[n.slice(0)].type === 'dir' ? '/' : '')) : [];
  }
  cands.sort();
  if (cands.length === 1) return { line: before + cands[0] + (cands[0].endsWith('/') ? '' : ' '), options: [] };
  if (cands.length > 1) {
    let pre = cands[0];
    cands.forEach((c) => {
      while (!c.startsWith(pre)) pre = pre.slice(0, -1);
    });
    return { line: before + (pre.length > word.length ? pre : word), options: cands };
  }
  return { line, options: [] };
}
