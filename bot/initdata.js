'use strict';
const crypto = require('crypto');

// Проверка подписи Telegram WebApp initData.
// Перехваченный initData не должен работать вечно: auth_date старше maxAgeSec
// (INITDATA_MAX_AGE_SEC, по умолчанию сутки) или из будущего отклоняется.
// Подпись сравнивается за постоянное время.
function checkInitData(initData, token, opts = {}) {
  if (!initData || !token) return null;
  const maxAgeSec = opts.maxAgeSec || parseInt(process.env.INITDATA_MAX_AGE_SEC || '86400', 10);
  const url = new URLSearchParams(initData);
  const hash = url.get('hash');
  if (!hash) return null;
  url.delete('hash');
  const dcs = [...url.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const calc = crypto.createHmac('sha256', secret).update(dcs).digest();
  const given = Buffer.from(hash, 'hex');
  if (given.length !== calc.length || !crypto.timingSafeEqual(given, calc)) return null;
  const authDate = parseInt(url.get('auth_date'), 10);
  const age = Date.now() / 1000 - authDate;
  if (!authDate || age > maxAgeSec || age < -300) return null;
  try { return JSON.parse(url.get('user')); } catch { return null; }
}

module.exports = { checkInitData };
