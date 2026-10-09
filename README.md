# Green Kurdistan — Report & Resolve

A student-led environmental reporting project for Knowledge University and the Erbil region. It is independent of the university and municipality; no official affiliation, repair service or response time is implied.

## Start the complete website

Requires **Node.js 24 or newer**. The shared reporting server uses built-in Node HTTP, cryptography and SQLite modules; it needs no external database, paid API or runtime npm dependency.

On Windows, double-click **Start Website.cmd**. It starts the server in the background (or reuses the running project server) and opens **http://localhost:3000/**. Startup output is saved to `.cache/server.log`. Climate history and Report & Resolve both require this server; an IntelliJ static preview or an HTML file opened directly now displays an **Open complete website** link.

Alternatively, start the server in a terminal:

```powershell
npm.cmd start
```

Open **http://localhost:3000/reports.html**. The other pages are served from the same address. Keep the terminal running. On Windows, `npm.cmd` avoids the PowerShell restriction that may block `npm.ps1`.

Opening an HTML file directly or using a static-only preview will not provide the reporting API. The interface explicitly reports this instead of pretending reports were saved.

## Climate history and calculators

Open **http://localhost:3000/climate.html** for global HadCRUT5 annual/monthly temperature records, local ERA5 weather and CAMS air-quality history. Choose a dataset and date range, then **Load records**. Charts, a paginated table, source details and CSV downloads use the retrieved source records. External sources require internet; previously retrieved records can be reused from `.cache/climate` and are labelled stale if refreshing fails.

Carbon and water calculators require your emission factors/reference or measured water flow and time savings. Missing inputs display instructions; entering the required inputs updates the result immediately.

## Create the first administrator

1. Open the site, choose **Sign in → Create account**, and create your own username and password (at least 12 characters).
2. In a second terminal, from this project folder, run:

   ```powershell
   node server/manage.js promote YOUR_USERNAME
   ```

3. Sign in again. **Administrator dashboard** now appears.

There are no default credentials or publicly accessible administrator-setup endpoints. Only the operator with access to the server terminal can promote accounts. To remove administrator access, run `node server/manage.js demote USERNAME`. Role changes revoke that account's active sessions.

## Included workflows

- Detailed community project reports (up to 10,000 characters) with a problem photo, desired outcome, resources/skills needed and priority.
- After moderation, any signed-in volunteer can create the report's solution team or join the existing team. Creating a team moves the reviewed report to **In progress** and records the action in its history.
- Coordinators maintain a shared action plan, add tasks with target dates and transfer coordination to another team member. Volunteers describe their contribution, claim tasks, complete them or release them. Leaving a team releases unfinished assignments.
- **My teams** lists projects you have joined. Cards show volunteer, task and support counts; shareable report links open the corresponding project directly.
- Public discussion, team progress journals and optional photo evidence. Updates are paginated; moderators can hide or restore inappropriate entries and their photos.
- Coordinators can request resolution after all tasks are complete, with a result photo and explanation. A moderator reviews the evidence and records a verification note; confirming the solution preserves the photo as the report's after-photo and closes team work.
- Support counts are unique per account. Community features and existing records persist in SQLite; the schema upgrades automatically without seeding demonstration content.
- Member accounts with password hashing, server-side sessions and sign-out.
- Reports with category, area, public landmark, description, optional coordinates and an optional problem photo.
- A shared SQLite database, so independent browser sessions see the same records.
- Private submissions until moderation; members can always track their own reports.
- Administrator search and filters, responsible-team assignment, progress notes and resolution evidence.
- Status history: **Submitted → Reviewed → In progress → Resolved**. Administrators can reject submissions, reconsider rejected reports or reopen resolved reports. Skipping directly from submission to resolution is blocked.
- A resolution note is required; an after-photo is optional. Reopening clears the current resolution evidence while retaining the event history.
- Public counts by status, area and category derived exclusively from reviewed records. Empty installations show zero rather than demonstration data.
- Pagination, search, manual refresh and background refresh every 20 seconds while the page is visible. An open member report refreshes; administrator editing is preserved until saving.
- English, Sorani Kurdish and Arabic across every page, including navigation and interactive tools. The header language selector sits beside the theme button and remembers your choice across pages. User-written reports stay in their original language.
- A typed location works entirely offline on the local server. Optional device geolocation depends on browser permission and a secure context; an OpenStreetMap link requires internet.
- JPEG, PNG and WebP attachments up to 3 MB. The browser decodes and resizes photos to a maximum edge of 1600 pixels, re-encodes them as JPEG and strips source metadata before upload. The server checks allowed media types, size and file signatures; it does not perform antivirus scanning or visual moderation.
- Keyboard-accessible forms, focus styles, native dialogs, status announcements and dark mode.

