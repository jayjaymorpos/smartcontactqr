// /api/send.js — Vercel Serverless Function
// Sends an email with a real attachment via Resend (no 50KB variable limit).
// REQUIREMENTS:
//   1) Add RESEND_API_KEY env var in your Vercel project settings
//   2) Verify a sender/domain in Resend and update the `from` address below

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  try {
    const { to, name, subject = 'Your Smart Contact Card', fromName = 'Smart Contact', attachmentDataURL } = req.body || {};
    if (!to || !attachmentDataURL) {
      res.status(400).json({ error: 'Missing \"to\" or \"attachmentDataURL\"" });
      return;
    }

    const m = /^data:(.+);base64,(.+)$/.exec(attachmentDataURL || '');
    if (!m) {
      res.status(400).json({ error: 'Invalid data URL' });
      return;
    }
    const contentType = m[1];
    const base64 = m[2];
    const ext = contentType.includes('png') ? 'png' : 'jpg';

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromName} <onboarding@resend.dev>`, // CHANGE to a verified sender in Resend
        to: [to],
        subject,
        html: `<p>Hi ${name ? name.split(' ')[0] : ''},</p>
               <p>Your contact card is attached.</p>
               <p>— ${fromName}</p>`,
        attachments: [
          {
            filename: `contact-card.${ext}`,
            content: base64,
            contentType,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      res.status(resp.status).json({ error: `Resend error: ${txt}` });
      return;
    }

    const data = await resp.json();
    res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
}
