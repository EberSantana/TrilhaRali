// Edição do gabarito protegido das missões prontas.
//   node scripts/gabarito.mjs abrir   -> cria gabarito.json (texto claro, FORA do Git) a partir de src/data/gabarito.enc.json
//   node scripts/gabarito.mjs fechar  -> criptografa gabarito.json de volta em src/data/gabarito.enc.json
// A chave é a do banco do professor: variável GABARITO_CHAVE ou arquivo .gabarito-chave na raiz (ambos fora do Git).
// Se a chave do banco for trocada (setupBanco), rode "abrir" com a chave antiga e "fechar" com a nova.
import fs from 'node:fs';
import crypto from 'node:crypto';

const ENC = 'src/data/gabarito.enc.json';
const CLARO = 'gabarito.json';
const chave = (process.env.GABARITO_CHAVE || (fs.existsSync('.gabarito-chave') ? fs.readFileSync('.gabarito-chave', 'utf8') : '')).trim();
if (!chave) throw new Error('Defina GABARITO_CHAVE ou crie .gabarito-chave com a chave do banco.');
const cmd = process.argv[2];
if (cmd === 'abrir') {
  const c = JSON.parse(fs.readFileSync(ENC, 'utf8'));
  const k = crypto.pbkdf2Sync(chave, Buffer.from(c.salt, 'base64'), c.iter, 32, 'sha256');
  const d = Buffer.from(c.data, 'base64');
  const dec = crypto.createDecipheriv('aes-256-gcm', k, Buffer.from(c.iv, 'base64'));
  dec.setAuthTag(d.subarray(d.length - 16));
  fs.writeFileSync(CLARO, JSON.stringify(JSON.parse(Buffer.concat([dec.update(d.subarray(0, d.length - 16)), dec.final()]).toString('utf8')), null, 1));
  console.log(`Gabarito aberto em ${CLARO}. Não faça commit deste arquivo.`);
} else if (cmd === 'fechar') {
  const plano = fs.readFileSync(CLARO, 'utf8');
  JSON.parse(plano);
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12), iter = 200000;
  const k = crypto.pbkdf2Sync(chave, salt, iter, 32, 'sha256');
  const c = crypto.createCipheriv('aes-256-gcm', k, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(JSON.parse(plano)), 'utf8'), c.final(), c.getAuthTag()]);
  fs.writeFileSync(ENC, JSON.stringify({ v: 1, iter, salt: salt.toString('base64'), iv: iv.toString('base64'), data: ct.toString('base64') }) + '\n');
  console.log(`Gabarito criptografado em ${ENC}.`);
} else {
  console.log('Uso: node scripts/gabarito.mjs abrir | fechar');
}
