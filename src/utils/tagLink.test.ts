import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTagLink, parseTagFromLocation } from './tagLink';

test('monta o link da tag sem duplicar hash nem query', () => {
  assert.equal(buildTagLink('https://x.github.io/ralibd/', 'tag_07'), 'https://x.github.io/ralibd/#/tag/tag_07');
  assert.equal(buildTagLink('https://x.github.io/ralibd/#/ctf', 'tag_01'), 'https://x.github.io/ralibd/#/tag/tag_01');
});

test('lê a tag das formas aceitas', () => {
  assert.equal(parseTagFromLocation('#/tag/tag_07'), 'tag_07');
  assert.equal(parseTagFromLocation('#/tag/TAG_07'), 'tag_07');
  assert.equal(parseTagFromLocation('#/?tag=tag_12'), 'tag_12');
  assert.equal(parseTagFromLocation('#/tag/linux_07'), 'linux_07');
  assert.equal(parseTagFromLocation('#/tag/LINUX_51'), 'linux_51');
  assert.equal(parseTagFromLocation('', '?tag=tag_03'), 'tag_03');
});

test('ignora valores inválidos ou perigosos', () => {
  assert.equal(parseTagFromLocation('#/tag/'), null);
  assert.equal(parseTagFromLocation('#/tag/abc'), null);
  assert.equal(parseTagFromLocation('#/tag/%3Cscript%3E'), null);
  assert.equal(parseTagFromLocation('#/ctf?t=ABC123'), null);
  assert.equal(parseTagFromLocation('#/tag/%E0%A4%A'), null);
});
