# Codestra design tokens

Source audit: production site at `https://codestra.co/`, repository styles, shared navigation, buttons, cards, forms, and footer. Captured 2026-08-02.

## Existing tokens

| Role | Value | Existing usage |
| --- | --- | --- |
| Page background | `#080808` / `rgb(8 8 8)` | Body and auth pages |
| Footer background | `#08090A` / `rgb(8 9 10)` | Footer and not-found page |
| Raised surface | `#121212` / `rgb(18 18 18)` | Navigation, dialogs, auth cards |
| Card surface | `#151517` / `rgb(21 21 23)` | Content cards and accordions |
| Input surface | `#262729` / `rgb(38 39 41)` | Form controls |
| Subtle border | `#1B1B1B` / `rgb(27 27 27)` | Navigation and panels |
| Strong border | `#262629` / `rgb(38 38 41)` | Cards and accordions |
| Brand gold | `#FFD700` / `rgb(255 215 0)` | Primary buttons, headings, active states |
| Gold hover | `#FFBB00` / `rgb(255 187 0)` | Primary-button hover |
| Primary text | `#FFFFFF` / `rgb(255 255 255)` | Headings and body copy |
| Secondary text | `#B4B5B5` / `rgb(180 181 181)` | Supporting copy |

## Typography and geometry

- Family: `Sora`, loaded from Google Fonts, weights 100–800.
- Existing body scale: 12–16px; new long-form page body defaults to 16px for accessibility.
- Existing headings: 24–36px; the AI Receptionist hero extends this responsively to 56px while retaining Sora and the current weight range.
- Existing spacing rhythm: 4px base, most commonly 8, 12, 16, 20, 24, 40, 56, and 80px.
- Existing radius: 6–8px for buttons and inputs, 12–24px for cards and large sections, full radius for pills.
- Existing borders: 1px solid neutral charcoal; shadows are rare and subdued.
- Existing buttons: compact Sora text, 8px radius, gold/black primary or white/black secondary.
- Existing icons: `react-icons` line and filled icon families.

## Accessible extensions for AI Receptionist

These aliases document the existing palette rather than creating a competing theme:

```css
--codestra-bg: #080808;
--codestra-bg-alt: #08090a;
--codestra-surface: #121212;
--codestra-card: #151517;
--codestra-input: #262729;
--codestra-border: #262629;
--codestra-gold: #ffd700;
--codestra-gold-hover: #ffbb00;
--codestra-text: #ffffff;
--codestra-muted: #b4b5b5;
--codestra-danger: #ff8a8a;
--codestra-success: #7ee2a8;
```

`#FFD700` with `#080808` text is used for primary controls. Gold is not used as small body text on white. Secondary copy remains `#B4B5B5` on `#080808` or darker surfaces, exceeding WCAG AA for normal text.
# Industry canary additions

The logistics canary introduces no competing palette. It reuses the established `#0b0b0b` page background, `#171717` surface, white primary text, muted gray text, `rgba(255,255,255,.08)` borders, 16px cards, pill buttons, and restrained `#ffe500` selection/primary-action treatment. The only new layout primitives are typed industry grids, workflow steps, a simulated console, and the safe-area-aware mobile conversion bar.
