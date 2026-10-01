# STACKUP HOLD'EM — Product & Technical Architecture
## StackUp Heroes baseline — 2026-10-01

Status: APPROVED DESIGN BASELINE  
Scope: StackUp Heroes plus reusable rules for Academy, Grinder, EVO and future StackUp Hold'em apps.

## 1. Product principle

STACKUP HOLD'EM is an ecosystem of commercially independent but strategically connected apps.

Each app MUST have its own:
- product identity;
- FREE / EDGE / FULL plans;
- subscription and entitlement;
- funnel;
- activation and retention logic;
- analytics;
- revenue and P&L;
- app-specific data;
- roadmap and release lifecycle.

A paid plan in one app never grants the equivalent paid plan in another app unless a future bundle is explicitly created as a separate commercial product.

Canonical model:

- GRINDER EDGE != EVO EDGE
- GRINDER FULL != EVO FULL
- ACADEMY FULL != HEROES FULL

A user can simultaneously have different tiers in different apps.

## 2. Ecosystem architecture

Shared StackUp Core:
- StackUp ID / identity;
- basic user profile;
- product catalog;
- subscription mirror / billing ledger;
- entitlements;
- benefits;
- coupon / promotion engine;
- cross-sell attribution;
- privacy / consent records;
- security events;
- ecosystem analytics identifiers.

Independent per-product domains:
- content;
- training engines;
- statistics;
- progress;
- product-specific history;
- app rules;
- app-specific APIs;
- app-specific storage and operational data.

Target topology:

```
                   STACKUP CORE
          identity / billing / entitlements
        benefits / cross-sell / ecosystem data
                         |
      +------------------+------------------+
      |                  |                  |
  ACADEMY API        GRINDER API         EVO API
  ACADEMY DATA       GRINDER DATA        EVO DATA
      |
  (future apps)

                    HEROES API
                    HEROES DATA
```

Failure isolation is mandatory: a failure in EVO must not make Grinder or Academy unavailable.

## 3. StackUp ID

StackUp ID is the global identity layer, not a global subscription.

Use an immutable UUID as the canonical user identifier. Never use email as the primary identity.

Global identity may contain:
- user UUID;
- email / login identities;
- display profile;
- locale and preferences;
- devices;
- active products;
- global purchase history;
- benefits;
- consent/privacy records.

Training/progress data remains scoped by product and references the global StackUp user ID.

Biometrics are a device-level reauthentication/unlock mechanism. Biometrics are not an independent account identity.

## 4. Subscription model

Canonical subscription record:

```
user_id
product_id
tier
billing_platform
billing_product_id
status
started_at
renewal_at
expires_at
```

Examples:
- heroes / FREE
- grinder / EDGE
- evo / FULL

Never represent the commercial model as one global field such as `stackup_plan = FULL`.

## 5. Plans

### FREE
Purpose:
- create first value;
- demonstrate methodology;
- build habit;
- expose a meaningful but bounded version of the product.

### EDGE
Primary paid plan.
Purpose:
- deliver the core recurring value proposition;
- provide the best price/value relationship;
- become the expected main paid tier.

### FULL
Maximum experience for that individual product.
Purpose:
- advanced volume;
- advanced analytics;
- advanced personalization;
- premium modules;
- computationally expensive or power-user capabilities.

Product rule:
FREE proves value -> EDGE delivers the core product -> FULL maximizes the product.

## 6. Conversion

Each product owns its funnel.

Example:
install -> first open -> first value -> repeated use -> EDGE offer -> EDGE purchase -> sustained use -> FULL offer -> FULL purchase -> renewal.

Cross-sell is a separate funnel and must never replace product conversion metrics.

Cross-sell events:
- cross_sell_viewed
- cross_sell_trial_started
- cross_sell_converted

Required dimensions:
- origin_product
- destination_product
- destination_plan

## 7. Cross-sell rules

Allowed mechanisms:
- limited Free+ access;
- one-time trial;
- premium sampling;
- controlled second-product discount.

Cross-sell MUST NOT permanently unlock the paid core loop of the destination app.

The economic purpose is incremental LTV and retention, not subsidizing a weak product.

## 8. Multi-app discounts

No permanent blanket discount is assumed.

Initial commercial testing should compare controlled offers such as:
- no discount;
- moderate second-app discount;
- trial;
- Free+;
- annual incentive.

Evaluate on contribution margin, attach rate, retention, ARPU and LTV.

Never automatically reduce the price of an already-converted first subscription merely because a second product is purchased.

## 9. Analytics contract

Every event must include:
- product;
- platform;
- app_version;
- stackup_user_id when authenticated;
- plan;
- timestamp;
- session_id.

Product-specific events may add:
- training_type;
- module;
- section;
- difficulty;
- result;
- duration;
- scenario identifiers.

Core per-product metrics:
- DAU / WAU / MAU;
- D1 / D7 / D30;
- retention;
- churn;
- ARPU;
- ARPPU;
- LTV;
- CAC;
- FREE -> EDGE;
- EDGE -> FULL;
- renewal rate.

Ecosystem metrics:
- cross-sell rate;
- users with 2+ products;
- multi-product ARPU;
- single-product LTV;
- multi-product LTV;
- upsell rate;
- average discount.

Product dashboards remain independent from the ecosystem dashboard.

## 10. Payments

Each app owns distinct store products.

Example naming:
- heroes_edge
- heroes_full
- grinder_edge
- grinder_full
- evo_edge
- evo_full

Monthly and annual billing periods should be modeled as store/base-plan variants where the platform supports that structure.

