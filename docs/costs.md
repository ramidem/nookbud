# Costs

Estimates for running Nookbud, from 2026-10-24. Revisit before launch. Prices change, so recheck anything marked unverified.

## Monthly estimate

| Item | Cost | How sure |
| --- | --- | --- |
| Cloud Run production, one warm instance (1 vCPU, 512 MiB), no traffic | $9.86 to $13.80 | Rates verified; the Singapore idle multiplier is unknown, hence the range |
| …with 100,000 requests a month | $10.80 to $14.70 | Same, assuming 300 ms a request |
| …with 1 million requests a month | $19 to $23 | Same |
| …with 5 million requests a month | $58 to $60 | CPU time per request becomes the cost |
| Cloud Run API service (private, scales to zero) | about $0–2 | Follows from the same rates |
| Cloud Build (runs only when a tag is pushed) | about $0 | 2,500 free build-minutes a month on its default machine |
| Artifact Registry, Secret Manager, logs, outgoing traffic | about $1–5 | From memory, unverified |
| Supabase: Free plan (2 projects, pauses after a week idle, no backups) | $0 | Verified |
| Supabase: Pro (daily backups, no pausing, one Micro database included) | $25 | Verified |
| CDN: Cloudflare free tier | $0 | Certain |
| CDN: Cloud CDN behind a global load balancer | about $18 or more | From memory, unverified |
| Domain | about $11 a year | From the brand notes |

## Totals

- **Before launch** (no warm instance, Supabase Free): about $0–5.
- **At launch, lean** (warm web instance, Supabase Pro for production): about **$37–45**.
- **With Cloud CDN and its load balancer:** about $65–73.
- **No revenue at first:** the MVP launches on a free tier (spec D6), so these costs are carried until paid features exist.
- **Vercel instead:** about $45–55 plus usage ($20 a seat plus the same Supabase bill). Google Cloud is not cheaper; the difference is learning, and the time to set it up.

## Sources

- Supabase: [pricing page](https://supabase.com/pricing).
- Cloud Run rates and the 1.4× Singapore multiplier for request-based billing: [a worked-examples article](https://dev.to/elimio/what-cloud-run-costs-with-worked-examples-378i). Google's own [pricing page](https://cloud.google.com/run/pricing) would not load for the tool that gathered these, so check the idle rate for `asia-southeast1` in the [calculator](https://cloud.google.com/products/calculator).

## Guardrails

Set in R5, R42 and R45: billing alerts, a maximum instance count, no warm instance until launch, and Supabase Free until launch. Always-allocated CPU on Cloud Run costs about $50–60 a month for the same instance, so keep request-based billing.

## Not costed yet

Email sending, payment fees, App Store and Google Play developer fees, monitoring beyond the free tier, and legal review.

## Revisit when

- Before launch: turn on the warm instance, move production to Supabase Pro, and recheck the Singapore idle rate.
- Traffic passes about a million requests a month: a CDN (R46) cuts the bill as well as the latency.
- The route for charging users is chosen (OQ11 in [the spec](spec.md)): payment fees and store commissions belong in this page.
