# MIDAS Portal — Testing Feedback: Code Analysis & Fix Plan

**Date:** 2026-08-18
**Method:** four parallel code investigations (layout, navigation/status/tour, data scoping, performance) over `oar-midas-portal`, `oar-pdr-py`, and `oar-docker`; every finding then adversarially re-verified against the source; final senior review pass with spot-checks.
**Scope rules applied:** DMPTool-app issues are out of scope (separate team). Table-naming ("My" prefix) reports treated as tester/build discrepancy, not tracked.

---

## Headline conclusions

1. **"All DMPs visible to everyone" is real — and it's configuration, not a browser bug.**
   The deployed config (`midas-dmpdap*_conf.yml`, `dmp:` block) sets `default_perms.read: ["grp0:public"]`. `ProjectService.create_record` applies it to every new DMP (`dbio/project.py:184,216-219`), every authenticated user is implicitly in `grp0:public` (`dbio/base.py:822`), and an unscoped list matches on read ACLs (`wsgi/project.py:718-720`, `mongo.py:226`). A unit test even asserts the grant (`test_project.py:131`). The `dap:` block has **no** such default — which is exactly why testers said "all *DMPs*" and not "all records". Browser attribution (Chrome vs Safari) is incidental.
   → **Product decision required before any fix: is public-read-by-default on DMPs intentional?** (DMPs are described as "publicly readable by design" in the test script itself — if so, the defect is the UI rendering edit affordances on an unscoped list, not the config.)

2. **The expanded-table dialog is empty for everyone in production — deterministic code bug.**
   `expanded-table-dialog.component.ts:86-96` selects both columns and data by `widget.content.name` (the JS class name). Production minification renames classes (verified against the installed `@angular-devkit/build-angular` 18.2.21 pipeline), so both lookups always miss → zero columns, zero rows, every browser. Explains every "empty pop-up" report.

3. **The 2×2 default grid is arithmetically impossible on a laptop.**
   Default widgets span 4 grid columns each; the column count is `floor((width+16)/216)`. Two widgets per row needs 8 columns = **container ≥ 1712 CSS px** (~1790px viewport). No media queries exist. Laptops get 1 widget per row; very wide monitors get all 4 in one row. Both reported shapes are the *same default config* on different screens. Additionally, a "ratchet" bug permanently shrinks persisted widget spans on any transient narrow measurement (`dashboard.component.ts:186-196` + persistence effect), and the schema-version reset that should clear stale layouts is broken (`dashboard.service.ts:73` checks key existence, never compares the version) — **so layout fixes will not reach existing browsers until that is fixed**.

4. **The Reviews table can never populate, even with a perfect backend.**
   The widget fetches in `ngOnInit` before credentials exist, and `data.service.ts:252` (`userId?.() || userId || ''`) concatenates the **signal function object** into the URL when creds aren't loaded. The response then lands in a private `_reviewList` that is never updated from the later token-gated `loadReviews()`. Downstream of that, the NPS broker is independently broken three ways (hardcoded `localhost:8084` config URL; `self.nsdSecret` never assigned → `AttributeError` on every request; double-JSON-encoded response), and the deployed `NPSAPI` points at `https://localhost:9092/` — the viewer's own machine. Fixing the deployment alone would not move the symptom; the portal data flow must be fixed first.

5. **Files table: snapshots of DAP records, not live Nextcloud.**
   `getFiles()` re-downloads the **entire DAP collection a second time** and maps stored `file_space` snapshots. Records predating the file-manager integration (or whose space creation failed) have no `location` → the row's link resolves against the portal origin ("old files redirect to the portal"). Others' files appear because submitting a DAP for review grants `grp0:public` read on the draft (`mds3.py:2825` — its own `TODO: confine to assigned reviewers`). One legacy record without a `file_space` key can zero the entire table (`mapToFile` unguarded).

6. **Maintenance announcements: implemented in code, absent in ops.**
   The fetch/render path is complete; `/announce/maintenance.json` simply doesn't exist on the deployed host mount (templates sit unused one directory up), and the silent `catchError` fabricates "All systems are operational" — turning an ops gap into a phantom code bug.

