# Report & Resolve acceptance record

## COMPLETED

- Up to three mixed photo/video problem attachments with previews, removal, saved evidence and browser video players. Photos: 3 MB each; MP4/WebM videos: 15 MB each.
- Shared 44-city/town catalog across map, weather, climate history and reporting, with sourced coordinates and city-specific history timezones.
- Schema version 3 adds media storage while preserving legacy reports, photos, accounts and community records.

- Live street/building map is the default; fixed security-policy access and regional-layer occlusion.
- Reports can select/drag an exact problem pin, use map-center or device location, and store typed/picked coordinates. Teams see the saved close-up pin and directions.

- Photo-based community projects with detailed reports, outcomes, resources and priority.
- Persistent volunteer teams, contribution profiles, coordinator transfer, shared tasks and My teams.
- Public discussion and photo progress journals, unique supporters, share links and moderator hiding/restoring.
- Resolution requests requiring completed tasks and photo evidence; moderators confirm solutions with a verification note and after-photo.
- Database schema version 2 upgrades existing accounts/reports/sessions/photos without replacement.
- Shared Node.js + SQLite service, independent from external weather and mapping APIs.
- Accounts, password hashing, private sessions, sign-out and operator-managed administrator roles.
- New reports, optional coordinates and photos, owner tracking and private moderation queue.
- Reviewed / in-progress / resolved workflow, rejection, reopening, team assignments, notes, before/after evidence and status history.
- Search, pagination, area/category/status filters and statistics calculated from actual reviewed records.
- English, Sorani Kurdish and Arabic on all eight pages with RTL support and a persistent header selector beside the theme button.
- Locally bundled regional map with city selection, pan/zoom/reset and automatic fallback when optional street tiles are blocked.
- Toolkit recycling guide removed; Impact Lab sorting game retained.
- Integration into the existing site, responsive styles, accessible labels and production build.
- API responses and uploaded photos are excluded from service-worker storage.
- Run instructions and administrator setup in README.md. No default passwords, fictional reports or administrator accounts are seeded.

## TESTED

Real headless Chrome verification loaded live street tiles and inspected city streets/building outlines plus a saved report pin and directions link. Browser runtime errors: none. Screenshots: `.cache/street-map.png`, `.cache/report-map.png`. Browser test data used an isolated in-memory database.

39 automated tests pass (8 application tests, 13 reporting tests, 6 site/climate regression tests, 6 community tests, 3 site-language/map tests and 3 attachment tests):

- Full lifecycle through real HTTP requests from independent sessions.
- Problem and resolution image storage/retrieval, private-photo access control and byte integrity.
- Owner-only access to pending/rejected submissions and administrator-only mutations.
- Status-transition validation, required notes and concurrent-edit version conflicts.
- Idempotent report submission, filters, pagination and literal search including SQL-like input.
- Persistence of accounts, sessions, reports and images after server restart.
- Password hashing, invalid credentials, expired sessions, sign-out and authentication rate limits.
- Origin/header checks, malformed input, invalid coordinates, upload-size limits, unsupported file types and private filesystem route blocking.
- DOM-driven registration, submission, administrator updates and sign-out against the real HTTP service.
- Untrusted report text renders as text rather than executable markup.
- Translation completeness, language selection and document RTL direction.
- Connection failures are displayed; report form text survives failed submissions and can be retried.
- Existing calculators, quiz, missions, weather request handling and bundled homepage remain tested.
- Production climate records, chart drawing, pagination, variable/dataset selection, CSV creation, missing values and source provenance.
- Official climate-source fallback, incomplete-year exclusion, stale-cache labelling and date-range validation.
- Source/production page scripts, styles, images and navigation targets; offline climate assets.
- Calculator missing-input instructions and result refresh when factors or measured flow change.
- All source/production pages translate navigation, headings, titles and interactive controls; language persists across pages and report drafts survive switching.
- Bundled map geometry and markers, city weather selection, street-tile referrer policy, blocked-tile recovery and offline city selection.
- Independent reporter, volunteer and moderator community workflows, including photo reports, task ownership, resolution requests and verified completion.
- Idempotent support, membership/leadership permissions, release of unfinished tasks on leaving, moderation/photo privacy and update pagination.
- Persistent teams/tasks/updates after restart and repeated migration from an existing version-one database.
- Production community frontend, share links, plain-text rendering, draft retention, failed-request retry and loading recovery.
- Three mixed attachments, idempotent submission, public/private moderation access, byte integrity, partial/suffix video ranges and invalid-range rejection.
- Excess files, incompatible legacy/photo inputs, unsupported or mismatched formats, oversize videos and report-body size limits are rejected without partial records.
- Schema-version-two media upgrade preserves legacy photos; new attachments survive restart.
- Real Chrome production UI: recorded playable WebM plus two photos, fourth-file rejection, remove/re-add, language switching, failed upload retention, successful retry, video preview and report playback. Test data remained in an isolated database.
- Four-country historical city requests use the catalog's latitude, longitude and timezone.

On 2026-10-09, the local server was started and real climate API responses were checked: 126 annual HadCRUT5 records from 1900 through 2025, seven requested local weather days and 168 requested hourly air-quality records. Startup now supports the double-click Windows launcher and displays a complete-site link from static previews.

Production webpack compilation succeeds. Development and production dependency audits report **0 known vulnerabilities** at verification time. The live local server responds successfully at `http://localhost:3000/reports.html` and its API/asset endpoints.

## OPTIONAL / ENVIRONMENT-DEPENDENT

- Visual browser and physical phone testing are not completed: the available UI tool reports no browsers or native apps. DOM tests do not verify rendered layout, native file pickers, canvas photo re-encoding or real device behaviour.
- Real location permission and external map links depend on the browser, secure context and internet. Typed locations work without them.
- Cross-device networking depends on explicitly binding the server to the LAN and allowing it through the host firewall; no firewall changes have been made.
- Sorani/Arabic translation should receive native-speaker editorial review before a university-wide launch.
- Public deployment requires HTTPS, secure cookies, persistent hosting/backups and real administrators. No university affiliation or maintenance-team participation is assumed.
- No software test suite establishes a guarantee of zero bugs; this record states the checks actually performed.
