# Chronos Design Ethics

> **Locked reference:** compare every landing page, auth screen, and UI revamp against [Sunsama](https://www.sunsama.com/).
> Goal is not to copy — it's to match their *calm, premium, conversion-focused* design discipline.

---

## Core promise (copy north star)

**"See where your day actually went."**

Sunsama says: *Start calm. Stay focused. End confident.*  
Chronos says: *Plan your day. Track each hour. Know what actually happened.*

---

## What makes Sunsama's design work

| Principle | Sunsama does | Chronos must do |
|---|---|---|
| **Calm palette** | Soft neutrals, restrained accent color, no visual noise | Muted backgrounds, one primary accent, category colors only where meaningful |
| **Generous type scale** | Large headlines, readable body, hierarchy at a glance | Fluid `clamp()` base font; headings scale up on large screens |
| **Whitespace** | Sections breathe; nothing feels cramped | Padding scales with viewport; don't pack features into tight grids |
| **Problem → solution** | "Work is chaotic" ❌ → "Sunsama turns chaos into clarity" ✅ | Lead with the pain (planned vs actual), then show the hourly tracker as the fix |
| **Real product screenshots** | Actual app UI in hero and feature sections — not abstract illustrations | Use planner month view + hourly tracker timeline as hero assets |
| **One CTA per section** | "Start for free" / "Try for free" — consistent, rounded, confident | Single primary CTA: **Start free — no credit card** |
| **Social proof** | Named quotes, logos, "trusted by professionals" | Beta user quotes first; logos only when real |
| **Smooth motion** | Restrained transitions; drawers/sheets slide; nothing jarring | `animate-in` / `slide-in` on modals and sheets; no flashy animations |
| **Rounded, soft UI** | `rounded-2xl` / `rounded-3xl` cards, pill buttons, pill nav | Match: `rounded-xl` inputs, `rounded-full` CTAs, `rounded-3xl` cards |
| **Cursor affordance** | Everything clickable feels clickable | `cursor-pointer` on all interactive elements |

---

## Component-level rules

### Navigation
- Pill-shaped tab switcher on muted background (`bg-secondary` + active `bg-card shadow`)
- Sticky header with backdrop blur
- Minimal items — Planner, Tracker, Analytics only

### Cards & surfaces
- `shadow-elevated` for primary surfaces (not heavy drop shadows)
- `glass` / backdrop blur only on sticky header — not everywhere
- Dividers inside cards (`divide-y divide-border`) for settings-style rows

### Forms & modals
- Centered card or right sheet — never full-screen unless mobile
- Label left, control right in settings rows (Sunsama modal pattern)
- Rounded inputs (`rounded-xl`), no harsh borders

### Tracker (our differentiator)
- Vertical timeline with hour labels left, content card right
- Mood chips as soft colored pills — not loud badges
- Current hour gets subtle ring highlight, not aggressive animation

### Calendar
- Today = filled primary circle on day number
- Task chips = category tint at ~18% opacity, truncated with hover
- Cells grow taller on larger screens

---

## Landing page structure (when we build it)

Mirror Sunsama's narrative arc:

1. **Hero** — emotional headline + product screenshot + single CTA
2. **Problem** — 3 pain points with ❌ (chaos, distraction, never done)
3. **Solution** — 3 outcomes with ✅ (clarity, focus, end on time)
4. **Features** — 3 acts: Start your day (planner) → Work through it (tracker) → End confident (analytics)
5. **Social proof** — quotes + optional logos
6. **Final CTA** — repeat hero CTA

---

## What we explicitly avoid

- Neon gradients, glassmorphism everywhere, AI-slop purple
- Dense feature grids with 12 icons
- Tiny `text-xs` as default body text
- Multiple competing CTAs per section
- Stock illustrations instead of product screenshots
- Changing layout/colors without user approval on existing app screens

---

## Review checklist (before shipping any UI)

- [ ] Does it feel calm at first glance?
- [ ] Is there one obvious action per screen?
- [ ] Are fonts large enough on 4K without squinting?
- [ ] Do open/close animations feel smooth?
- [ ] Would this section work as a Sunsama screenshot swap test?
- [ ] Is the hourly tracker visible as the hero differentiator?
