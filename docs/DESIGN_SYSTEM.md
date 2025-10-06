# Design System

**Last Updated:** October 5, 2025

---

## Overview

Evercraft's design system is built on principles of **minimalism, sustainability, and accessibility**. Our aesthetic combines clean, modern design with eco-conscious values, creating a premium yet approachable experience.

---

## Design Principles

### 1. **Clarity & Simplicity**

- Every element serves a purpose
- Clear visual hierarchy
- Generous white space
- Minimal cognitive load

### 2. **Sustainability First**

- Eco-values reflected in design
- Green accents convey environmental focus
- Impact metrics prominently displayed
- Transparent information architecture

### 3. **Accessibility**

- WCAG 2.1 AA compliant
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly
- Touch-friendly targets (44px minimum)

### 4. **Performance**

- Lightweight assets
- Optimized images
- Minimal animations (prefer subtle)
- Fast perceived performance

### 5. **Trust & Authenticity**

- Real product photography (no stock photos)
- Transparent seller information
- Verified badges and certifications
- Honest impact metrics

---

## Color Palette

### Primary Colors

**White (Base)**

- `#FFFFFF` - Primary background
- Usage: Main backgrounds, cards, modals

**Soft Off-White (Warm)**

- `#FAFAF8` - Secondary background
- Usage: Alternate sections, subtle differentiation

**Dark Forest Green (Accent)**

- `#1B4332` - Primary accent (darker)
- `#2D6A4F` - Primary accent (lighter)
- Usage: CTAs, links, eco-badges, headers

### Neutral Colors

**Text**

- `#212529` - Primary text (charcoal)
- `#495057` - Secondary text (medium gray)
- `#6C757D` - Tertiary text (light gray)
- `#ADB5BD` - Disabled text

**Borders & Dividers**

- `#E9ECEF` - Border color (subtle gray)
- `#DEE2E6` - Divider color (slightly darker)
- `#CED4DA` - Input borders

### Success & Impact Colors

**Green Spectrum (Eco/Success)**

- `#52B788` - Success primary
- `#95D5B2` - Success light
- `#D8F3DC` - Success lightest (backgrounds)

### Semantic Colors

**Error**

- `#DC3545` - Error primary
- `#F8D7DA` - Error background

**Warning**

- `#FFC107` - Warning primary
- `#FFF3CD` - Warning background

**Info**

- `#0DCAF0` - Info primary
- `#CFF4FC` - Info background

### Color Usage Guidelines

**Do:**

- Use white/off-white for backgrounds
- Use dark forest green for primary CTAs
- Use lighter greens for impact metrics
- Maintain 4.5:1 contrast for text

**Don't:**

- Don't use pure black (#000000) - too harsh
- Don't overuse green - reserve for eco-elements
- Don't use red for eco-scores (negative connotation)

---

## Typography

### Font Families

**Primary: Inter**

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

- Usage: Body text, UI elements
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Excellent readability, modern, web-optimized

**Alternative: Outfit**

