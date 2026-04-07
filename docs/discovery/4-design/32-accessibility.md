# Nookbud — Accessibility

> **Status:** 📝 TODO — Audit before launch
> **Depends on:** Implementation complete

---

## Requirements

### Screen Reader Support
- [ ] All interactive elements have accessibility labels
- [ ] Images have alt text
- [ ] Focus order is logical

### Color & Contrast
- [ ] Minimum 4.5:1 contrast ratio (WCAG AA)
- [ ] No color-only indicators
- [ ] Dark mode support

### Touch Targets
- [ ] Minimum 44×44pt touch targets
- [ ] Adequate spacing between targets

### Motion
- [ ] Respect `reduceMotion` preference
- [ ] No essential information conveyed through animation only

### Internationalization
- [ ] Filipino (Tagalog) localization (OFW market)
- [ ] Date/currency formatting per locale

---

## TODO
- [ ] Run automated a11y audit
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Test with reduced motion
- [ ] Consider Tagalog localization for PH market
