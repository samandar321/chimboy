/* eslint-env node */
// Vercel serverless function: POST /api/order
// Sends a new-order notification to Telegram. The bot token never reaches the browser.
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const PAYMENT_LABELS = {
  cash: 'Naqd (yetkazib berishda)',
  card: 'Uzcard / Humo',
  payme: 'Payme',
  click: 'Click',
};

const TIME_LABELS = {
  morning: '9:00 - 12:00',
  afternoon: '12:00 - 17:00',
  evening: '17:00 - 21:00',
};

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .slice(0, 300);

const money = (n) => `${String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;

const send = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export function buildMessage(o) {
  const d = o.delivery || {};
  const items = Array.isArray(o.items) ? o.items.slice(0, 50) : [];
  const lines = [
    `🛒 <b>Yangi buyurtma #${esc(o.orderNumber)}</b>`,
    '',
    `👤 ${esc(d.firstName)} ${esc(d.lastName)}`,
    `📞 +998 ${esc(d.phone)}`,
    `📍 ${esc(d.city)}, ${esc(d.address)}`,
    `🕒 ${esc(TIME_LABELS[d.timeSlot] || d.timeSlot)}`,
    `💳 ${esc(PAYMENT_LABELS[o.payment] || o.payment)}`,
    '',
    ...items.map((i) => `• ${esc(i.name)} × ${Number(i.quantity) || 0} — ${money(i.price * i.quantity)}`),
    '',
    `Mahsulotlar: ${money(o.subtotal)}`,
    `Yetkazib berish: ${Number(o.deliveryFee) === 0 ? 'bepul' : money(o.deliveryFee)}`,
  ];
  if (Number(o.discount) > 0) lines.push(`Chegirma: −${money(o.discount)}`);
  lines.push(`💰 <b>Jami: ${money(o.total)}</b>`);
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return send(res, 500, { error: 'Telegram is not configured' });

  let order;
  try {
    order = await readBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON' });
  }
  if (!order?.orderNumber || !order?.delivery?.phone || !Array.isArray(order.items) || !order.items.length) {
    return send(res, 400, { error: 'Invalid order' });
  }

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: buildMessage(order), parse_mode: 'HTML' }),
    });
    const data = await tg.json();
    if (!data.ok) {
      console.error('Telegram error:', data.description);
      return send(res, 502, { error: 'Telegram rejected the message' });
    }
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error('Telegram request failed:', e);
    return send(res, 502, { error: 'Telegram unreachable' });
  }
}
