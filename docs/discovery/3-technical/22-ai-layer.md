# Nookbud — AI Layer

> **Date:** 2026-04-07
> **Status:** 📝 Phase 5 — Not yet built
> **Depends on:** Phases 1–4 complete, user demand signals

---

## Philosophy

**Deterministic, verifiable records come first. AI augments — never replaces — the integrity layer.**

Nookbud's core value is that records are *unambiguously true* — server-timestamped, SHA-256 verified, immutably versioned. Any AI feature must be additive and clearly labeled as AI-generated. AI output should never alter, summarize away from, or replace the underlying record.

AI features are:
- Opt-in only
- Clearly labeled as AI-generated in exports
- Overridable by the user at any time
- Phased behind a working, trusted core product

---

## Planned AI Features (Phase 5)

### Feature 1: ToneMeter — Communication Tone Advisor
- **What:** Flags inflammatory or adversarial language in a Communication entry before saving
- **Input:** Draft communication text
- **Output:** Warning banner + 1–3 suggested neutral rewrites
- **Trigger:** User taps "Check tone" before saving (opt-in, not automatic)
- **Model:** TBD — on-device preferred (privacy); or lightweight cloud model
- **Competitor reference:** OurFamilyWizard's ToneMeter is a proven feature — users appreciate it
- **Phase:** 5

### Feature 2: Smart Export Summary
- **What:** Auto-generates a plain-language executive summary for the verified care report
- **Input:** Set of entries being exported (date range, types, Space)
- **Output:** 2–3 paragraph narrative summary inserted at top of PDF
- **Labeled as:** "AI-generated summary — see full records below for complete detail"
- **Phase:** 5

### Feature 3: Pattern Detection
- **What:** Identifies behavioral patterns across entries that users may want to be aware of
- **Examples:**
  - "3 pickups marked missed in the last 30 days"
  - "No expense acknowledgment from [member] in 45 days"
  - "Child's medical entries have increased — consider logging an agreement"
- **Output:** Insight cards on the Space timeline (dismissable)
- **Phase:** 5+

### Feature 4: Natural Language Entry Creation (Speculative)
- **What:** User describes a care event in natural language; AI structures it into the correct entry type
- **Example:** "Jun sent ₱15,000 for school fees on April 3" → pre-fills Expense entry
- **Phase:** 5+ (after Pattern Detection validated)

---

## AI Safety Guardrails

1. **Never alter records** — AI can annotate or summarize, never modify an entry's stored data
2. **Always labeled** — every AI-generated piece of content is clearly marked "AI-generated" in UI and exports
3. **Opt-in only** — no AI feature runs without user action
4. **Privacy boundary** — no entry content sent to external AI without explicit per-session consent
5. **Fallback always available** — if AI fails or user dismisses, original content stands unchanged
6. **No behavioral scoring of users** — no AI feature should evaluate or score parents/guardians

---

## Implementation Approach

1. Ship Phases 1–4 without AI — build trust on deterministic records first
2. Survey users after 6 months: "What would you want AI to help with in Nookbud?"
3. Prototype ToneMeter with API (Claude / GPT-4o) before building native
4. Evaluate on-device models (Apple Intelligence, Gemini Nano) for privacy-sensitive features
5. A/B test each AI feature — measure: engagement, conversion, trust perception

---

## TODO
- [ ] Ship Phases 1–4 completely
- [ ] Survey users at 500+ paid users mark
- [ ] Prototype ToneMeter (API-based) in 1 sprint
- [ ] Define privacy consent model for AI features
- [ ] Decide on on-device vs cloud model per feature
