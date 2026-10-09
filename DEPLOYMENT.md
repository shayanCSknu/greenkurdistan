# Live website repair

The public domain currently serves GitHub Pages. `/api/health` returns 404: GitHub Pages cannot run `server/index.js`. Uploading `dist` alone will not enable accounts, reporting, photos or climate history.

Deploy this project on a Node 24 server with persistent storage and serve the website and `/api/*` from the same HTTPS domain. This keeps session cookies, private media and submissions on one origin.

## Docker on a VPS

1. Copy this project to the VPS, excluding local databases and caches. Install Docker Compose there.
2. Run `docker compose up -d --build` in the project directory.
3. Check `curl http://127.0.0.1:3000/api/health`. It must return JSON with `ok: true`.
4. Configure an HTTPS reverse proxy for `greenkurdistan.dev` to `127.0.0.1:3000`. Allow request bodies up to 20 MB for media uploads. For example, Caddy configuration:

   ```text
   greenkurdistan.dev {
       reverse_proxy 127.0.0.1:3000
   }
   ```

5. Point the domain's DNS to that VPS and remove conflicting GitHub Pages records. Confirm HTTPS and `https://greenkurdistan.dev/api/health` before inviting submissions.
6. Register your administrator account on the website, then run `docker compose exec website node server/manage.js promote YOUR_USERNAME`.

The Compose volumes retain accounts, reports and media across container replacement. Back up the reports volume with the website stopped. Do not run `docker compose down -v`: it deletes stored reports. The container uses secure cookies and expects HTTPS at the reverse proxy.

## Managed Node hosting

Use Node 24, start command `node server/index.js`, `HOST=0.0.0.0`, `COOKIE_SECURE=1`, and `DATA_FILE` pointing to a persistent mounted directory. Configure `/api/health` as the health check. Attach the custom domain to that service. Ephemeral hosting without persistent storage loses reports when redeployed.

## Verification

Check health, registration, login, a private report submission, media upload, moderator review and climate history. Test using a separate browser session. An empty public list is normal until a moderator reviews a report.

These files prepare deployment; they do not provision hosting or change DNS by themselves.