The mobile client is never the source of truth for entitlement.

Backend responsibilities:
- receive/verify purchase state;
- normalize platform state;
- maintain subscription mirror;
- calculate entitlement;
- process renewals/cancellations/grace periods;
- expose entitlement to each product API.

Android: Google Play Billing.
iOS future: StoreKit.
Web future: web payment provider.
All normalize into the StackUp entitlement layer.

## 11. Data architecture

Initial recommendation:
- Supabase for StackUp Core identity and relational data;
- PostgreSQL;
- RLS on exposed tables;
- app-specific logical boundaries from day one.

Evolution path:
- StackUp Core project;
- independent product schemas/services initially where economical;
- separate Supabase/Postgres projects per high-growth app when load, blast-radius or compliance justify it.

The architecture must allow:
- Academy DB;
- Grinder DB;
- EVO DB;
- Heroes DB;

without changing StackUp ID semantics.

## 12. Security baseline

Mandatory:
- no service-role/private secret in public clients;
- server-side entitlement checks;
- RLS on exposed tables;
- least privilege;
- secure token storage on mobile;
- rate limiting;
- audit/security events;
- secrets separated by product;
- encrypted network transport;
- backup and recovery policy;
- account deletion workflow;
- privacy-conscious analytics;
- dependency lockfiles and pinned production dependencies.

## 13. Scale strategy

### Phase 1: 0–1,000 users per app
- managed Postgres;
- serverless/API service;
- object storage/CDN;
- backups;
- crash/error tracking;
- basic analytics;
- no speculative distributed architecture.

### Phase 2: 1,000–10,000
- query/index review;
- connection pooling;
- async jobs;
- improved observability;
- cost-per-user tracking.

### Phase 3: 10,000–100,000
- targeted caching;
- dedicated queues/workers;
- read scaling where justified;
- warehouse/analytics pipeline if product analytics load warrants it.

### Phase 4: 100,000–1,000,000
- horizontal scaling;
- partition high-volume data;
- stronger service isolation;
- circuit breakers;
- disaster recovery drills.

### Phase 5: >1,000,000
- regional strategy when required;
- workload isolation;
- advanced data partitioning/sharding only where metrics require;
- mature SRE/FinOps controls.

Scale triggers:
- p95/p99 latency;
- DB CPU and connections;
- queue backlog;
- error rate;
- storage growth;
- billing event lag;
- cost per active user.

## 14. StackUp Heroes — technical baseline

Current repository state:
- repository: SkyareCom/stackup.holdem-heroes
- branch: main
- current app is concentrated in a single large index.html
- current HTML contains UI, assets/fonts, CSS and application JavaScript together
- current authentication flows are prototype/demo level
- app must not continue growing as a single monolithic file

Target mobile architecture:
- modular web application;
- native Android shell through Capacitor;
- Android target compatible with current Google Play requirements;
- Android App Bundle release pipeline;
- future iOS shell using the same application core where appropriate.

Recommended structure:

```
src/
  app/
  screens/
  components/
  modules/
  services/
    auth/
    billing/
    analytics/
    api/
  storage/
  config/

public/
assets/
android/
capacitor.config.ts
package.json
```

Proposed Android identity:
- applicationId: com.stackupholdem.heroes

Commercial identity:
- product: heroes
- tiers: FREE / EDGE / FULL
- store products: heroes_edge / heroes_full

The applicationId becomes a permanent store identity after publication and should not be casually changed.

## 15. Heroes migration rules

1. Preserve validated visual design and UX unless a change is required for correctness, usability or store compliance.
2. Separate code before adding significant new features.
3. Remove inherited/residual product naming and storage keys from prior prototypes.
4. Replace simulated auth with real identity services.
5. Implement billing behind a service interface, not directly inside UI components.
6. Implement analytics behind one product-aware analytics interface.
7. Keep entitlement checks server-backed.
8. Generate release artifacts through a reproducible build.
9. Maintain separate dev/test/prod configuration.
10. Do not use the GitHub repository itself as runtime backend/storage.

## 16. Heroes delivery sequence

### Now
- preserve current UI;
- inventory current screens, flows and prototype code;
- create modular project shell;
- define product constants and app identity;
- define StackUp ID interfaces;
- define analytics contract;
- define entitlement interfaces;
- prepare Android shell.

### 30 days
- real authentication;
- product database/API;
- FREE experience;
- analytics;
- crash reporting;
- Android internal testing;
- privacy/account-deletion flows.

### 60 days
- Play Billing;
- EDGE;
- FULL;
- purchase verification;
- subscription lifecycle;
- entitlement synchronization;
- conversion dashboards.

### 90 days
- first controlled cross-sell experiment;
- cohort retention;
- churn recovery;
- multi-product offer experiment.

### 6 months
- multiple StackUp apps connected through StackUp ID;
- ecosystem analytics;
- mature cross-sell attribution;
- iOS-ready service contracts.

### 12 months
- optimize based on actual LTV, churn, retention and attach-rate data;
- physically isolate high-growth workloads when justified;
- evaluate optional future bundle only from evidence, never as the default model.

## 17. Non-negotiable rules

- One identity, multiple products, multiple subscriptions.
- Every app must be commercially viable independently.
- StackUp ID connects people, not plans.
- Cross-sell connects opportunities, not entitlements by default.
- Billing remains product-scoped.
- Product-specific runtime failures must be isolated.
- Analytics always identify the product.
- No superplan is required for the initial ecosystem.
- Avoid overengineering; scale by measured bottlenecks.
