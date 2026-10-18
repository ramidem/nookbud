# Quick-Income Plan: ASO Audits + RN Starter

Drafts for you to review, edit and send yourself. Prices are starting guesses; adjust after your first few conversations. Nothing here has been sent or published.

---

## 1. The Offer: App Store Listing Audit

**One line:** "I rewrite your App Store listing so more people who see your app actually download it. Fixed price, 3 days, no calls."

### Packages

| | Audit | Audit + Implementation |
|---|---|---|
| Price (start here) | $149 | $349 |
| Turnaround | 3 business days | 5 business days |
| Keyword research (long-tail, per market) | yes | yes |
| Rewritten title / subtitle / keyword field (iOS limits: 30/30/100) | yes | yes |
| Android short + long description rewrite | yes | yes |
| Screenshot critique (first two = most impact) | yes | yes, with rewritten caption copy |
| Icon + review-rating check | yes | yes |
| Prioritized fix list (top 5 by impact) | yes | yes |
| I draft the metadata update ready to paste into App Store Connect / Play Console | | yes |
| 30-day follow-up: ranking check + one revision | | yes |

You (or the client) submit the metadata. Never ask for App Store Connect credentials. Send the text, they paste it.

### What the audit report contains (use as a template)

1. **Snapshot:** current title, subtitle, keywords visible, rating, review count, category rank if known.
2. **Keyword gaps:** 10-15 long-tail terms competitors rank for that this app doesn't target, with a one-line reason each.
3. **Metadata rewrite:** exact new title, subtitle and 100-char keyword field. Check: front-loaded keyword, no duplicates across the three fields, no spaces after commas.
4. **Visuals:** what the first two screenshots communicate in 2 seconds. Outcome-first caption rewrites. Icon distinctiveness vs. the top 5 competitors.
5. **Ratings and reviews:** is rating at or above 4.0? Common complaint themes, and a reply template for negative reviews.
6. **Top 5 fixes, ranked:** impact vs. effort.
7. **Testing plan:** one element at a time, minimum 7 days (Custom Product Pages on iOS, Store Listing Experiments on Android).

### Honest positioning

- Do not promise rankings or download numbers. Promise a better listing and a clear plan.
- No fake testimonials. Until you have real ones, use the free sample audits below as proof.

### Get the first proof: 3 free audits

Pick 3 public apps (indie apps you find on Product Hunt or Reddit, with permission-style outreach, see below). Offer a free audit in exchange for permission to share a before/after if it helps. Ask for a real quote after they've seen the report. Only publish a quote they actually gave.

---

## 2. Where to find buyers

Best fit: solo or small-team iOS/Android developers with a live app, under about 1,000 ratings, and a weak listing (generic title, no keywords in subtitle, screenshots that show UI instead of outcomes).

