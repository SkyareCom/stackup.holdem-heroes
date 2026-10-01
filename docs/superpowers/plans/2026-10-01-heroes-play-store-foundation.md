# StackUp Heroes Play Store Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert StackUp Heroes from a single prototype HTML into a Play Store-ready product foundation without breaking the existing visual experience, while establishing product-scoped identity, analytics, billing boundaries and Android/Capacitor build infrastructure.

**Architecture:** Preserve the current HTML as the user-facing baseline while extracting product constants and service boundaries around it. Introduce a Capacitor 8.5.2 Android shell targeting the current Play requirement (API 36), use product-scoped `heroes.*` storage and identifiers, and add build/validation automation so the app can evolve incrementally instead of being rewritten all at once.

**Tech Stack:** HTML/CSS/JavaScript, Node.js build scripts, Capacitor 8.5.2, Android, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-01-stackup-heroes-product-architecture-design.md`

## Global Constraints

- One identity, multiple products, multiple subscriptions.
- Heroes product key is `heroes`.
- Proposed Android application ID is `com.stackupholdem.heroes`.
- Plans are FREE / EDGE / FULL and remain scoped to Heroes.
- Preserve the validated UI unless correctness or Play compliance requires change.
- Do not continue growing the app as one monolithic file.
- Client-side authentication and billing simulations are not entitlement sources of truth.
- Android submissions from 2026-08-31 must target API 36 or newer.
- Pin Capacitor production tooling to 8.5.2 for this baseline.
- No private/service-role secrets in public app code.

## Review Focus

- Existing users with `wraps.lang` / `wraps.session` local data should not crash during the rename to Heroes storage.
- Removing PLO/Wraps wording must not accidentally alter embedded font/base64 assets.
- The browser preview must keep working while native scaffolding is added.
- A build without Android Studio must still produce a deterministic web artifact for CI validation.
- Product/billing identifiers must never collapse Heroes entitlements into a global StackUp plan.

---

### Task 1: Normalize Heroes product identity in the existing app

**Files:**
- Modify: `index.html`
- Create: `tests/validate-heroes.mjs`

**Interfaces:**
- Produces canonical browser storage keys `heroes.lang` and `heroes.session`.
- Preserves one-time compatibility reads from legacy `wraps.lang` and `wraps.session`.

- [ ] **Step 1: Write validation checks**

Assert that the app contains `heroes.lang`, `heroes.session`, no user-facing PLO training copy, and no new writes to `wraps.*`.

- [ ] **Step 2: Run validation and verify it fails on the current repository**

Run: `node tests/validate-heroes.mjs`  
Expected: FAIL because current `index.html` still writes `wraps.lang` and `wraps.session` and contains PLO copy.

- [ ] **Step 3: Update identity safely**

Change current storage writes/reads to Heroes keys, with compatibility migration from the two legacy Wraps keys. Replace inherited PLO copy with Heroes-neutral poker training copy without changing layout.

- [ ] **Step 4: Run validation**

Run: `node tests/validate-heroes.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `refactor: normalize Heroes product identity`.

### Task 2: Add deterministic web build and product configuration

**Files:**
- Create: `package.json`
- Create: `scripts/build.mjs`
- Create: `src/config/product.js`
- Create: `.gitignore`

**Interfaces:**
- `src/config/product.js` exports `PRODUCT_ID`, `APP_ID`, `PLANS`, `STORE_PRODUCTS`.
- `npm run build` produces `dist/index.html` from the current production entry point.

- [ ] **Step 1: Add a test that validates exact product constants and build output**
- [ ] **Step 2: Run and verify failure before implementation**
- [ ] **Step 3: Implement constants and build script**
- [ ] **Step 4: Run `npm run build` and product validation; expect PASS**
- [ ] **Step 5: Commit**

Commit message: `build: add Heroes product config and deterministic web build`.

### Task 3: Add service boundaries for auth, analytics and billing

**Files:**
- Create: `src/services/auth.js`
- Create: `src/services/analytics.js`
- Create: `src/services/billing.js`
- Create: `src/services/entitlements.js`
- Extend: `tests/validate-heroes.mjs`

**Interfaces:**
- `auth.js`: product-aware session interface; no provider secrets.
- `analytics.js`: every event automatically receives `product: "heroes"`.
- `billing.js`: exposes Heroes store product identifiers; does not grant entitlements locally.
- `entitlements.js`: models FREE / EDGE / FULL entitlement state independently from other StackUp apps.

- [ ] **Step 1: Add interface validation tests**
- [ ] **Step 2: Verify tests fail because service modules do not exist**
- [ ] **Step 3: Implement minimal provider-agnostic modules**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

Commit message: `feat: add product-scoped service boundaries`.

### Task 4: Add Capacitor Android foundation

**Files:**
- Create: `capacitor.config.ts`
- Modify: `package.json`
- Create/generated: `android/`
- Extend: `tests/validate-heroes.mjs`

**Interfaces:**
- Capacitor app ID: `com.stackupholdem.heroes`.
- App name: `StackUp Heroes`.
- Web directory: `dist`.
- Capacitor core/cli/android pinned to `8.5.2`.

- [ ] **Step 1: Add validation for Capacitor config and dependency versions**
- [ ] **Step 2: Verify validation fails before scaffold**
- [ ] **Step 3: Add Capacitor packages/config and generate Android project**
- [ ] **Step 4: Confirm Android project targets API 36 or newer and web sync succeeds**
- [ ] **Step 5: Commit**

Commit message: `feat: add Capacitor Android shell for Heroes`.

### Task 5: Add CI validation and browser preview deployment

**Files:**
- Create: `.github/workflows/validate.yml`
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Every push runs install/build/validation.
- Main branch builds `dist` and deploys the browser preview via GitHub Pages workflow.

- [ ] **Step 1: Add workflow validation expectations**
- [ ] **Step 2: Add CI workflow**
- [ ] **Step 3: Add Pages workflow using the built `dist` artifact**
- [ ] **Step 4: Inspect workflow run and fix any repository-level failure that can be fixed in code**
- [ ] **Step 5: Commit**

Commit message: `ci: validate and publish Heroes preview`.

### Task 6: Prepare Play Store release configuration boundary

**Files:**
- Create: `docs/play-store-release-checklist.md`
- Extend Android configuration only where generated project permits a safe deterministic edit.

**Interfaces:**
- Release checklist covers API 36+, AAB, signing ownership, Play Billing 9.x integration boundary, privacy/data-safety inputs, account deletion, internal/closed testing, versionCode/versionName and release verification.

- [ ] **Step 1: Validate checklist contains all required release gates**
- [ ] **Step 2: Add checklist with product-scoped billing names**
- [ ] **Step 3: Verify repository validation and web build still pass**
- [ ] **Step 4: Commit**

Commit message: `docs: add Heroes Play Store release gates`.

## Execution order

Tasks 1–3 deliberately preserve the current browser app and are safe to ship before native generation. Task 4 adds the native shell. Task 5 makes regressions visible and repairs the current preview problem. Task 6 documents the remaining store-console and signing gates that cannot be completed by source code alone.
