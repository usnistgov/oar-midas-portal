# MIDAS Portal — Consolidated Testing Feedback

**Date:** 2026-08-18
**Testers:** Alex (Safari/macOS, Chrome/macOS, small viewport 1512×447), Melvin (Safari/macOS, Chrome incognito/macOS)
**Scope:** portal only — DMPTool-app issues are out of scope (separate team). Table-naming reports ("My" prefix) not tracked (not reproduced; tested artifact differs from repo HEAD — see analysis §8).
**Code analysis:** every issue below was traced in code — see [2026-08-18-portal-feedback-code-analysis.md](2026-08-18-portal-feedback-code-analysis.md) for root causes and the fix plan. Fix IDs reference that document.

---

## High — broken features (reproduced by multiple testers)

### 1. Dashboard 2×2 grid never renders
| Tester / browser | Observed |
|---|---|
| Alex / Safari | 4×1 |
| Alex / Chrome @1512×447 | 1×4 |
| Melvin / Safari | 1 column |
| Melvin / Chrome | 1 row |

**Root cause (confirmed):** the default layout is arithmetically impossible below ~1712px of container width; plus a persistence bug permanently shrinks saved layouts, and the storage-reset mechanism is broken so fixes won't reach existing browsers. → Fixes P-1, P-2, P-6.

### 2. Expanded (full-screen) table view is empty
- Alex (both browsers): empty pop-up.
- Melvin (Safari): expands but shows no results; (Chrome): could not expand at all.

**Root cause (confirmed):** the dialog looks up its columns and data by JavaScript class name, which production minification destroys — deterministically empty for everyone in prod. Also reads a different dataset than the widget and never refreshes. → Fix P-5. ("Could not expand at all" needs a tester re-check — likely the same empty dialog.)

### 3. Reviews table stays empty
All testers, all browsers, even after a successful DAP review submission.

**Root cause (confirmed):** the widget fetches before login credentials exist and corrupts the request URL; its data is never refreshed after auth; and the NPS broker service is independently broken (crashes on every request) with a wrong API host in the deployed config. → Fixes P-3, P-4, B-2, O-1.

### 4. Files table: wrong files, dead links
- Alex: clicking a Files item goes back to the portal.
- Melvin: sees others' files; some of his own missing; old files redirect to the portal, new ones work.

**Root cause (confirmed):** the table shows stored snapshots from the DAP collection, not live Nextcloud; records predating the file-manager integration have no stored link, so clicks resolve to the portal; DAPs submitted for review are granted public read (backend TODO acknowledges this), which surfaces other users' file spaces. → Fixes P-11, B-1, P-7.

### 5. Left-panel navigation links
- Alex: "Report a Problem" does not work (small viewport); Open Access INET and METIS Public redirect to the portal.
- Melvin: same INET/METIS redirects (both browsers).

**Root cause (confirmed):** INET/METIS were `"#"` placeholder links in the tested build ("Create New…" is still `"#"` today — same bug class). "Report a Problem" is covered by the two floating status/theme bubbles at short viewports, which intercept clicks. → Fixes P-12, P-15.

### 6. DMP visibility (originally Melvin/Chrome; disputed, now confirmed in config)
Reported as "I can see and change all DMPs". Not reproduced by other testers.

**Root cause (confirmed in code + config):** the deployed backend config grants `grp0:public` read on every new DMP; every authenticated user is in that group; the browser is irrelevant. Whether this is a bug or intended policy ("DMPs are publicly readable by design") is a **product decision needed before fixing**. The UI separately renders edit links on records the user can't edit. → DS-1, DS-2, P-5, P-7 pending that decision.

---

## Medium — functional gaps & performance

### 7. No maintenance announcements in the status pop-up (all testers)
**Root cause (confirmed):** feature fully implemented in code; the announcements file was never deployed to the host, and a silent fallback fabricates "All systems are operational". → Fix O-4 (ops) + fail-loud policy.

### 8. Tour issues
- Alex: tour does not come back when reactivated, even without "don't show again".
- Melvin: preference is per-browser, not per-user.

**Root cause (confirmed):** the reactivation icon is hidden whenever the sidebar is collapsed — and collapsed is the default, so the button simply isn't there. All tour state is browser localStorage; the "completed" flag is dead state that nothing ever reads. → Fixes P-13, P-16.

### 9. Performance
- Alex: ~5s portal boot (Chrome); Search and Export "very long".
- Melvin: Search and Export takes seconds; scaling concern.

**Root cause (confirmed, structural):** every page load re-downloads full record collections (the DAP collection twice); Share My Records makes one permissions request per record in the system; search filtering is client-side over the whole corpus while a server-side search endpoint sits unused; two artificial spinner delays (1.5s and 0.8s) are hard-coded; no lazy loading; heavy libraries and four blocking font downloads in the initial page. → Fixes P-8, P-9, P-10, P-14, O-2, O-3.

---

## Low — polish & suggestions

- **Theme/status bubbles disappear when scrolled fully down** (Alex, Safari) — only issue with **no code explanation found** (leading hypothesis refuted); needs a live Safari inspector session.
- **Saved filters are browser-local** — worth stating in the UI (Alex).
- **Export formats**: JSON, CSV, PDF and Markdown all work; exports report failure when required fields are missing and omit remaining fields — expected, noted (Melvin).

## Out of scope (forwarded, not tracked here)
- DMPTool blank-page load time (~1 min) and "DMP User Guide" opening in the same tab — DMPTool team.

## What works
- Dashboard record scoping and table search (Safari), tour flow and "don't show again" (Chrome), Create buttons/links, DMP/DAP row navigation to the right records, Search & Export listing and all four export formats.

## Deployment integrity warning
The tested build demonstrably differs from the current repo (deployed config points at a dev-server URL that would break the menu testers saw; 41 stale JS bundles ship in the image; no cache headers on the entry page). Until the deployed artifact is reconciled with the repo, treat any "already fixed" claim as unverified. → O-1, O-2, O-3.