Do not include faces, private addresses or personal contact details in reports. Moderators should review attached photos before making a report public. Discussion and progress photos on reviewed reports are public immediately and can be hidden by moderators. Team participation is voluntary; creating a team does not send invitations, notifications or dispatch university staff. Share the report link to invite people to join.

## Cross-device demonstration

The default server binds to `127.0.0.1`, accessible only on the host computer. For your own controlled classroom network, explicitly start it with:

```powershell
$env:HOST = '0.0.0.0'
npm.cmd start
```

Open `http://YOUR_COMPUTER_LAN_IP:3000/reports.html` on the other device, on the same network. Windows Firewall and the network must permit the connection. Use demonstration-only credentials over local HTTP. No firewall settings are changed by this project. For a single-computer demonstration, use two separate browser profiles or a normal and a private window.

The same user can sign in from multiple devices. After a coordinator approves or updates a report, others can press **Refresh** or wait for the background refresh.

## Data and backups

- Default database: `data/reports.sqlite`; SQLite may also create `-wal` and `-shm` files while running.
- Reports, image bytes, accounts and history persist there. No browser-only report storage is used for the new platform.
- Stop the server before copying the database for a consistent simple backup. To restore, stop the server and replace the database with that backup.
- `DATA_FILE` can set an alternative database location. Use the same value when running administrator commands.
- The `data/` folder is excluded from version control and cannot be downloaded through the server's static file routes.
- Older `greenReports` browser-local entries are not automatically published. They may contain unreviewed private information; manually resubmit selected entries if needed.

## Build and verify

Development packages are required only to build or test:

```powershell
npm.cmd ci --cache .cache/npm
npm.cmd run build
npm.cmd test
```

`dist/` contains frontend files. **Static hosting alone is insufficient** for shared accounts, reports and photos: deploy the Node server with persistent storage as well. `npm start` serves the project frontend and API together.

The 35-test suite exercises real HTTP requests, separate users, moderation, photos, teams, task ownership, resolution evidence, database restart/migration, authentication, access controls, filters, malformed input and offline behaviour. DOM-based frontend tests exercise registration, submission, team creation/joining, task completion, evidence review, administrator updates, language switching on all source and production pages, map selection and blocked-tile recovery. DOM tests do not replace visual browser testing or real device testing.

## Languages, map and Toolkit

Use the language selector beside the theme button on any page. English, Sorani and Arabic apply throughout the site, with right-to-left layouts where appropriate. Native-speaker editorial review remains recommended.

The Impact Lab map starts with live OpenStreetMap streets and building outlines, zoomed into Erbil. Select other cities, pan/zoom or show all cities. The locally bundled regional overview is an offline fallback; detailed street tiles require internet. City weather and air quality use live Open-Meteo responses; unavailable readings remain blank. Toolkit contains the carbon/water calculators and quiz; its recycling guide has been removed. The separate Impact Lab sorting game remains available.

When creating a report, click its exact problem location on the street map, drag the pin or place it at the map center. You can also type coordinates or use device location and adjust the pin to the actual problem. Coordinates are stored with the report; report details show a close-up map and a directions link for the solver team. Existing reports without coordinates retain their written landmark. Device location depends on browser permission; selecting a public problem pin does not require device location access.

The server security policy explicitly permits the street tile host. The regional fill is removed in street view so it cannot obscure streets. Real headless Chrome checks verified visible streets/buildings and the report pin submission/detail/directions workflow; screenshots are saved in `.cache/street-map.png` and `.cache/report-map.png`. Test reports used a separate in-memory database.

Leaflet 1.9.4 is bundled locally under its BSD-2-Clause license: `js/vendor/leaflet/LICENSE`. Regional country geometry comes from the public-domain [Natural Earth country dataset](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson). Optional street tiles credit OpenStreetMap contributors.

## Deployment boundaries

Before offering this publicly, configure an HTTPS reverse proxy, set `COOKIE_SECURE=1`, arrange durable storage and backups, and appoint actual moderators. The server defaults to local-only access. Its in-memory rate limiter is intended for a single server process. Real repairs and staff participation require an agreement with the people responsible; software cannot guarantee a physical response.

External weather, map tiles and geolocation are optional/environment-dependent. The local account, reporting, moderation, photo and statistics workflows do not depend on those external services.
