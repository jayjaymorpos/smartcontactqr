# Smart Contact QR Web — Vercel Starter (No 50KB limit)

This project serves a client app from `/public` and a serverless endpoint `/api/send` that
sends emails with real attachments via **Resend** (no EmailJS limit).

## Deploy (Vercel)
1. Download and unzip this project.
2. Create a repo and push it to GitHub/GitLab; or import directly on Vercel.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `RESEND_API_KEY` (from your Resend dashboard)
4. Edit `api/send.js` and set the `from:` address to a verified sender, e.g. `no-reply@YOURDOMAIN.com`.
5. Deploy. Your endpoint will be `https://YOUR-APP.vercel.app/api/send`.

## Use
- Open your deployed site.
- Step 1: Upload CSV `name,title,address,email,phone`.
- Step 2: Adjust branding; preview / download.
- Step 3: Keep `Send API URL` as `/api/send` and click **Send All (via API)**.

## Local Dev
- Install Vercel CLI and run `vercel dev`.
