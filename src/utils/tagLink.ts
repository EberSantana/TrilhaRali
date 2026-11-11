const TAG_RE = /^(tag|linux)_[a-z0-9_]+$/i;

/** Endereço que abre o app direto numa missão: ...#/tag/tag_07 (serve para NFC e QR code). */
export function buildTagLink(base: string, tagId: string): string {
  return `${base.replace(/[#?].*$/, '')}#/tag/${tagId}`;
}

/**
 * Lê a tag pedida no endereço: #/tag/tag_07, #/?tag=tag_07 ou ?tag=tag_07.
 * Retorna null se não houver tag válida.
 */
export function parseTagFromLocation(hash: string, search = ''): string | null {
  const fromPath = hash.match(/^#\/tag\/([^/?&#]+)/i);
  let raw = fromPath ? fromPath[1] : null;
  if (!raw) {
    const q = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
    raw = new URLSearchParams(q).get('tag') || new URLSearchParams(search).get('tag');
  }
  if (!raw) return null;
  let tag = raw;
  try {
    tag = decodeURIComponent(raw);
  } catch {
    return null;
  }
  tag = tag.trim().toLowerCase();
  return TAG_RE.test(tag) ? tag : null;
}
