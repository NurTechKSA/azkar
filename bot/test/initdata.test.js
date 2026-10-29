'use strict';
// Проверка Telegram initData Mini App. Запуск: cd bot && npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { checkInitData } = require('../initdata');

const TOKEN = '900000000:UNIT_TEST_ONLY';
const now = () => Math.floor(Date.now() / 1000);
function sign(fields) {
  const p = new URLSearchParams({ user: JSON.stringify({ id: 42, first_name: 'Тест' }), auth_date: String(now()), ...fields });
  const dcs = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  p.set('hash', crypto.createHmac('sha256', secret).update(dcs).digest('hex'));
  return p.toString();
}

test('верная подпись проходит', () => {
  assert.equal(checkInitData(sign({}), TOKEN).id, 42);
});
test('испорченная подпись и отсутствие hash отклоняются', () => {
  const s = sign({});
  assert.equal(checkInitData(s.replace(/hash=[0-9a-f]/, 'hash=x'), TOKEN), null);
  assert.equal(checkInitData(s.replace(/&?hash=[0-9a-f]+/, ''), TOKEN), null);
  assert.equal(checkInitData(sign({}).replace('%D0%A2', '%D0%A3'), TOKEN), null);
});
test('просроченный auth_date отклоняется, срок задаётся параметром', () => {
  assert.equal(checkInitData(sign({ auth_date: String(now() - 90000) }), TOKEN), null);
  assert.equal(checkInitData(sign({ auth_date: String(now() - 90000) }), TOKEN, { maxAgeSec: 100000 }).id, 42);
  assert.equal(checkInitData(sign({ auth_date: '' }), TOKEN), null);
  assert.equal(checkInitData(sign({ auth_date: String(now() + 3600) }), TOKEN), null);
});