- r/iOSProgramming, r/SideProject, r/androiddev (read each subreddit's self-promo rules first)
- Indie Hackers "launched" posts
- Product Hunt launches from the last 60 days
- X/Twitter build-in-public developers posting "just shipped"
- Your own network

Rule: one specific, true observation per message. No mass blasting.

---

## 3. Outreach templates

### A. Cold DM (X, Reddit chat, email)

> Hey [name], saw [app] on [where]. Nice work, [one specific thing you liked].
>
> I do App Store listing audits. Quick thing I noticed: [one concrete observation, e.g. "your subtitle doesn't use any search terms; 'X' and 'Y' have far less competition than 'Z'"].
>
> Happy to send you a short free breakdown of what I'd change. No strings. Want it?

### B. Follow-up (3-4 days later, once only)

> Following up in case this got buried. I put together [2 bullets of what I found] for [app]. Want me to send the full thing?

### C. Delivering a free sample

> Here's the audit for [app]: [link/file]. Biggest quick win is [fix #1]. If it's useful and you want me to write the exact metadata ready to paste, that's a $149 paid audit. If you'd rather do it yourself, the report is yours either way.

### D. Public post (X / Reddit where allowed)

> I'm doing 3 free App Store listing audits this week to build my portfolio. Reply with your app link. I'll look at your title, subtitle, keywords and first two screenshots and send back a prioritized fix list. After that it's $149 per audit.

### E. Proposal when someone says yes to paid

> Great. Here's what you get: [package]. $[price], paid up front through [Stripe/PayPal link you set up]. I need: your app link, your top 2-3 competitors, and your target countries. Delivery: [date].

---

## 4. Second product: React Native starter template

Do this after your first audit sale. The Expo boilerplate market is crowded, so don't compete on "has auth". Differentiate on what you know that others don't: ASO-ready store setup, performance rules, and a working paywall.

### Scope (v1)

- Expo + TypeScript + Expo Router, strict mode, ESLint + Prettier, `tsc --noEmit` clean
- Auth shell (email/password via a pluggable provider, `expo-secure-store` for tokens, no secrets in client)
- Onboarding flow + paywall (RevenueCat), trial/annual-first layout
- Settings: account deletion flow (required by App Store / Play), privacy/terms links, restore purchases
- EAS build profiles (dev, preview, production) and a release checklist
- **Differentiator:** `STORE-LISTING.md` with fill-in ASO templates (title/subtitle/keyword field limits, screenshot caption formulas) drawn from your `aso.md` rules
- **Differentiator:** performance and navigation rules drawn from your `react-native.md`
- Short README: clone, run, rename, ship in a day

### Scaffold: project structure

Lives in its own repo (`~/Code/bulakao/rn-starter`), not inside `nookbud`.

```
rn-starter/
├── app/                  # Expo Router screens
│   ├── (auth)/           # sign-in, sign-up, reset password
│   ├── (onboarding)/     # 3-step intro flow
│   ├── (tabs)/           # home, settings
│   └── paywall.tsx       # RevenueCat paywall, annual plan first
├── src/
│   ├── auth/             # pluggable provider, tokens in expo-secure-store
│   ├── purchases/        # RevenueCat wrapper, restore purchases
│   └── ui/               # base components, theme tokens
├── eas.json              # dev / preview / production build profiles
├── STORE-LISTING.md      # fill-in ASO templates (from aso.md)
├── RELEASE-CHECKLIST.md  # submit-to-store steps
└── README.md             # clone, rename, run, ship
```

Not in v1: real backend wiring (auth is a stub provider), RevenueCat keys (the buyer adds their own), landing page, demo video, sales listing.

### Scaffold: done when

- `tsc --noEmit` passes, lint has 0 errors, format check passes
- App launches in an Expo dev build and the main flow works: onboarding, sign-in stub, paywall, settings, account deletion
- No secrets or keys committed; `.env.example` documents what the buyer must add
- README steps work from a fresh clone

### Pricing and sales

- $49 personal / $99 team; sell through Gumroad or Lemon Squeezy (they handle payments and VAT)
- Launch: one demo video (60s), one landing page, one post on X/Reddit/Indie Hackers
- Bundle: template + one audit at a discount, so the two products feed each other

### Build estimate

About 1-2 weeks of part-time work. The scaffold itself is one session; polish, demo video and the sales listing take the rest. Not started yet.

---

## 5. What's yours to do

I can't do these for you:

1. Create the payment link (Stripe/PayPal/Gumroad) and receive money.
2. Send the messages from your accounts. Review each one first.
3. Create accounts on Gumroad / Lemon Squeezy / RevenueCat.
4. Decide your final prices.

## 6. Next 7 days

- **Day 1:** Pick 10 target apps. Write the real observation for each.
- **Day 2-3:** Send 10 DMs (template A). Post template D once.
- **Day 3-6:** I draft the free audits for whoever replies.
- **Day 7:** Send paid proposals (template E). Start the template scaffold if you have your first sale or strong interest.
