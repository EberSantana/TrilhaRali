import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShell, runLine, complete, promptOf } from './shell.ts';

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
