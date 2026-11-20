# Brandon & Eleanor — custom wedding website

Live editor with **no traditional database**.

- **Local:** saves to `data/live-config.json` + `data/uploads/`
- **Vercel:** saves to **Vercel Blob** (config + photos)

## What works

- Edit words, fonts, colours, sections
- Upload / replace photos
- Desktop + mobile layouts
- **Save to website** → guests see it after refresh

## Local

```bash
npm install
copy .env.example .env
npm start
```

- Site: http://127.0.0.1:4173/
- Editor: http://127.0.0.1:4173/index.html?edit=1
- Default password in `.env`: set `EDITOR_PASSWORD`

## Deploy on Vercel (recommended for your setup)

1. Push this project to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add a **Blob** store to the project (Storage → Blob)
4. Set environment variables:
   - `EDITOR_PASSWORD` = a long secret only you know
   - `BLOB_READ_WRITE_TOKEN` = auto from Blob store (or paste the token)
5. Deploy
6. Edit at: `https://YOUR-DOMAIN/index.html?edit=1`
7. Click **Save to website**

Static pages come from the `site/` folder. APIs are in `api/`.

### Important Vercel notes

- Photos and published content are stored in **Vercel Blob** (permanent cloud files)
- No MySQL/Postgres needed
- Keep `EDITOR_PASSWORD` private
- First deploy: open the editor once and save, so Blob gets a live config

## RSVP

RSVP previously used Wix Forms. Content/design publishing is fully custom. A custom RSVP endpoint can be added later if needed.
