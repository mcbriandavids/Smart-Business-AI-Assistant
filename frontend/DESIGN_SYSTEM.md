# UI Design System – Smart Business AI

Goal: a unique, premium visual identity with excellent usability.

## Foundations

- Typography:
  - Display: "Plus Jakarta Sans" (700, 800)
  - Body: "Inter" (400, 600)
- Color tokens:
  - Primary: `#6E5BFF`
  - Primary-600: `#5A45FF`
  - Accent: `#14E1B3`
  - Ink: `#0B1020`
  - Subtle-ink: `#2B3043`
  - Surface: `#0F1428`
  - Card: `#121936`
  - Border: `#23305A`
  - Success: `#27C093`
  - Warning: `#F6C34A`
  - Danger: `#FF5876`
- Elevation:
  - xs: 0 1px 2px rgba(0,0,0,.3)
  - sm: 0 6px 18px rgba(0,0,0,.35)
  - md: 0 16px 40px rgba(0,0,0,.4)
- Radii: 10, 14, 18, 24
- Spacing scale: 4

## Components

- Buttons: primary, subtle, ghost; large focus rings, 3D hover via dual-shadow.
- Inputs: floating labels, soft glow focus, error/success states.
- Cards: glassy gradient overlays, animated borders on hover.
- Navbar: sticky, blurred background with subtle gradient line.
- Toasts: stacked from top-right, springy entrance.
- Modal/Sheet: 3D scale+fade, backdrop blur.

## Motion

- Spring curves for entrance (200–260ms), hover micro-interactions (120ms).
- Page transitions: directional slide+fade.

## Accessibility

- Color contrast AA+, focus-visible styles, prefers-reduced-motion support.