```css
font-family:
  'Outfit',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

- Usage: Headlines, marketing copy (if desired)
- Weights: 400, 500, 600, 700
- Friendly, approachable, geometric

**Fallback: System Fonts**

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale

**Headlines**

- `h1`: 48px / 3rem (line-height: 1.2)
- `h2`: 40px / 2.5rem (line-height: 1.2)
- `h3`: 32px / 2rem (line-height: 1.3)
- `h4`: 24px / 1.5rem (line-height: 1.4)
- `h5`: 20px / 1.25rem (line-height: 1.4)
- `h6`: 16px / 1rem (line-height: 1.5)

**Body**

- `body-large`: 18px / 1.125rem (line-height: 1.6)
- `body`: 16px / 1rem (line-height: 1.6)
- `body-small`: 14px / 0.875rem (line-height: 1.5)

**UI Elements**

- `label`: 14px / 0.875rem (line-height: 1.4, font-weight: 500)
- `caption`: 12px / 0.75rem (line-height: 1.4)
- `button`: 16px / 1rem (line-height: 1.5, font-weight: 500)

### Typography Guidelines

**Do:**

- Use generous line-height (1.5-1.6 for body)
- Limit line length (60-80 characters)
- Use font-weight for hierarchy (not just size)
- Scale down gracefully on mobile

**Don't:**

- Don't use more than 2 font families
- Don't use font sizes below 12px
- Don't use all-caps for long text
- Don't use too many font weights

---

## Spacing System

### Base Unit: 4px

**Scale (Tailwind-compatible)**

- `xs`: 4px (0.25rem) - Tiny gaps
- `sm`: 8px (0.5rem) - Compact spacing
- `md`: 16px (1rem) - Default spacing
- `lg`: 24px (1.5rem) - Generous spacing
- `xl`: 32px (2rem) - Section spacing
- `2xl`: 48px (3rem) - Large section spacing
- `3xl`: 64px (4rem) - Hero spacing
- `4xl`: 96px (6rem) - Extra large spacing

### Common Patterns

**Card Padding**

- Desktop: `p-6` (24px)
- Mobile: `p-4` (16px)

**Section Spacing**

- Desktop: `py-16` or `py-20` (64-80px)
- Mobile: `py-12` or `py-16` (48-64px)

**Component Gaps**

- Small: `gap-2` (8px)
- Medium: `gap-4` (16px)
- Large: `gap-6` (24px)

---

## Layout & Grid

### Container

- Max width: `1280px` (xl breakpoint)
- Padding: `px-4` (mobile), `px-6` (tablet), `px-8` (desktop)
- Centered: `mx-auto`

### Grid System

**Product Grids**

- Mobile: 1 column
- Tablet: 2 columns (`sm:grid-cols-2`)
- Desktop: 3-4 columns (`lg:grid-cols-3`, `xl:grid-cols-4`)
- Gap: `gap-4` or `gap-6`

**Content Grids**

- Two-column: `grid-cols-1 lg:grid-cols-2`
- Sidebar: `grid-cols-1 lg:grid-cols-[250px_1fr]`

### Breakpoints (Tailwind defaults)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## Components

### Buttons

**Primary Button**

```css
bg-[#1B4332] text-white hover:bg-[#2D6A4F]
px-6 py-3 rounded-md font-medium
transition-colors duration-200
```

**Secondary Button**

```css
bg-white text-[#1B4332] border border-[#1B4332]
hover:bg-[#1B4332] hover:text-white
px-6 py-3 rounded-md font-medium
transition-colors duration-200
```

**Ghost Button**

```css
text-[#1B4332] hover:bg-[#D8F3DC]
px-4 py-2 rounded-md font-medium
transition-colors duration-200
```

**Sizes**

- Small: `px-4 py-2 text-sm`
- Medium: `px-6 py-3 text-base` (default)
- Large: `px-8 py-4 text-lg`

**States**

- Hover: Darken or lighten background
- Active: Scale slightly (`active:scale-95`)
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: Spinner + disabled state

### Cards

**Product Card**

```css
bg-white border border-[#E9ECEF] rounded-lg
hover:shadow-lg transition-shadow duration-200
overflow-hidden
```

**Content Card**

```css
bg-white p-6 rounded-lg shadow-sm
border border-[#E9ECEF]
```

**Elevation**

- Level 1: `shadow-sm` (subtle)
- Level 2: `shadow-md` (moderate)
- Level 3: `shadow-lg` (prominent)
- Level 4: `shadow-xl` (dialog, modal)

### Forms

**Input Field**

```css
border border-[#CED4DA] rounded-md
px-4 py-2.5 text-base
focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]
focus:border-transparent
```

**Label**

```css
text-sm font-medium text-[#495057]
mb-1.5 block
```

**Error State**

```css
border-[#DC3545] focus:ring-[#DC3545]
```

**Disabled State**

```css
bg-[#E9ECEF] cursor-not-allowed opacity-60
```

### Badges

**Eco-Score Badges**

- Gold: `bg-[#52B788] text-white` (90-100)
- Silver: `bg-[#95D5B2] text-[#1B4332]` (70-89)
- Bronze: `bg-[#D8F3DC] text-[#1B4332]` (50-69)

**Status Badges**

```css
px-2.5 py-0.5 rounded-full text-xs font-medium
```

- Success: `bg-[#D8F3DC] text-[#1B4332]`
- Warning: `bg-[#FFF3CD] text-[#856404]`
- Error: `bg-[#F8D7DA] text-[#721C24]`
- Info: `bg-[#CFF4FC] text-[#055160]`

### Icons

**Icon Library: Lucide React** (or Heroicons)

- Size: `w-5 h-5` (20px) for inline icons
- Size: `w-6 h-6` (24px) for standalone icons
- Color: Inherit from parent or use `text-[color]`

**Usage**

- Always include accessible labels
- Use consistent sizes within a section
- Align with text baseline

---

## Micro-Interactions

### Hover States

- **Links:** Underline or color change
- **Buttons:** Background darken/lighten
- **Cards:** Subtle shadow (`shadow-lg`)
- **Product images:** Zoom slightly (`scale-105`)

### Transitions

```css
transition-colors duration-200 ease-in-out
transition-shadow duration-200 ease-in-out
transition-transform duration-200 ease-in-out
```

### Animations (Framer Motion)

**Fade In**

```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.3 }}
```

**Slide Up**

```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
```

**Stagger Children**

```javascript
variants={{
  container: {
    animate: { transition: { staggerChildren: 0.1 } }
  }
}}
```

**Guidelines:**

- Keep animations subtle (< 400ms)
- Respect `prefers-reduced-motion`
- Use for feedback and delight, not decoration

---

## Accessibility

### Color Contrast

- **Text on white:** Minimum 4.5:1 ratio
- **Large text (18px+):** Minimum 3:1 ratio
- **UI components:** Minimum 3:1 ratio

**Test with:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools (Lighthouse)

### Focus States

```css
focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]
focus:ring-offset-2
```

**Visible on all interactive elements:**

- Buttons, links, inputs, checkboxes, etc.

### Touch Targets

- Minimum size: `44px × 44px`
- Adequate spacing between targets (8px+)

### ARIA Labels

- Use `aria-label` for icon-only buttons
- Use `aria-labelledby` for complex labels
- Use `role` attributes when semantic HTML insufficient

### Semantic HTML

- Use `<button>` not `<div onClick>`
- Use `<a>` for navigation, `<button>` for actions
- Use headings hierarchically (`h1` → `h2` → `h3`)
- Use `<nav>`, `<main>`, `<aside>`, `<footer>`

### Keyboard Navigation

- Tab order follows visual order
- All interactive elements keyboard-accessible
- Modal traps focus (Escape to close)
- Skip to main content link

---

## Imagery

### Product Photography

- **Aspect Ratios:**
  - Square: `1:1` (product grid)
  - Portrait: `3:4` (product detail)
  - Landscape: `16:9` (banners)

- **Quality:**
  - Minimum 1200px width
  - WebP format (with JPG fallback)
  - Optimized for web (< 200KB)

- **Style:**
  - Clean, well-lit
  - Neutral backgrounds (white/light gray)
  - Show product in use (lifestyle shots)
  - Multiple angles

### Icons & Illustrations

- **Style:** Outlined, minimal
- **Color:** Monochrome or accent green
- **Size:** Consistent (16px, 20px, 24px)

### Placeholder Images

- Use subtle gradient or pattern
- Include loading skeleton

---

## Motion & Animation Guidelines

### Principles

1. **Purposeful:** Animations should provide feedback or guide attention
2. **Subtle:** Avoid distracting or excessive motion
3. **Fast:** Keep durations under 400ms
4. **Natural:** Use easing functions (ease-in-out, ease-out)

### Common Use Cases

- **Page transitions:** Fade in (300ms)
- **Loading states:** Skeleton screens or spinners
- **Hover effects:** Scale, shadow, color (200ms)
- **Modals:** Fade + scale (250ms)
- **Notifications:** Slide in from top/bottom (300ms)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Mobile-First Approach

- Design for mobile first
- Progressively enhance for larger screens
- Touch-friendly targets (44px minimum)
- Simplify navigation on mobile

### Breakpoint Strategy

- **Mobile (< 640px):** Single column, stacked layout
- **Tablet (640px - 1024px):** 2 columns, simplified nav
- **Desktop (1024px+):** Full layout, multi-column grids

### Common Patterns

**Navigation:**

- Mobile: Hamburger menu
- Desktop: Horizontal nav

**Product Grid:**

- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Forms:**

- Mobile: Stacked fields
- Desktop: Inline labels or side-by-side fields

---

## Page Layouts

### Homepage

- Hero section (full-width)
- Featured collections (grid)
- Impact metrics (centered, prominent)
- Seller spotlight (carousel)
- Newsletter signup (footer or sticky)

### Product Listing Page

- Filters (sidebar on desktop, drawer on mobile)
- Product grid (responsive columns)
- Sort dropdown (sticky on mobile)

### Product Detail Page

- Image gallery (left, 60%)
- Product info (right, 40%)
- Tabs or accordion (description, reviews, eco-info)
- Recommendations (carousel)

### Checkout

- Multi-step (progress indicator)
- Summary sidebar (desktop) or sticky footer (mobile)
- Form fields (clear labels, validation)

---

## Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          light: '#2D6A4F',
          dark: '#081C15',
        },
        eco: {
          light: '#D8F3DC',
          DEFAULT: '#95D5B2',
          dark: '#52B788',
        },
        neutral: {
          50: '#FAFAF8',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#212529',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

---

## Component Checklist

### Before building a component:

- [ ] Defined in design system?
- [ ] Accessible (keyboard, screen reader, focus)?
- [ ] Responsive (mobile, tablet, desktop)?
- [ ] Has loading state?
- [ ] Has error state?
- [ ] Has empty state?
- [ ] Documented (Storybook or similar)?

---

## Resources

### Design Tools

- **Figma** - Design and prototyping
- **Storybook** - Component library (optional)
- **Tailwind CSS IntelliSense** - VSCode extension

### Inspiration

- **Etsy** - Product discovery, checkout flow
- **Faire** - Clean B2B aesthetic, seller dashboard
- **Patagonia** - Eco-brand storytelling
- **Reformation** - Sustainability transparency

### Testing Tools

- **Lighthouse** - Performance, accessibility audit
- **axe DevTools** - Accessibility testing
- **WebAIM Contrast Checker** - Color contrast
- **Responsively App** - Multi-device preview

---

## Next Steps

1. **Create Figma design system** (Week 1-2)
   - Color styles
   - Text styles
   - Component library
2. **Build Tailwind config** (Week 3)
3. **Create shadcn/ui component library** (Week 3)
4. **Document in Storybook** (optional, ongoing)

---

**Design is never done. Iterate based on user feedback! 🎨**
