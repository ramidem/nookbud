# Nookbud — Monetization Strategy

> **Date:** 2026-04-07
> **Status:** ✅ Researched
> **Depends on:** 10-pricing.md (decided: $17.99/mo · $149.99/yr)

---

## Executive Summary

Nookbud's monetization is built on a single principle: records are the lock-in. Once a user has built a verified care record in Nookbud, leaving means losing their evidence trail — the most powerful churn preventer in any app category. The monetization strategy should maximize trial-to-paid conversion (time-limited trial, hard paywall on export) and annual plan adoption (30% discount), not chase volume with a permanent free tier.

Industry data (RevenueCat 2025): ~30% of annual subscriptions cancel in month 1 — Nookbud's record lock-in is a structural advantage here. Annual plans retain 36% of users after a year vs 6.7% for high-priced monthly — strongly favor pushing annual.

---

## Revenue Streams

### Primary: Family Plan Subscription
- **Monthly:** $17.99/mo
- **Annual:** $149.99/yr ($12.50/mo, save 30%)
- One subscription covers all members of the Space — no per-seat pricing
- Invited co-parents join for free

### Secondary: Professional Tier (Phase 6+)
- Family law attorneys, mediators, parenting coordinators
- Read-only access to client Spaces + verified export tools
- Pricing: TBD ($29–$49/mo per professional seat)
- Timeline: Phase 6

### Future: Certified Record Services
- Notarized / certified printed records (follow OFW model)
- One-time fee per export ($10–$30)
- Timeline: Post-launch, when court network is established

### Not pursued:
- Advertising (incompatible with trust positioning)
- Data sale (incompatible with privacy-first brand)
- Per-parent billing (complexity; 2Houses/WeParent model is better UX)

---

## Trial Strategy

**14-day free trial, no credit card required.**

### Why no permanent free tier
1. Free tiers in this space are deliberately crippled (web-only, no exports) — creates UX resentment
2. Nookbud's core value is record integrity — a free tier where records "don't matter in court" contradicts the brand
3. The ICP (parents in active disputes) doesn't price-shop; they evaluate trust
4. Free tiers attract low-conflict users who dilute support load and churn signal
5. Records = lock-in: a 14-day trial is sufficient to build meaningful data and feel the loss of access

### Trial experience
- Full access to all features during trial
- Clear countdown banner: "X days left in your trial"
- Day 10 soft prompt: "Your records will be locked when trial ends — keep them safe"
- Day 14: hard paywall on all write actions and exports

### Hardship / Fee Waiver Program
- Follow AppClose's model: free accounts for verifiable hardship cases (DV survivors, low-income)
- Application via in-app form or email
- Requires documentation; approved manually
- Strong PR value; ethical positioning

---

## Conversion Funnel

```
Download → Onboard → First Space + Child → First Entry → Invite Co-parent
    ↓                                                           ↓
 (trial starts)                                        (co-parent joins free)
    ↓                                                           ↓
Day 10: soft prompt ("don't lose your records")        Both parties using Nookbud
    ↓                                                           ↓
Day 14: hard paywall on exports + new entries          Network effect = harder to leave
    ↓
Convert (push annual: "Save 30%")
    ↓
Retain (records compound → more valuable over time)
```

### Industry benchmarks (RevenueCat 2025)
- Trial → paid conversion: top 10% of apps convert at 2–3× the median
- Annual plan retention after 1 year: ~36% (vs 6.7% for high-priced monthly)
- ~30% of annual subs cancel in month 1 — Nookbud's record lock-in directly counters this

### Free-to-Paid Triggers
1. **Trial expiry** — primary trigger; time limit is the simplest conversion driver
2. **Export attempt** — user tries to generate a verified report; hard paywall
3. **Invite limit** — solo trial is free; inviting a co-parent requires paid (consider as gate)
4. **File upload** — attaching documents/photos gated behind paid plan
5. **Re-engagement** — court hearing coming up; needs records urgently

---

## Pricing Psychology & Annual Push

**Aggressively push annual at conversion moment.**

- Show annual first: "$149.99/yr — that's $12.50/month"
- Monthly as the "flexible" option: "$17.99/month — cancel anytime"
- Annual savings framing: "Save $65.89 vs monthly" (not just "save 30%")
- Urgency: "Your 14-day trial ends [date]. Secure your records."

**Why annual matters for Nookbud:**
- Annual subscribers are ~5× more retained than monthly (RevenueCat 2025)
- Records accumulate over months/years — annual commitment = lower churn risk
- Reduces billing friction (one payment vs monthly anxiety)

---

## Upsell Path

Phase 1–3: No upsell needed — one plan covers everything

Phase 6+:
- Family Plan → Professional Tier (for lawyers/mediators)
- One-time certified record exports

---

## Churn Prevention

### Structural churn prevention
- **Records are the moat:** Every entry logged = harder to leave. After 3 months of use, switching cost is the entire evidence trail.
- **Co-parent network effect:** When both parties are in a Space, neither wants to lose access. The Space owner's subscription protects both parties.

### Active churn prevention
- 7 days before renewal: "Your Space has X entries over Y months — here's what you'd lose"
- Failed payment grace period: 7 days before locking (prevent involuntary churn — industry loses $1.6B/yr to this)
- Pause option: offer 1-month pause before cancellation (reduces full churn)
- Win-back: lapsed users get "your records are still here — resume for $X"

---

## Revenue Model (Rough Projections)

*Assumptions: 14-day trial, 25% trial→paid conversion (optimistic for trust-based app), 80% annual mix, 15% annual churn, $149.99 ARPU annual / $17.99 ARPU monthly.*

| Month | Paying Users | MRR | Notes |
|-------|-------------|-----|-------|
| 1 | ~20 | ~$300 | Soft launch, core network |
| 3 | ~100 | ~$1,500 | OFW community + Reddit traction |
| 6 | ~400 | ~$6,000 | Lawyer referrals beginning |
| 12 | ~1,200 | ~$18,000 | ARR ~$216K |

*These are rough directional estimates. Update with real data monthly.*

---

## TODO
- [ ] Design paywall screen (annual-first layout)
- [ ] Set up RevenueCat (already installed in Falcly — reuse pattern)
- [ ] Implement trial countdown banner
- [ ] Build hardship waiver flow (in-app form)
- [ ] Define invoice/receipt flow for annual subscribers
- [ ] Set up dunning (failed payment recovery) in RevenueCat
- [ ] Build "your records summary" email at renewal time

**Sources:** RevenueCat State of Subscription Apps 2025, Marketing LTB Subscription Statistics 2025, pricing.md research
