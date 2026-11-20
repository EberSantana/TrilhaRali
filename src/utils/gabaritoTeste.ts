import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { aplicarGabarito, Gabarito, GabaritoCifrado } from './gabarito';
import type { Mission } from '../types';

/**
 * SÓ PARA OS TESTES: abre o gabarito criptografado com a chave do banco, lida da variável GABARITO_CHAVE ou do
 * arquivo .gabarito-chave na raiz (fora do Git). Sem a chave os testes que conferem respostas não rodam.
 */
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
function chave(): string {
  const env = process.env.GABARITO_CHAVE;
  if (env) return env.trim();
  const f = path.join(raiz, '.gabarito-chave');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  throw new Error('Gabarito fechado: defina GABARITO_CHAVE ou crie o arquivo .gabarito-chave com a chave do banco.');
}
let cache: Gabarito | null = null;
export function gabaritoAberto(): Gabarito {
  if (cache) return cache;
  const c = JSON.parse(fs.readFileSync(path.join(raiz, 'src/data/gabarito.enc.json'), 'utf8')) as GabaritoCifrado;
  const k = crypto.pbkdf2Sync(chave(), Buffer.from(c.salt, 'base64'), c.iter, 32, 'sha256');
  const dados = Buffer.from(c.data, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', k, Buffer.from(c.iv, 'base64'));
  d.setAuthTag(dados.subarray(dados.length - 16));
  cache = JSON.parse(Buffer.concat([d.update(dados.subarray(0, dados.length - 16)), d.final()]).toString('utf8'));
  return cache!;
}
export const comGabarito = (lista: Mission[]): Mission[] => aplicarGabarito(lista, gabaritoAberto());
