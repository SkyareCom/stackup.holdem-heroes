# StackUp Heroes — Play Store Release Checklist

Baseline: 2026-10-01

## Product identity
- [x] Product key: `heroes`
- [x] Android application ID reserved: `com.stackupholdem.heroes`
- [x] Plan family: FREE / EDGE / FULL
- [x] Paid store product IDs reserved: `heroes_edge`, `heroes_full`
- [ ] Confirm the application ID in Play Console before the first production release; treat it as permanent after publication.

## Android build
- [x] Capacitor pinned to 8.5.2.
- [x] Web build output: `dist/`.
- [x] CI generates the Android shell from the pinned Capacitor template.
- [x] CI verifies compileSdk/targetSdk 36.
- [ ] Commit or deterministically generate the final Android project used for signed releases.
- [ ] Configure `versionCode` and `versionName` release policy.
- [ ] Build `.aab` with the release pipeline.
- [ ] Verify install/launch/back-navigation on physical Android devices.
- [ ] Verify small/large screen layout and system-bar safe areas.

## Signing
- [ ] Create/confirm Play App Signing configuration.
- [ ] Create and securely back up the upload key.
- [x] Keystores are ignored by git.
- [ ] Store signing material outside the public repository.
- [ ] Configure release signing only through protected CI secrets or a secure local build environment.

## Authentication / StackUp ID
- [ ] Replace browser-demo Google login with a real provider integration.
- [ ] Connect StackUp ID to backend identity.
- [ ] Use biometrics only as device reauthentication/unlock, not as a separate identity.
- [ ] Remove or clearly disable demo-only login paths before production.
- [ ] Verify logout/revocation and multi-device behavior.
- [ ] Implement account deletion in-app.
- [ ] Provide a web-accessible account deletion/request path.

## Billing
- [x] Billing service boundary exists and cannot grant entitlement locally.
- [x] Heroes paid product identifiers are product-scoped.
- [ ] Integrate Google Play Billing 9.x for Android.
- [ ] Create Play Console subscription products/base plans for Heroes only.
- [ ] Verify purchases server-side.
- [ ] Implement subscription mirror and entitlement service.
- [ ] Handle renewal, cancellation, expiration, grace period, account hold and restore.
- [ ] Configure Real-time Developer Notifications where used.
- [ ] Test FREE -> EDGE, EDGE -> FULL, downgrade and restore independently from other StackUp apps.

## Privacy / data safety
- [ ] Publish privacy policy.
- [ ] Complete Play Data safety declarations from actual SDK/data behavior.
- [ ] Document collected data, purposes, retention and deletion.
- [ ] Ensure analytics contains product-scoped identifiers but no unnecessary personal/sensitive data.
- [ ] Review all third-party SDKs before Play submission.

## Analytics
- [x] Analytics service injects `product = heroes`.
- [ ] Instrument app_open.
- [ ] Instrument activation / first-value event.
- [ ] Instrument training_started / training_completed when the Heroes training loop is finalized.
- [ ] Instrument pricing_viewed.
- [ ] Instrument subscription_started / upgraded / renewed / canceled.
- [ ] Instrument cross_sell_viewed / trial_started / converted separately from Heroes conversion.

## Testing tracks
- [ ] Internal testing build.
- [ ] Closed testing if required for the developer account/release path.
- [ ] Crash-free launch verification.
- [ ] Billing test accounts/license testers.
- [ ] Upgrade test from a prior installed version.
- [ ] Fresh install test with no legacy localStorage.
- [ ] Migration test from legacy `wraps.lang` / `wraps.session` data.

## Release gate
Do not promote to production until:
1. CI is green.
2. AAB is generated from the same source revision.
3. Signing is controlled and backed up.
4. Authentication is no longer simulated.
5. Entitlements are server-backed.
6. Privacy/account deletion requirements are implemented.
7. Critical navigation, purchase and restore flows pass on physical Android hardware.
