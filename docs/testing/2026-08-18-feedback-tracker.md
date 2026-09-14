# MIDAS Portal — Testing Feedback Tracker

Living triage of the 2026-08-18 testing session. Companion docs:
[consolidated feedback](2026-08-18-portal-testing-feedback.md) · [code analysis & fix plan](2026-08-18-portal-feedback-code-analysis.md)

**Classification** (fill/override the column as you triage):
`bug` — defect to fix · `intentional` — works as designed, close with explanation · `misuse` — tester/environment error, close · `ops` — deployment/config issue, not portal code · `decision` — needs a product call first

**Status**: `fixed (branch)` = on local `fix/dashboard-testing-feedback`, not merged · `open` · `blocked` · `closed`

| # | Feedback | Reported by | Root cause (from code analysis) | Classification | Status | Fix ref |
|---|----------|-------------|--------------------------------|----------------|--------|---------|
| 1 | Dashboard never shows the 2×2 default grid (1 col / 1 row / 4×1) | Alex, Melvin | Default spans arithmetically can't fit 2-up below ~1712px container; broken schema reset kept stale layouts forever | bug | fixed (branch) | `e910cbd` — note: 2×2 needs sidenav collapsed at 1512px; derived spans are a follow-up |
| 2 | Layout stays broken after resize/reload | Alex | Clamped spans persisted to localStorage (ratchet), never restored | bug | fixed (branch) | `e910cbd` |
| 3 | Expanded table view empty (both browsers) | Alex, Melvin | Dialog keyed on class names, destroyed by prod minification | bug | fixed (branch) | `6f3c568` — verify with a production build |
| 4 | "Cannot expand tables at all" (one Chrome session) | Melvin | Most likely the same empty dialog read as non-functional | misuse? | needs tester re-check | — |
| 5 | Reviews table empty after submitting a DAP review | Alex, Melvin | Portal: pre-auth fetch + corrupted URL + never-refreshed private list + unsubscribed loadReviews | bug | fixed (branch) | `a797645`, `4d74677` |
| 6 | Reviews still empty in deployed stack | all | NPS broker crashes on every request (config URL + typo), double-encoded JSON, NPSAPI points at viewer's machine | bug (backend/ops) | open | analysis B-2, O-1 — oar-pdr-py/oar-docker, not this repo |
| 7 | "I can see and change all DMPs" | Melvin | Backend config grants `grp0:public` read on every new DMP — DMP service behavior, not portal code | not a bug — out of scope | forwarded to DMP repo | oar-pdr-py `dmp:` config (`default_perms`) |
| 8 | Files table shows others' files | Melvin | Not reproduced | misuse — wrong feedback | closed | — |
| 9 | Old files redirect to the portal; some own files missing | Alex, Melvin | Legacy DAPs have no stored Nextcloud location; one malformed record could empty the whole list | bug | partially fixed (branch) | `a797645` guards the list-wipe; dead-link rendering (P-11) open |
| 10 | Open Access INET / METIS Public redirect to the portal | Alex, Melvin | `"#"` placeholder links in the deployed menu config | ops — config link | open, not this repo | fix the menu config served by the deployment (oar-docker) |
| 11 | "Report doesn't work" at 1512×447 | Alex | Floating status/theme bubbles (fixed, z-index 10001) overlap the last menu rows and intercept clicks — *hypothesis, not confirmed with the tester; which item "Report" refers to is unverified* | bug | fixed (branch) | `67c7f8e` — bubbles moved into the sidebar flex flow |
| 12 | No maintenance announcements in status pop-up | all | Nothing to announce — status is operational, so no announcements is correct | misuse — wrong understanding | closed | — |
| 13 | Tour won't come back when reactivated (reproduced on Chrome) | Alex | Not localStorage: `startTour()` checks no stored flag. The trigger icon is hidden whenever the sidebar is collapsed — and collapsed is the default | bug | fixed (branch) | `67c7f8e` — trigger always visible |
| 14 | Tour preference per-browser, not per-user | Melvin | All tour state in localStorage; no backend config exists — per-browser by design | intentional | closed | — |
| 15 | Portal boot ~5s | Alex | No lazy loading, jsPDF in initial bundle, 4 blocking font downloads, serialized init, token polling | bug (structural) | open | P-10 — needs the pagination/architecture decision first |
| 16 | Search & Export slow, scaling concern | Alex, Melvin | Full-corpus download + client-side filtering; server-side search endpoint exists but unused; DAP collection was downloaded twice | partially fixed (branch) | `a797645` (dup download, fake 1.5s delay); real fix P-9/P-10 open |
| 17 | Filter buttons felt slow | — | Hard-coded fake 1.5s / 0.8s spinner delays | bug | fixed (branch) | `a797645` |
| 18 | Theme/status bubbles disappear when scrolled fully down (Safari) | Alex | Root cause never isolated (the drawer-transform theory was refuted), but the bubbles were `position: fixed` inside the drawer while the page scrolls in an outer container — removing the float removes the failure mode | bug | fixed (branch) — **verify in Safari** | `67c7f8e` — same change as #11 |
| 19 | Saved filters are browser-local only | Alex | localStorage — browser-only by design | intentional | closed | — |
| 20 | Exports fail when required fields missing, omit remaining fields | Melvin | Failure text inside the downloaded file is backend-generated. Portal side: CSV took headers from the first record only (dropping later fields), and failures showed a bare "download failed" | intentional + bug | fixed (branch) | `67c7f8e` — CSV headers now union all records; failure message states the reason. In-file text stays backend-owned |
| 21 | Table names missing "My" prefix (Chrome) | Melvin | Not reproduced | misuse — wrong feedback | closed | — |
| 22 | DMPTool blank page ~1min; User Guide opens in same tab | Melvin | DMPTool app | out of scope | forwarded | DMPTool team |

## Deployment integrity (affects several rows above)
The tested build did not match the repo: deployed `environment.json` points at dev-server URLs, 41 stale JS bundles ship in the image, and `index.html` has no cache headers. Until O-1/O-2/O-3 land, "works on my machine" vs tester reports can diverge for build-state reasons alone.

## Notes / triage log
<!-- add dated notes here as items get classified or closed -->
- 2026-08-18 — tracker created; rows 1-3, 5, 17 fixed on local branch `fix/dashboard-testing-feedback` (not pushed).
- 2026-08-25 — second branch pass: #11, #13, #18, #20 fixed on `fix/dashboard-testing-feedback` (`67c7f8e`). #11/#18 share one fix (bubbles unfloated). Corrected #13: the cause is not localStorage — the tour trigger was hidden while the sidebar was collapsed.
- 2026-08-18 — PO triage: #7 out of scope → DMP repo; #8, #21 wrong feedback, closed; #10 deployment config link, not this repo; #12 wrong understanding (status operational ⇒ no announcements), closed; #13 confirmed on Chrome, stays open; #14, #19 intentional (localStorage by design), closed; #20 intentional but add information to exports.
