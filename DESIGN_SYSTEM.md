# Memora Design System Bridge

This document captures the visual language, design tokens, and UI patterns of the Memora Portal to ensure a consistent experience when building the mobile application.

---

## 🎨 Color Palette
The theme follows a **"Luxurious Light"** aesthetic with a core focus on Global Violet and Sleek Indigo.

### Core Brand Colors
| Category | Variable | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary (Violet)** | `--primary-500` | `#8B5CF6` | Main brand color, icons, active states |
| **Secondary (Indigo)**| `--secondary-500`| `#6366F1` | Accents, gradients, links |
| **Background** | `--background` | `#FAFAFA` | Main app background base |
| **Surface** | `--surface` | `#FFFFFF` | Cards, modals, sidebars |
| **Neutral (Slate)** | `--neutral-500` | `#64748B` | Secondary text, placeholders |

### Palette Scales
- **Violet (Primary)**: `#F5F3FF` (50) → `#8B5CF6` (500) → `#4C1D95` (900)
- **Slate (Neutral)**: `#F8FAFC` (50) → `#64748B` (500) → `#0F172A` (900)

---

## 🏛 Layout & Structure

### Background Design
- **Base Color**: `#FDFBFF`
- **Effect**: Multi-radial Mesh Gradient
    - `at 0% 0%`: `rgba(167, 139, 250, 0.15)`
    - `at 100% 0%`: `rgba(196, 181, 253, 0.15)`
    - `at 100% 100%`: `rgba(221, 214, 254, 0.15)`

### Header (Floating Pill)
- **Background**: `bg-white/90` with `backdrop-blur-2xl`
- **Border Radius**: `rounded-[2rem]` (approx 32px)
- **Shadow**: `shadow-lg shadow-indigo-500/5`

---

## 📦 UI Components

### 1. Cards (Bento/Session Style)
- **Background**: `white`
- **Border Radius**: `3xl` (1.5rem / 24px)
- **Border**: `1px solid #F1F5F9` (neutral-100)
- **Shadow**: `0 4px 20px -2px rgba(0, 0, 0, 0.05)`
- **Hover State**:
    - Translate: `translate-y-[-2px]`
    - Border: `primary-100` (#EDE9FE)
    - Shadow: `shadow-xl`

### 2. Glassmorphism (Stats/Overlays)
- **Class**: `.glass-card`
- **Background**: `rgba(255, 255, 255, 0.8)`
- **Blur**: `16px`
- **Border**: `1px solid rgba(139, 92, 246, 0.25)`

### 3. Typography
- **Font Family**: `Outfit`, sans-serif
- **Headings (H1/H2)**: `font-black` (900 weight), `tracking-tight`
- **Body**: `font-medium` (500 weight) or `font-normal` (400 weight)
- **Gradient Text**: `from-violet-600 to-indigo-600`

### 4. Tag & Badges
- **Shape**: `rounded-lg` (8px) for labels, `rounded-full` for status
- **Colors**:
    - **Neutral**: `bg-slate-50`, `text-slate-600`, `border-slate-100`
    - **Violet**: `bg-violet-50`, `text-violet-700`, `border-violet-100`

---

## ⚡ Animations & Transitions
- **Entry**: `fade-in slide-in-from-bottom-4` (duration: 500ms)
- **Hover Transitions**: `duration-300`, `ease-in-out`
- **Special**: `animate-gradient-x` for header spans.

---

## 🛠 Icons & Media
- **Icon Set**: Lucide React (use consistent stroke widths: 1.5 - 2.0)
- **Images**: `mix-blend-multiply` with white backgrounds for logos and transparent assets.
- **Avatar Squircle**: Rounded rectangles (`rounded-xl` or `rounded-2xl`) for user/patient photos instead of standard circles.
