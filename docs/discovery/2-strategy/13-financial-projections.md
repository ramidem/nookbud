# Nookbud — Financial Projections

> **Date:** 2026-04-07
> **Status:** ✅ Researched
> **Depends on:** 10-pricing.md, 12-go-to-market.md, 11-monetization.md

---

## Executive Summary

Nookbud's financial model is characterized by high ARPU ($17.99/mo or $149.99/yr), strong structural lock-in (records accumulate), and near-zero marginal cost per additional co-parent Space member. The main variable is download-to-trial rate and trial-to-paid conversion. Industry median conversion (trial → paid) runs 15–25% for apps in this category; Nookbud's trust-based positioning and hard paywall on exports should push toward the higher end. Break-even on infrastructure is achievable at ~50–75 paying users.

**App store fee note:** Apple/Google take 15% of subscription revenue (for subs > 1 year old; 30% first year). Net revenue after fees: ~$15.29/mo or ~$127.49/yr per paying user.

---

## Key Assumptions

| Metric | Conservative | Target | Optimistic |
|--------|-------------|--------|------------|
| Monthly new installs | 200 | 500 | 1,500 |
| Download → trial rate | 20% | 35% | 50% |
| Trial → paid conversion | 15% | 25% | 35% |
| Annual vs monthly mix | 60% | 75% | 85% |
| Monthly churn (monthly subs) | 12% | 8% | 5% |
| Annual churn (annual subs) | 20% | 12% | 8% |
| Blended ARPU (net of store fees) | $11/mo | $13/mo | $15/mo |

**Industry benchmarks (RevenueCat 2025, Marketing LTB 2025):**
- Average mobile subscription monthly churn: 9%
- Annual plan year-1 retention: ~36% (vs 6.7% monthly high-price)
- 30% of annual subs cancel in month 1 — lock-in is critical pre-billing
- Subscription app industry ARPU: $8.41 (Nookbud targets above median at $12.50–$17.99)

---

## Revenue Projections

### Conservative Scenario (200 installs/mo, 15% conversion)

| Month | Cumulative Installs | Trial Users | New Paid | Total Paid | MRR (net) |
|-------|--------------------|-----------|---------|-----------|-----------| 
| 1 | 200 | 40 | 6 | 6 | $66 |
| 3 | 600 | 120 | 18 | ~28 | $308 |
| 6 | 1,200 | 240 | 36 | ~80 | $880 |
| 12 | 2,400 | 480 | 72 | ~200 | $2,200 |

### Target Scenario (500 installs/mo, 25% conversion)

| Month | Cumulative Installs | Trial Users | New Paid | Total Paid | MRR (net) |
|-------|--------------------|-----------|---------|-----------|-----------| 
| 1 | 500 | 175 | 44 | 44 | $572 |
| 3 | 1,500 | 525 | 131 | ~175 | $2,275 |
| 6 | 3,000 | 1,050 | 263 | ~500 | $6,500 |
| 12 | 6,000 | 2,100 | 525 | ~1,200 | $15,600 |

### ARR at Month 12 (Target): ~$187,000

---

## Cost Structure

### Fixed Costs (Monthly, Early Stage)
| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Supabase Pro | $25 | Auth + DB; free up to 500MB |
| Firebase Blaze | $0–$30 | Pay-as-you-go; file uploads only when Family Plan active |
| RevenueCat | $0 | Free up to $2.5K MRR, then $119/mo |
| Apple Developer | $99/yr (~$8/mo) | Required for App Store |
| Google Developer | $25 one-time | Required for Play Store |
| PostHog | $0 | Free up to 1M events |
| Domain + hosting | $15/mo | nookbud.com + landing page |
| **Total Fixed** | **~$80/mo** | Scales with users after $2.5K MRR |

### Variable Costs
| Item | Cost per User | Notes |
|------|-------------|-------|
| App store fee | 15–30% of revenue | 30% year 1, 15% thereafter |
| Firebase Storage | ~$0.026/GB/mo | Only paid users can upload files |
| Support | $0 early stage | Async email only at launch |

### Infrastructure Break-Even
At ~75 paying users at $17.99/mo blended = ~$1,349 gross MRR
After store fees (~22% blended): ~$1,052 net MRR
Fixed costs: ~$80/mo
**Break-even: ~75 paying users** — very achievable in month 1–2 with a warm launch.

---

## Unit Economics

| Metric | Value | Notes |
|--------|-------|-------|
| **Gross ARPU (monthly sub)** | $17.99 | Headline price |
| **Net ARPU (monthly, after fees)** | $15.29 | After 15% store fee |
| **Gross ARPU (annual)** | $149.99/yr = $12.50/mo | |
| **Net ARPU (annual, after fees)** | $127.49/yr = $10.62/mo | |
| **Blended net ARPU (75% annual mix)** | ~$11.50/mo | |
| **CAC (organic only)** | ~$0–$10 | Reddit/community, no paid ads |
| **LTV (annual, 12% churn)** | ~$88/yr × (1/0.12) ≈ **$733** | Simple LTV model |
| **LTV:CAC** | >73:1 (organic) | Extremely favorable |
| **Payback period** | < 1 month (organic) | At near-zero CAC |

*Note: LTV is likely higher than simple churn model suggests, because record lock-in extends tenure significantly. A parent mid-custody case who built 2 years of records in Nookbud will not cancel.*

---

## Key Financial Milestones

| Milestone | Target Date | Metric |
|-----------|------------|--------|
| Break-even on infrastructure | Month 1–2 | 75 paying users |
| RevenueCat paid tier | ~Month 3–4 | $2.5K MRR |
| $10K MRR | Month 6–8 | ~750 paying users |
| $20K MRR | Month 10–12 | ~1,500 paying users |
| Consider hiring (part-time support) | $15K MRR | |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low trial→paid conversion | Medium | High | A/B test paywall, trial length, messaging |
| High early churn (month 1 annual) | High (30% industry avg) | High | Record lock-in, better onboarding hook |
| OFW market slower to adopt than US | Medium | Medium | US first, OFW Phase 2 |
| Legal copycat by OFW | Low | High | Spaces model moat; brand first-mover |
| App store fee changes | Low | Medium | Build web billing path (Phase 3+) |

---

## TODO

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md) — the single source of truth for the roadmap.

**Sources:** RevenueCat State of Subscription Apps 2025, Marketing LTB Subscription Statistics 2025, Adapty State of In-App Subscriptions 2026, BusinessDojo ARPU Estimation Oct 2025
