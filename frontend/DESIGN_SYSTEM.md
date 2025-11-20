# UI Design System – Smart Business AI

Goal: craft an AI-native, premium experience that feels responsive and immersive across devices.

## Foundations

- **Typography**
  - Display: `"Space Grotesk"` (500–700)
  - Body & UI: `"Inter"` (400–600)
  - Numeric tiles: `"JetBrains Mono"` (500)
- **Color tokens**
  - `--color-bg`: `#070B16`
  - `--color-surface`: `rgba(17, 23, 42, 0.76)`
  - `--color-card`: `rgba(23, 32, 56, 0.72)`
  - `--color-border`: `rgba(79, 209, 255, 0.18)`
  - `--color-primary`: `#4FD1FF`
  - `--color-primary-strong`: `#2CA8E0`
  - `--color-secondary`: `#F472B6`
  - `--color-success`: `#34D399`
  - `--color-warning`: `#FBBF24`
  - `--color-danger`: `#FB7185`
  - `--color-text`: `#E5ECFF`
  - Accent gradient: `linear-gradient(135deg, #4FD1FF, #F472B6)`
- **Elevation & blur**
  - xs: `0 8px 18px rgba(0, 0, 0, 0.25)`
  - sm: `0 16px 40px rgba(15, 22, 35, 0.35)`
  - md: `0 32px 72px rgba(10, 14, 30, 0.45)` with `backdrop-filter: blur(18px)`
- **Radii**: `8px`, `16px`, `24px`, `32px` (chips/cards/panels)
- **Spacing scale**: 4px base (`4, 8, 12, 16, 24, 32, 48, 64`)
- **Breakpoints**: `xs ≤ 600`, `sm ≤ 900`, `md ≤ 1280`, `lg ≤ 1600`, `xl > 1600`

## Components

- **Navigation shell**: collapsible side rail with glowing active state, glass top bar containing breadcrumbs, search/command palette, and status indicators.
- **Cards**: `GlassPanel` (blurred surface with border gradient) + `MetricCard` (monospace numerals, sparkline placeholder) + `GradientHeaderCard` (accent gradient header, subtle inner glow).
- **Buttons**: solid (gradient), outline (alpha border), ghost. All feature 2px focus ring and 180 ms position-lift hover.
- **Tabs & chips**: underline slide animation, pill toggles for filters.
- **Timeline**: vertical rail, avatar nodes, glowing connectors, timestamp badges.
- **Tables**: zebra rows, sticky headers, compact density toggle.
- **Assistant panel**: docked glass drawer with waveform header, tool summary pills, mock/live badge.

## Motion

- 180 ms ease-in-out for hover/focus, 220–260 ms ease-out for panel transitions.
- Use spring curves (`cubic-bezier(0.16, 1, 0.3, 1)`) for overlays and modals.
- Ambient gradient shimmer on hero cards (6 s loop), cursor-follow glow behind CTA buttons.
- Typing indicator: three-dot pulse with staggered 160 ms delay.

## Accessibility

- Maintain AA contrast by default; ensure gradient overlays never reduce legibility below 4.5:1.
- Provide `:focus-visible` outlines using `--color-primary` with 2px offset.
- Respect `prefers-reduced-motion` by disabling shimmer/slide animations and providing instant transitions.
- All navigation elements must remain keyboard reachable; provide skip link to main content.

## Layout Notes

- Content max width: 1440 px with 24 px gutters (12-column grid on `md+`).
- On `sm` breakpoints the side rail collapses, KPI chips become horizontal scroll, and assistant panel switches to full-width bottom sheet.
- Ensure AI widget button floats above content with safe-area padding on mobile.
