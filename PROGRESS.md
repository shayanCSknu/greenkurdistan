# Site redesign

## Detailed street maps and exact report locations (2026-10-09)

- [x] Fix tile-host security policy and remove the opaque regional layer from street view; default to live streets/building outlines at city zoom.
- [x] Add report map selection, draggable pins, center/clear/retry controls, typed-coordinate synchronization and high-accuracy device location.
- [x] Save coordinates through the existing report API and display the same pin with directions in report details for teams.
- [x] Verify real street tile responses and inspect real Chrome screenshots of city streets and report building-level pins using an isolated test database.
- [x] Verify clicked/dragged coordinates, persistence, language switching, security headers and existing reporting regressions.
- [ ] Physical phone/geolocation permission checks remain environment-dependent.

## Community action projects (2026-10-09)

- [x] Extend reports with detailed accounts, desired outcomes, resources and priority; show problem photos on report cards.
- [x] Add persistent teams, contributions, coordinator transfer and a My teams view.
- [x] Add shared task boards with dates, claim/release/complete/reopen controls and ownership checks.
- [x] Add unique supporter counts, shareable report links, discussion and photo progress journals.
- [x] Add evidence-based resolution requests and moderator confirmation with saved after-photo and verification history.
- [x] Add update/photo moderation, pagination and private-report access checks.
- [x] Preserve community drafts through refreshes and failed submissions; prevent stale project refreshes.
- [x] Provide English, Sorani and Arabic labels and responsive community layouts.
- [x] Verify migration from schema version 1 and persistence across restart without losing existing records.
- [x] Pass 32 automated tests, including separate reporter/volunteer/moderator sessions and production frontend workflows.
- [x] Back up the local database before upgrade, restart the project server and verify live frontend/API loading with schema version 2 and no DOM runtime errors.
- [ ] Real-browser visual inspection, canvas photo processing and physical cross-device checks remain environment-dependent.

## Site-wide languages and sourced history

- [x] Shared header language selector beside the theme button and persisted English/Sorani/Arabic translations on every page, including interactive controls.
- [ ] Replace invented environmental charts, map values and leaderboard entries.
- [x] Add global HadCRUT5, local ERA5 and CAMS history with provenance and missing-data handling.
- [ ] Verify real upstream responses, downloads, translation coverage and regression tests.

## Report & Resolve implementation

- [x] Add a SQLite-backed shared reporting API with accounts and role checks.
- [x] Add report creation, photos, review, assignment, resolution evidence and history.
- [x] Add regional counts and searchable reports.
- [x] Add English, Sorani Kurdish and Arabic reporting interfaces with RTL layout.
- [x] Integrate the new service with all six existing pages and the production build; replace the old local-only report form.
- [x] Test independent user sessions, persistence, moderation, uploads and failures.
- [x] Verify frontend interactions with DOM tests against the real server; document startup, administration and limitations in README.md.
- [x] Remove the unused webpack development server and update the build dependency; npm audit reports zero known vulnerabilities.
- [x] Start the real local server and verify the reporting page, API health, statistics and frontend assets return HTTP 200.

- [x] Review shared layouts and identify conflicting theme rules.
- [x] Replace the stylesheet with a cohesive responsive theme across all six pages and the 404 page; include light and dark palettes.
- [x] Replace improvised flag branding with a vector flag containing a 21-ray sun; add matching favicon, landscape artwork and line icons.
- [x] Build production output successfully with the local webpack CLI.
- [x] Pass all 8 existing functional tests; check local assets, unique IDs and SVG XML.

## Climate and reporting repair (2026-10-09)

- [x] Make global and local history visible as separate controls; load records automatically on scope/city selection and label the displayed city or worldwide scope.
- [x] Include the missing climate-history script and startup helper in the production build.
- [x] Update the offline shell/cache version to include climate scripts and styles.
- [x] Add Start Website.cmd and a background launcher; reuse a healthy server and show startup errors.
- [x] Show a complete-website link and startup instructions in direct-file/IntelliJ previews and when the API is unavailable.
- [x] Start the local server and verify climate, reporting, session and statistics endpoints.
- [x] Verify live source responses: 126 annual records (1900–2025), 7 local weather days and 168 hourly air-quality records for the requested sample ranges.
- [x] Add fallback to the official Hadley Centre host and exclude incomplete annual periods from coverage metadata.
- [x] Fix calculator input refresh and missing-input feedback, recycling Enter-key search, map temperature units, stale weather placeholders and request timeouts.
- [x] Build production files and pass all 26 automated tests, including production climate charts, pagination, CSV creation, dataset switching, source fallback and page asset checks.
- [ ] Visual browser verification: the current browser inventory contains no browser or native app surfaces.

## Environment-dependent verification

- Visual browser inspection remains unavailable: browser inventory returned no browsers and opening the in-app browser returned `Browser is not available: iab`.
- Responsive breakpoints and keyboard focus styles are implemented but were not visually verified in a browser.
- Physical cross-device/LAN access, browser photo resizing, browser geolocation and final visual/RTL layout still require a real-browser check. Automated tests use separate HTTP sessions and a DOM environment.
- All pages support English, Sorani Kurdish and Arabic; native-language editorial review is not completed.

## Header languages, map and Toolkit repair (2026-10-09)

- [x] Load shared translation assets on all eight pages and preserve user-written reports and community drafts when switching language.
- [x] Bundle Leaflet and sourced regional geography locally; add selectable cities, pan/zoom/reset and an optional street view with blocked-tile recovery.
- [x] Fetch real city weather/AQI with missing-data handling and stale-response protection.
- [x] Remove the Toolkit recycling guide and its unused handler; retain the separate Impact Lab sorting game.
- [x] Pass all 35 tests, including all-page source/production translation, persistence, real Leaflet geometry and blocked/offline map workflows.
- [ ] Visual browser and physical-device inspection remain unavailable in this session.
