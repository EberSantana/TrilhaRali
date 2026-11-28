// Teste de carga da entrada de duplas.
// Uso: npx tsx scripts/teste-carga.mts <URL_/exec> <TOKEN_DA_SALA> [duplas=20]
// ATENÇÃO: cria alunos de teste ("CARGA 01", ...) na planilha. Use uma sala de teste e apague depois.
const [url, token, n = '20'] = process.argv.slice(2);
if (!url || !token) { console.error('Uso: npx tsx scripts/teste-carga.mts <URL> <TOKEN> [duplas]'); process.exit(1); }
const total = Math.max(1, Math.min(60, Number(n) || 20));

async function entrar(i: number) {
  const nome = `CARGA ${String(i + 1).padStart(2, '0')}`;
  const t0 = Date.now();
  let tentativas = 0;
  for (;;) {
    tentativas++;
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'join', token, nome }), redirect: 'follow' });
      const d: any = await r.json();
      if (d.error && /lock|bloqueio|tempo limite|too many|muitas vezes/i.test(String(d.error)) && tentativas < 5) { await new Promise((ok) => setTimeout(ok, 1200 * tentativas + Math.random() * 600)); continue; }
      return { nome, ok: !d.error, erro: d.error as string | undefined, ms: Date.now() - t0, tentativas };
    } catch (e) {
      return { nome, ok: false, erro: String(e), ms: Date.now() - t0, tentativas };
    }
  }
}

const ini = Date.now();
const res = await Promise.all(Array.from({ length: total }, (_, i) => entrar(i)));
const ok = res.filter((r) => r.ok);
const ms = res.map((r) => r.ms).sort((a, b) => a - b);
console.log(`Duplas: ${total} | entraram: ${ok.length} | falharam: ${total - ok.length} | total ${((Date.now() - ini) / 1000).toFixed(1)}s`);
console.log(`Tempo por entrada: mediana ${ms[Math.floor(ms.length / 2)]}ms, pior ${ms[ms.length - 1]}ms | com repetição: ${res.filter((r) => r.tentativas > 1).length}`);
res.filter((r) => !r.ok).forEach((r) => console.log(`  ✗ ${r.nome}: ${r.erro}`));
