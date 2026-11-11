import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShell, runLine, complete, promptOf, aguardandoTexto } from './shell.ts';

const run = (st: ReturnType<typeof createShell>, l: string) => runLine(st, l).out;

test('navegação básica', () => {
  const st = createShell();
  assert.equal(run(st, 'pwd'), '/home/aluno\n');
  assert.match(run(st, 'ls'), /documentos {2}downloads {2}notas.txt {2}projetos/);
  run(st, 'cd documentos');
  assert.equal(promptOf(st), 'aluno@rali-lab:~/documentos$');
  run(st, 'cd ..');
  assert.equal(st.cwd, '/home/aluno');
  assert.match(run(st, 'cd /nada'), /inexistente/);
});

test('criar, copiar, mover, apagar', () => {
  const st = createShell();
  run(st, 'mkdir -p a/b && touch a/b/x.txt');
  assert.equal(run(st, 'ls a/b'), 'x.txt\n');
  run(st, 'cp a/b/x.txt a/y.txt');
  run(st, 'mv a/y.txt a/z.txt');
  assert.equal(run(st, 'ls a'), 'b  z.txt\n');
  assert.match(run(st, 'rm a'), /É um diretório/);
  run(st, 'rm -r a');
  assert.match(run(st, 'ls a'), /inexistente/);
});

test('pipes, redirecionamento e filtros', () => {
  const st = createShell();
  run(st, 'echo ola > t.txt');
  run(st, 'echo mundo >> t.txt');
  assert.equal(run(st, 'cat t.txt'), 'ola\nmundo\n');
  assert.equal(run(st, 'cat documentos/lista_compras.txt | sort | uniq'), 'acucar\narroz\ncafe\nfeijao\nleite\n');
  assert.equal(run(st, 'grep -c cafe documentos/lista_compras.txt'), '2\n');
  assert.equal(run(st, 'cat documentos/alunos.csv | cut -d , -f 1 | head -2'), 'nome\nAna\n');
  assert.equal(run(st, 'wc -l documentos/relatorio.txt'), '5 documentos/relatorio.txt\n');
  assert.equal(run(st, 'grep -i ERRO /var/log/sistema.log | wc -l'), '3\n');
});

test('permissões e chmod', () => {
  const st = createShell();
  assert.match(run(st, 'cat segredo.txt'), /Permissão negada/);
  run(st, 'chmod 644 segredo.txt');
  assert.match(run(st, 'cat segredo.txt'), /rali2026/);
  assert.match(run(st, './projetos/script.sh'), /Permissão negada/);
  run(st, 'chmod +x projetos/script.sh');
  assert.match(run(st, './projetos/script.sh'), /Ola do script!/);
  assert.match(run(st, 'ls -l projetos/script.sh'), /^-rwxr-xr-x/);
  assert.match(run(st, 'echo x > /etc/hostname'), /Permissão negada/);
  assert.match(run(st, 'sudo ls'), /sudoers/);
});

test('variáveis, aspas, erros e reset', () => {
  const st = createShell();
  assert.equal(run(st, 'echo "oi $USER"'), 'oi aluno\n');
  assert.equal(run(st, "echo '$USER'"), '$USER\n');
  assert.match(run(st, 'foo'), /comando não encontrado/);
  run(st, 'rm -r documentos');
  run(st, 'reset');
  assert.match(run(st, 'ls'), /documentos/);
  assert.equal(runLine(st, 'clear').clear, true);
});

test('autocompletar', () => {
  const st = createShell();
  assert.equal(complete(st, 'cd doc').line, 'cd documentos/');
  assert.equal(complete(st, 'pw').line, 'pwd ');
});

