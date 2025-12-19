---
id: 010
title: Fix Mobile Chapters Dropdown Scrolling
stage: general
date: 2025-12-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: user
command: user-direct-request
labels: ["mobile", "ui-fix", "css", "sidebar", "docusaurus"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - my-book/src/css/custom.css
tests:
  - None (CSS styling fix)
---

## Prompt

On mobile screens, my chapters dropdown is visible but not working. I cannot see all the chapters

## Response snapshot

Identified the root cause: The Docusaurus mobile sidebar (`.navbar-sidebar`) lacked proper scrolling configuration for viewing all 8 chapters on mobile devices.

**Solution implemented:**
Added mobile-specific CSS fixes in `my-book/src/css/custom.css` within the `@media (max-width: 996px)` breakpoint:

1. **Mobile Sidebar Scrolling** (`.navbar-sidebar`):
   - Set `max-height: calc(100vh - var(--ifm-navbar-height))`
   - Enabled `overflow-y: auto !important`
   - Added iOS smooth scrolling with `-webkit-overflow-scrolling: touch`

2. **Sidebar Items Container** (`.navbar-sidebar__items`):
   - Made scrollable with `overflow-y: auto !important`
   - Set `max-height: calc(100vh - var(--ifm-navbar-height) - 2rem)`
   - Added `padding-bottom: 2rem` for better last-item visibility

3. **Menu List** (`.menu__list`):
   - Removed height restrictions with `overflow-y: visible !important`
   - Set `max-height: none !important` to allow all chapters to display

4. **Sidebar Item Flex** (`.navbar-sidebar__item`):
   - Set `flex-shrink: 0` to prevent items from shrinking

The fix ensures all 8 chapters are accessible through smooth vertical scrolling on mobile devices.

## Outcome

- ✅ Impact: Mobile users can now scroll through and access all chapters in the sidebar dropdown
- 🧪 Tests: Visual testing required - user should refresh browser after CSS hot-reload
- 📁 Files: Modified 1 file (my-book/src/css/custom.css) - added 20 lines of mobile-specific CSS
- 🔁 Next prompts: Test on actual mobile device or mobile emulator to verify scrolling works correctly
- 🧠 Reflection: Docusaurus sidebar requires explicit mobile scrolling configuration; default theme doesn't handle long chapter lists well on smaller screens

## Evaluation notes (flywheel)

- Failure modes observed: Default Docusaurus mobile sidebar cuts off content when chapter list exceeds viewport height; no native scrolling enabled
- Graders run and results (PASS/FAIL): Manual visual testing required (PENDING)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): If issues persist, add touch-specific event handlers or adjust z-index for overlay scrolling
