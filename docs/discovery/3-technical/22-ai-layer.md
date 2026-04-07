# Nookbud — AI Layer

> **Status:** 📝 TODO — Phase 5 feature
> **Depends on:** Core product working (Phases 1–4)

---

## Philosophy
Deterministic, verifiable records are the core product. AI augments — never replaces — the integrity layer. AI features are opt-in.

---

## Planned AI Features (Phase 5)

### Feature 1: ToneMeter (Communication Advisor)
- **What:** Flags inflammatory language before sending a message
- **Input:** Draft message text
- **Output:** Warning + suggested rewording
- **Model:** TBD (on-device preferred for privacy)
- **Phase:** 5

### Feature 2: Smart Export Summary
- **What:** Auto-generates a plain-language summary of a date range for export
- **Input:** Entry set for export
- **Output:** Executive summary paragraph
- **Phase:** 5

### Feature 3: Pattern Detection
- **What:** Flags patterns (e.g., repeated missed pickups, declining expense acknowledgment)
- **Input:** Entry history
- **Output:** Insight cards on dashboard
- **Phase:** 5+

---

## AI Safety Guardrails
- Never alter or summarize records — only annotate
- All AI output clearly labeled as AI-generated
- User can dismiss/ignore all AI suggestions
- Privacy: no entry content sent to external AI without explicit consent

---

## TODO
- [ ] Ship Phases 1–4 without AI
- [ ] Validate top user pain points AI could address
- [ ] Prototype ToneMeter with API before building in-app
- [ ] Define privacy model for AI features