test('módulo Linux: sistema, processos, rede simulada e tar', () => {
  const st = createShell();
  assert.match(run(st, 'free -h'), /Mem:/);
  assert.match(run(st, 'df -h'), /\/dev\/sda1/);
  assert.match(run(st, 'cat /proc/meminfo'), /MemTotal/);
  assert.match(run(st, 'ps aux'), /firefox/);
  run(st, 'kill 150');
  assert.doesNotMatch(run(st, 'ps aux'), /firefox/);
  assert.match(run(st, 'kill 1'), /Operação não permitida/);
  assert.match(run(st, 'ping google.com'), /4 recebidos/);
  run(st, 'curl -o p.html https://exemplo.com');
  assert.match(run(st, 'cat p.html'), /simulado/);
  run(st, 'tar cf bk.tar documentos');
  assert.match(run(st, 'tar tf bk.tar'), /documentos\/relatorio.txt/);
  run(st, 'rm -r documentos');
  run(st, 'tar xf bk.tar');
  assert.match(run(st, 'ls documentos'), /relatorio.txt/);
  assert.match(run(st, 'grep -r Erro documentos'), /relatorio.txt:Erro na linha 4/);
  assert.match(run(st, 'locate relatorio'), /\/home\/aluno\/documentos\/relatorio.txt/);
  assert.match(run(st, 'man chmod'), /MANUAL/);
  assert.match(run(st, 'du -sh documentos'), /documentos/);
});

test('módulo Linux 2: usuários, pacotes, disco, links e gzip', () => {
  const st = createShell();
  assert.match(run(st, 'apt install htop'), /só o administrador/);
  assert.match(run(st, 'useradd joao'), /só o administrador/);
  assert.match(run(st, 'systemctl status ssh'), /ativo/);
  assert.match(run(st, 'systemctl stop ssh'), /administrador/);
  assert.match(run(st, 'lsblk'), /sda1/);
  assert.match(run(st, 'top'), /PID/);
  assert.match(run(st, 'uname -r'), /6\.1/);
  assert.match(run(st, 'ss'), /OUVINDO/);
  run(st, 'ln -s documentos/relatorio.txt atalho');
  assert.match(run(st, 'ls -l atalho'), /^lrwx.*atalho -> documentos\/relatorio.txt/);
  assert.match(run(st, 'cat atalho'), /Relatorio de redes/);
  run(st, 'gzip notas.txt');
  assert.match(run(st, 'ls'), /notas.txt.gz/);
  run(st, 'gunzip notas.txt.gz');
  assert.match(run(st, 'cat notas.txt'), /Aula de Linux/);
  run(st, 'zip p.zip documentos');
  run(st, 'rm -r documentos');
  run(st, 'unzip p.zip');
  assert.match(run(st, 'ls documentos'), /alunos.csv/);
  assert.match(run(st, 'diff notas.txt notas.txt'), /^$/);
  assert.match(run(st, 'stat notas.txt'), /Dono: aluno/);
});

test('variável na mesma linha, cd -, echo -e, ls -R, true/false', () => {
  const st = createShell();
  assert.match(runLine(st, 'X=5; echo $X').out, /^5\n/);
  assert.match(runLine(st, 'Y=ola && echo "$Y mundo"').out, /ola mundo/);
  runLine(st, 'cd /etc');
  assert.match(runLine(st, 'cd -').out, /^\/home\/aluno\n?|^\/home/);
  assert.match(runLine(st, 'echo -e "a\\nb"').out, /a\nb/);
  assert.match(runLine(st, 'ls -R /home').out, /\/home:/);
  runLine(st, 'false');
  assert.match(runLine(st, 'true && echo ok').out, /ok/);
  assert.equal(runLine(st, 'false && echo nao').out.trim(), '');
});

test('|| e cat > arquivo interativo', () => {
  const st = createShell();
  assert.match(runLine(st, 'false || echo plano-b').out, /plano-b/);
  assert.equal(runLine(st, 'true || echo nunca').out.includes('nunca'), false);
  assert.match(runLine(st, 'ls /naoexiste || echo falhou').out, /falhou/);
  runLine(st, 'cat > nota.txt');
  assert.equal(aguardandoTexto(st), true);
  assert.equal(promptOf(st), '>');
  runLine(st, 'linha um');
  runLine(st, 'linha dois');
  runLine(st, '\x04');
  assert.equal(aguardandoTexto(st), false);
  assert.equal(runLine(st, 'cat nota.txt').out, 'linha um\nlinha dois\n');
  runLine(st, 'cat >> nota.txt');
  runLine(st, 'tres');
  runLine(st, '\x04');
  assert.match(runLine(st, 'wc -l nota.txt').out, /3/);
});
