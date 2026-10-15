# Nookbud — Regulatory Landscape

> **Date:** 2026-04-07
> **For:** Nookbud discovery

---

## Executive Summary

Nookbud operates at the intersection of four regulatory domains: personal data privacy (Philippines DPA, GDPR, US state laws), children's data protection (COPPA 2025 update), family law evidence admissibility, and app store platform policies. The most critical near-term actions are: GDPR right-to-erasure compliance (an active 2025 enforcement priority), COPPA compliance for handling data related to minors, and Philippines DPA registration. Nookbud is NOT a children's app (users are adults), but it stores data *about* children — a meaningful distinction that affects obligations.

---

## Privacy Regulations

### Philippines — Data Privacy Act of 2012 (RA 10173)

- **Applies if:** Processing personal data of Philippine residents — mandatory given OFW/PH market is a core segment
- **Regulator:** National Privacy Commission (NPC)
- **Key requirements:**
  - Designate a Data Protection Officer (DPO) — required per NPC Circular 2022-04 (effective Jan 2023)
  - Register data processing systems with the NPC
  - Implement a Privacy Management Program
  - Data breach notification within 72 hours of discovery
  - Collect only data necessary for stated purpose (data minimization)
  - Obtain consent for processing sensitive personal information (health, family status, legal proceedings — all relevant to Nookbud)
  - Provide users: right to access, right to correct, right to erasure, right to data portability
- **Sensitive data in Nookbud:** Care records, custody arrangements, health data logged as care entries, legal proceedings — all qualify as sensitive under RA 10173
- **Penalties:** Imprisonment 1–6 years + PHP 500K–5M fines; proposed amendments (pending) would increase penalties significantly
- **Action required:** see ROADMAP-2026.md

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md).

---

### European Union — GDPR (General Data Protection Regulation)

- **Applies if:** Any EU-resident users (even if Nookbud is not EU-based)
- **Key requirements:**
  - Lawful basis for processing (consent or legitimate interest)
  - Right to erasure ("right to be forgotten") — **2025 enforcement priority**: 32 European DPAs are actively auditing this in 2025's Coordinated Enforcement Framework
  - Right to data portability (structured, machine-readable export)
  - Right to access personal data
  - Privacy by design and by default
  - Data Processing Agreement if using EU-based processors
- **Relevance:** TalkingParents was flagged for GDPR violations (refusing account deletion). This is a competitive differentiator — build deletion properly from day 1.
- **Penalties:** Up to €20M or 4% of global annual turnover, whichever is higher
- **Action required:** see ROADMAP-2026.md

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md).

---

### United States — COPPA (Children's Online Privacy Protection Act)

- **Applies if:** App collects data from children under 13, OR has actual knowledge it is doing so
- **2025 update:** FTC finalized updated COPPA rule (effective April 2025) — tighter requirements on data collection, retention limits, and parental consent methods
- **Nookbud's position:** Nookbud is an app for **adults** (parents, guardians, caregivers). It stores data *about* children (names, DOBs, care records) but children do not use the app directly.
  - This likely exempts Nookbud from COPPA's direct requirements — but warrants legal review
  - Recommended: clear age gate in onboarding (18+), explicit Terms stating the app is for adults only
- **Key requirements (if COPPA applies):**
  - Verifiable parental consent before collecting child data
  - Limit data collection to what's necessary
  - Retention limits — delete when no longer needed
  - No behavioral advertising targeting children
- **Action required:** see ROADMAP-2026.md

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md).

---

### United States — State Privacy Laws

- California (CCPA/CPRA), Virginia, Colorado, Texas, and others have state-level privacy laws
- Most mirror GDPR user rights (access, deletion, portability, opt-out of sale)
- **Action required:** see ROADMAP-2026.md

---

### Australia — Privacy Act 1988 + Australian Privacy Principles (APPs)

- **Applies if:** Annual turnover >$3M AUD OR handling sensitive information (Nookbud handles both)
- Key: APP 3 (collection), APP 11 (security), APP 12 (access), APP 13 (correction)
- Australian Privacy Act review (2025): government proposing strengthened individual rights
- **Action required:** see ROADMAP-2026.md

---

## Family Law Evidence Admissibility

### What courts want from digital records
Digital evidence is admissible across US, AU, UK, PH family courts if it meets basic criteria:
- **Authenticity** — can be shown to be what it claims to be
- **Integrity** — has not been altered since creation
- **Chain of custody** — documented path from creation to court

### Nookbud's architecture addresses this
- Server-side timestamps (not client-controllable) → authenticity
- Immutable entry history + version-diffing → integrity
- SHA-256 file hashing + hash manifest → cryptographic proof of integrity
- Supabase audit logs → chain of custody

### What courts do NOT require
- Apps do not need to be "court-approved" in advance (unlike the OFW brand myth)
- Judges evaluate admissibility at the time of submission
- A well-documented, tamper-evident system is sufficient — Nookbud's architecture qualifies

### Jurisdiction notes
- **US:** No federal standard for co-parenting app admissibility; state-by-state; OFW's "court-ordered in 50 states" is marketing, not law
- **Philippines:** Family courts accept digital records if authenticity is established; RA 8792 (E-Commerce Act) governs electronic evidence
- **Australia:** Digital evidence admissible under Evidence Act 1995; authentication requirements apply
- **UK:** Civil Evidence Act 1995; electronic records admissible with proper authentication

---

## App Store Policies

### Apple App Store
- Apps handling data **about** minors must comply with Apple's age-appropriate design guidelines
- If app is NOT designed for children (Nookbud is not), it should clearly state 17+ in the age rating
- Account deletion must be available in-app (required since June 2022)
- As of Jan 2026: apps must implement Apple's age/consent signal APIs if serving markets with age verification laws
- Privacy Nutrition Labels: must accurately declare all data collected

### Google Play
- Similar requirements: account deletion in-app, accurate data safety section
- Apps collecting data related to minors must complete Data Safety disclosure
- Age verification API implementation required for applicable markets as of Jan 2026

---

## Data Handling Requirements

### Data types Nookbud collects
- Account data (name, email, avatar)
- Care records (expenses, events, agreements, milestones, communications)
- Child data (name, date of birth — about minors, not from them)
- File attachments (photos, documents)
- Device/usage data (analytics)

### Retention policy (to be defined)
- Active account: retain all data
- Deleted account: delete within 30 days (GDPR/DPA requirement)
- Legal hold exception: if notified of ongoing legal proceedings

### User rights to implement

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md) — the single source of truth for the roadmap.

---

## Compliance Checklist

> Open items for this area are tracked in [ROADMAP-2026.md](../../../ROADMAP-2026.md) — the single source of truth for the roadmap.

---

**Sources:**
- DLA Piper Data Protection Philippines (dlapiperdataprotection.com)
- National Privacy Commission Philippines (privacy.gov.ph)
- GDPR Art. 17 — Right to Erasure (gdpr-info.eu)
- EDPB 2025 Coordinated Enforcement Framework (right to erasure focus)
- FTC COPPA 2025 Final Rule (federalregister.gov, April 2025)
- Apple Developer — Kids & Families (developer.apple.com/kids)
- App Store Accountability Acts — FKKS Technology Law (Dec 2025)
- Atlas Lawyers — Digital Evidence in Modern Litigation (AU, Nov 2025)
- Philippines E-Commerce Act (RA 8792)
