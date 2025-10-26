// /api/send.js
const ALLOWED_ORIGINS = [
  'https://smartcontactqr.vercel.app',
  // add your preview domains if you want to call cross-site:
  // 'https://smartcontactqr-xxxxx.vercel.app',
  'http://localhost:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();              // handle preflight
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    const { to, name, subject = 'Your Smart Contact Card', fromName = 'Smart Contact', attachmentDataURL } = req.body || {};
    if (!to || !attachmentDataURL) {
      res.status(400).json({ error: 'Missing "to" or "attachmentDataURL"' });
      return;
    }

    const m = /^data:(.+);base64,(.+)$/.exec(attachmentDataURL || '');
    if (!m) { res.status(400).json({ error: 'Invalid data URL' }); return; }
    const contentType = m[1];
    const base64 = m[2];
    const ext = contentType.includes('png') ? 'png' : 'jpg';

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <no-reply@YOURDOMAIN.com>`, // change to your verified sender
        to: [to],
        subject,
        html: `<p>Hi ${name ? name.split(' ')[0] : ''},</p><p>Your contact card is attached.</p><p>— ${fromName}</p>`,
        attachments: [{ filename: `contact-card.${ext}`, content: base64, contentType }],
      }),
    });

    if (!r.ok) { res.status(r.status).json({ error: await r.text() }); return; }
    const data = await r.json();
    res.status(200).json({ ok: true, id: data?.id || null });
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) });
  }
}