7. **Performance problems are structural and confirmed end-to-end.**
   `loadAll()` = 7 requests including the DAP collection twice, re-run on every route change, no caching; Share My Records fires one ACL request **per record over the entire dataset** (true N+1, re-fired after every permission edit); server-side search exists as dead code; two hard-coded fake spinner delays (1500ms, 800ms); no lazy loading; jsPDF in the initial bundle via two duplicate services; four render-blocking Google-Fonts links (an intranet killer); four independent 100ms token-polling loops.

8. **The tested artifact is not the repo HEAD.**
   The deployed `environment.json` points `menuConfigURL` at `localhost:4200` (dev server) — under which testers should have seen a 2-item fallback menu, yet they saw the full menu. Combined with 41 stale `main.*.js` bundles shipped in the image and **zero cache-control headers** on `index.html`, the build under test cannot be assumed to match the repo. Every "already fixed on HEAD" claim needs re-verification against the actual tested bundle.

---

## Symptom → root cause map

| Reported symptom (testers) | Root cause | Verdict |
|---|---|---|
| No 2×2 grid; 1 column / 1 row / 4×1 (all testers) | Default spans vs width-computed columns; 2×2 needs ≥1712px container | Fully explained |
| Layout stuck after resize | Span ratchet persisted to localStorage; broken schema reset | Fully explained |
| Expanded view empty (Alex, Melvin) | Class-name lookup destroyed by prod minification | Fully explained |
| "Can't expand" (Melvin, Chrome) | Likely same empty dialog read as non-functional; a throw path exists for stale widget state | Partially — re-interview tester |
| All DMPs visible/editable (Melvin, Chrome) | `default_perms.read: grp0:public` on DMP creation (config); UI renders edit links on unscoped lists | Fully explained — product decision needed |
| Reviews always empty (all) | Portal: pre-creds fetch + signal-in-URL + non-reactive table. Deployment: broker crash ×2, wrong NPSAPI host | Fully explained (portal causes are gating) |
| Others' files visible; old files → portal (Melvin, Alex) | Unscoped DAP snapshot list; review submissions grant public read; missing `location` on legacy records | Explained; one live check on "own files missing" variant |
| INET / METIS Public → portal (all) | `"#"` placeholder links in tested build's menu config; renderer opens them as external | Explained; `"Create New…"` is still `"#"` today |
| Report a Problem dead at small viewport (Alex) | Fixed-position info bubbles (z-index 10001) overlap the last menu row | Explained |
| No maintenance announcements (all) | `/announce/maintenance.json` never deployed; silent fallback masks it | Explained — ops |
| Tour won't reactivate (Alex) | Help icon hidden when sidebar collapsed; collapsed is the default | Explained |
| Tour per-browser not per-user (Melvin) | localStorage-only state; completed-flag is write-only dead state | Explained (design gap) |
| 5s boot; slow Search & Export (Alex, Melvin) | Structural: request fan-out, no caching, no lazy loading, blocking fonts, fake delays | Fully explained |
| Theme bubbles disappear on full scroll (Alex, Safari) | **Unexplained** — transform hypothesis refuted; needs live Safari inspection | Open |

---

## Fix plan

**Sequencing rule: DS-1 (or the product decision) and P-1 gate everything else.**

### Tier 0 — this week

| ID | Title | Sev | Eff | Layer |
|---|---|---|---|---|
| DS-1 | Decide + (if unintended) remove `grp0:public` from DMP `default_perms`; update the asserting unit test | Critical | S | backend-config |
| DS-2 | Remediation script pulling `grp0:public` from existing `acls.read` (dry-run first) | Critical | M | data-state |
| B-1 | `mds3.py:2825` — grant review read to configured reviewers, not `PUBLIC_GROUP` | Critical | M | backend |
| P-1 | Fix schema-version reset (compare value, bump version) so layout fixes reach users | Critical | S | portal |
| P-2 | Stop the span ratchet (clamp at render-time only, never persist the clamp) | Critical | M | portal |
| O-1 | Fix deployed `environment.json`: origin-relative `NPSAPI=/nps/`, `infoURL=/announce/maintenance.json`, `menuConfigURL=/assets/sidebar/menu-config.json` | Critical | S | deploy-ops |
| B-2 | NPS broker: `npsTokenSecret` typo, env-driven config URL, `response.json()` not `jsonify(text)`, **remove `debug=True`** (Werkzeug debugger behind a proxy is an RCE surface) | Critical | S | backend |
| P-3 | Reviews table renders `dataService.reviews()` reactively (drop private one-shot list) | Critical | S | portal |
| P-4 | Fix `userId?.() \|\| userId` signal-stringification (3 sites; grep for more) | Critical | S | portal |
| P-5 | Expanded dialog: key by `widget.id`, read `myDmps()`/`myDaps()`, reactive data, edit links only where writable | Critical | S | portal |

