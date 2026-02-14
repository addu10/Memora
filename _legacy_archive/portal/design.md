# Memora Project Design System

This document outlines the design language, tokens, and components for the Memora ecosystem (Portal and Mobile App).

## Design Philosophy
Memora uses a **Modern Premium** aesthetic tailored for caregivers and Alzheimer's therapy. Key principles include:
- **Cleanliness**: Ample white space and high-contrast typography.
- **Glassmorphism**: Subtle blurs and translucent layers for depth.
- **Vibrant Hierarchy**: Using purples and roses to guide attention without causing stress.
- **3D Accents**: High-quality 3D icons for key progress metrics.

---

## 🎨 Color Palette

### Primary (Vibrant Purple / Lavender)
Used for branding, primary actions, and success states.
| Level | Hex | CSS Variable |
| :--- | :--- | :--- |
| **50** | #f5f3ff | `--primary-50` |
| **500** | #8b5cf6 | `--primary-500` |
| **600** | #7c3aed | `--primary-600` |
| **Gradiant** | Lavender to Purple | `--purple-gradient` |

### Accent (Soft Rose / Pink)
Used for critical warnings, deletion actions, and decorative balance.
| Level | Hex | CSS Variable |
| :--- | :--- | :--- |
| **50** | #fff1f2 | `--accent-50` |
| **500** | #f43f5e | `--accent-500` |
| **600** | #e11d48 | `--accent-600` |

### Neutrals
| Level | Hex | CSS Variable |
| :--- | :--- | :--- |
| **Pure White** | #ffffff | — |
| **Soft Gray** | #fafafa | `--gray-50` |
| **Medium Gray** | #71717a | `--gray-500` |
| **Deep Gray** | #18181b | `--gray-900` |

---

## 🖋️ Typography

- **Font Family**: `Inter`, `Outfit`, `-apple-system`, `sans-serif`.
- **Primary Font**: `Inter` (used via Google Fonts).
- **Weights**:
  - Regular (400)
  - Medium (500)
  - Semi-bold (600)
  - Bold (700)/Extrabold (800) for Titles.

---

## ✨ UI Elements & Effects

### Glassmorphism
- **Background**: `rgba(255, 255, 255, 0.7)` (`--glass-bg`)
- **Border**: `rgba(255, 255, 255, 0.3)` (`--glass-border`)
- **Blur**: `backdrop-filter: blur(8px)` or `blur(20px)` for high-transparency areas like Navbars.

### Shadows
- **Card Shadow**: `0 8px 32px 0 rgba(31, 38, 135, 0.07)`
- **Success Glow**: Pulsating shadows for positive feedback.

### Border Radii
- **Standard Card**: `1rem` (`--radius-xl`)
- **Premium Card/Modal**: `1.5rem` to `2rem` (`--radius-2xl`)
- **Pill Buttons**: `9999px` (`--radius-full`)

---

## 🛠️ Common Components

### 1. Stat Cards
- Uses `--card-shadow`.
- Features a `stat-icon-3d` (80x80px).
- Labels in `--gray-500`, values in `--gray-900`.

### 2. Premium Buttons
- **Primary**: Purple gradient, white text, semi-bold.
- **Danger Action**: Rose background, rose-600 text, pill shape, white icon badge.

### 3. Modals (Pop-ups)
- Centered in viewport.
- `backdrop-filter: blur(10px)`.
- Entrance Animation: `scale(0.9) translateY(20px) -> scale(1) translateY(0)` with a bounce effect.

---

## 🌙 Dark Mode Strategy (Mobile & Web)
To maintain the premium look in Dark Mode:
1. **Backgrounds**: Swap `--gray-50` with `--gray-900`.
2. **Surfaces**: Swap white cards for `rgba(24, 24, 27, 0.8)` with enhanced `--glass-border`.
3. **Typography**: Invert grayscale (Text becomes `--gray-100`, Hints become `--gray-400`).
4. **Saturation**: Maintain vibrant brand colors but increase contrast against dark backgrounds.