### Tier 1 — next sprint

| ID | Title | Sev | Eff | Layer |
|---|---|---|---|---|
| O-2 | Cache headers: `no-store` on index.html, `immutable` on hashed bundles (currently none at all) | High | S | deploy-ops |
| O-3 | Clean `built/portal/wizard` before image build (41 stale bundles, 110MB) | High | S | deploy-ops |
| O-4 | Deploy `maintenance.json`; `autoindex off` on `/announce/` (currently a public directory listing) | Med | S | deploy-ops |
| P-6 | Responsive default spans (2×2 on laptops) — after P-1 | High | M | portal |
| P-7 | Scope stats widgets, filter dropdowns, my-records source to `my*` signals | High | S | portal |
| P-8 | De-duplicate `loadAll` (derive files from fetched DAPs; cache across routes) | High | M | portal |
| P-9 | Share My Records N+1: interim concurrency cap + Map accumulation + filter-before-fetch + org-index cache; real fix server-side | High | L | portal |
| P-10 | Boot: lazy routes, dynamic-import jsPDF, delete duplicate export service, self-host fonts, single token gate | High | L | portal |

### Tier 2 — cleanup

| ID | Title | Sev | Eff | Layer |
|---|---|---|---|---|
| P-11 | Guard `mapToFile` (`file_space?.`) + disabled cell when `location` falsy | Med | S | portal |
| P-12 | Sidenav bubbles: reserve bottom padding / move into flow (fixes Report-a-Problem overlap) | Med | S | portal |
| P-13 | Show tour help icon when sidebar collapsed | Med | S | portal |
| P-14 | Delete fake spinner delays (1500ms / 800ms — own TODO says so) | Med | S | portal |
| P-15 | `"Create New…"` link is still `"#"`; add renderer guard for placeholders | Med | S | portal |
| B-3 | Validate ACL identities server-side (`wsgi/project.py:970` TODO) | Med | S | backend |
| P-16 | Tour dead state: wire up or delete `resetTour`/`shouldShowTour`/completed flag | Low | S | portal |

---

## Architectural decisions to make deliberately

1. **DMP public-read-by-default: intentional or not?** Someone wrote the config and a test asserting it. Get the answer in writing; DMP and DAP currently disagree with each other. This decides whether the fix is DS-1/DS-2 or UI-only (P-5/P-7).
2. **Commit to server-side filtering + pagination.** `SUPPORTED_FILTERS` already exists server-side; every list view currently downloads the full corpus. The interim patches (P-8/P-9) are throwaway if the migration happens — recommended: ship the cheap patches now *and* schedule the migration.
3. **`environment.json` is host-pinned** (`https://localhost/...` everywhere) — the single root cause behind three symptoms. Move to origin-relative paths + per-environment generation.
4. **The NPS broker needs a rewrite decision**, not just patches: Flask dev server with `debug=True`, hardcoded config, guaranteed crash. It has never worked in this deployment.
5. **Ban string-keyed component dispatch** (`Function.prototype.name`) via lint rule — invisible in dev, total failure in prod.
6. **Silent fallbacks mask outages as plausible data** (static fixture DMPs/DAPs with 4 foreign owners; fabricated "all operational"). On a government system this is a defect class of its own — adopt a fail-loud policy.

## Needs live-browser / data investigation (not explainable from code)

1. Safari "theme/status bubbles disappear on full scroll" — all candidate mechanisms refuted; needs Safari inspector session.
2. "Can't expand" vs "expanded-but-empty" — re-interview the tester; minification explains only the latter.
3. "Own files missing": partial (not-DAP-linked) vs total (`mapToFile` throw) — one look at a tester's account settles it.
4. Exact `file_space.location` state on a legacy DAP (absent vs empty vs unreachable URL) — one Mongo document.
5. **Bundle-vs-repo reconciliation** (highest value): capture the bundle hash from a tester's browser; the tested build demonstrably differs from HEAD, so re-verify every "fixed already" claim.
