# 🎨 UI/UX Design System & Styling Patterns: Lumis

Lumis utilizes a high-end, responsive, and luxurious design language inspired by **Nubank's** clean usability, elevated with a bespoke champagne-gold, glassmorphic dynamic styling system. 

To maintain 100% visual consistency and premium quality, **ALL** UI code must strictly adhere to the patterns and styling tokens defined below.

---

## 🎨 1. Dynamic Design Tokens (Theme Config)

Lumis operates on a switchable dark/light theme, utilizing the exact CSS tokens compiled in our design prototypes.

### Color Palette:
* **Backgrounds:**
  * `Obsidian Canvas`: `#08090A` (`--bg`) | Base overlay: `#0C0D10` (`--bg-2`)
  * `Ivory Canvas`: `#F9FAFB` (Soft linen white) | Base overlay: `#FFFFFF`
* **Surfaces (Glass Overlays):**
  * `Frosted Surface`: `#101113` (`--surface`) | Medium: `#16181C` (`--surface-2`) | Light: `#1C1F24` (`--surface-3`)
* **Champagne Golds (Accents):**
  * `Warm Gold (Base)`: `#E6C687` (`--gold`)
  * `Glowing Gold (Bright)`: `#F3D99A` (`--gold-bright`)
  * `Deep Bronze Gold (Accent)`: `#C9A961` (`--gold-deep`)
* **Ivory Typography:**
  * `Premium Ivory`: `#F5EFE0` (`--ivory`)
  * `Ivory Dimmed`: `#C7C0AD` (`--ivory-dim`)
  * `Ivory Muted`: `#8A857A` (`--ivory-mute`)
* **Feedback States:**
  * `Positive Green`: `#B9D4A3` (`--positive`)
  * `Negative Red`: `#E09B87` (`--negative`)

### Border Radii Scale:
* `Extra Small (--r-xs)`: `8px`
* `Small (--r-sm)`: `12px`
* `Medium (--r-md)`: `18px`
* `Large (--r-lg)`: `24px`
* `Extra Large (--r-xl)`: `32px`

---

## 💎 2. The Glassmorphism Pattern (Frost Glass)

All premium modules (such as the Primary Balance Card and active dialog sliders) utilize a unified frosted glass layout.

### NativeWind / CSS Classes:
```css
/* Dark Mode Frost Glass Card */
.frost-card-dark {
  background-color: var(--surface);
  border-width: 1px;
  border-color: var(--line); /* 14% opacity honey-gold border */
  border-radius: var(--r-lg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-card);
}

/* Light Mode Card */
.frost-card-light {
  background-color: rgba(255, 255, 255, 0.9);
  border-width: 1px;
  border-color: rgba(170, 124, 17, 0.1);
  border-radius: var(--r-lg);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.05);
}
```

---

## ✍️ 3. Typography & Text Hierarchy

Lumis uses a tri-font typography scale to establish clean visual weight and hierarchy:
1. **Marcellus (Google Font - Serif):** Used for wordmarks, primary section headers, and luxury display titles.
2. **Manrope (Google Font - Sans-Serif):** Used for standard UI labels, list items, body copy, and navigation text.
3. **JetBrains Mono (Google Font - Monospace):** Used for micro-labels, code parameters, transaction timestamps, and monospaced number values.

* **Dashboard Balance Display:**
  * Currency symbol (`R$`): `font-manrope text-2xl font-light text-gold`
  * Major values (e.g. `18.450`): `font-marcellus text-4xl font-bold tracking-tight text-primary`
  * Cents/Minor values (e.g. `,72`): `font-manrope text-2xl font-medium text-primary`
* **Section Headers:** `font-marcellus text-xl font-semibold text-primary tracking-wide mb-4`
* **Body & Lists:** `font-manrope text-base font-normal text-primary`
* **Metadata & Captions:** `font-mono-jetbrains text-xs font-medium text-secondary`


---

## ⚙️ 4. Micro-Animations & Springs (Reanimated)

To create a UI that feels responsive and alive, utilize `react-native-reanimated` with standardized physical spring configurations. **Never use linear, mechanical eases for UI cards or buttons.**

### Standard Spring Configurations:
* **Premium Soft Bounce (Cards & Page Entries):**
  * `damping: 15`, `stiffness: 90`, `mass: 0.8` (Smooth, luxurious slide-ins)
* **High-Fidelity Action Snappiness (Button Presses):**
  * `damping: 10`, `stiffness: 150` (Instant tactile response)

### Standard Animation Implementations:
1. **Interactive Tap Feedback (Scale-Press):**
   When pressing circular quick action buttons or cards, scale down to `0.93` instantly, and spring back to `1.0` upon release:
   ```typescript
   const scale = useSharedValue(1);
   const onPressIn = () => { scale.value = withSpring(0.93, { damping: 10, stiffness: 150 }); };
   const onPressOut = () => { scale.value = withSpring(1.0, { damping: 10, stiffness: 150 }); };
   ```
2. **Privacy Eye Toggle (Canvas Blur):**
   * Transitioning Privacy Mode blur applies a 200ms ease-in-out opacity and blur-radius curve (`blurRadius = withTiming(isPrivate ? 20 : 0, { duration: 200 })`).
3. **Smart Input Microphone Waves:**
   * Holding the microphone button displays concentric golden rings expanding outwards, animated infinitely using `withRepeat(withTiming(scale, { duration: 1500 }), -1)`.

---

## 🧱 5. Structural Component Blueprints

### A. The Dashboard Balance Card
* **Layout:** Vertical container. Top-left shows "Primary Balance" sub-label. Top-right houses the `eye-slash` privacy toggle button.
* **Middle:** Large currency figures (`R$ 18.450,72`).
* **Bottom:** Mini metadata row showing "Available Cash" + "Updated: Just now" with a soft horizontal divider.
* **Visual Reference:**
  ```
  +--------------------------------------------+
  |  Total Balance                    [eye-icon]|
  |  R$ 18.450,72                              |
  |                                            |
  |  ----------------------------------------  |
  |  Available: R$ 18.450,72 Updated: Just now |
  +--------------------------------------------+
  ```

### B. Horizontal Quick Actions
* **Layout:** ScrollView with `horizontal={true}` and `showsHorizontalScrollIndicator={false}`.
* **Component Item:** Vertical alignment. 
  * A circular wrapper (`w-14 h-14 rounded-full border-1 border-gold bg-dark-overlay justify-center items-center mb-2`).
  * Inside: Sleek gold vector line icons.
  * Below: Centered text label (`text-xs font-medium text-primary`).
* **Hover/Tap State:** Spring scale on press.

### C. The 3D Credit Card Mockup (Payment Methods Screen)
* **Layout:** Fixed aspect ratio card (`aspect-[1.586]` matching standard ISO 7810 credit card dimensions).
* **The Three Credit Card Styles:**
  1. **Noir Reserve:** Elite styling. Pure deep charcoal/obsidian textured surface with gold foil typography and radial spotlights.
  2. **Gold:** Radiant styling. Lustrous golden surface with high-contrast obsidian black typography and minimal geometric vectors.
  3. **Platinum:** High-end tech styling. Polished silver-platinum surface with warm golden accent highlights and subtle reflections.
* **Front View:** Holographic gold brand mark (top left), card style name, cardholder name, closure/due day badge, and active statement balance.
* **Back View:** Card configuration settings (editable fields for Credit Limit, Closure day slider, Due day slider) inside a glassmorphic panel.
* **Interaction:** Tap to flip. Relies on Y-axis rotation interpolation (`interpolate(rotate.value, [0, 180], [0, 180])`) driven by snappy spring physics.

---

## 🚨 UX Quality Gates (Self-Check for Agents)
Before delivering any component or view:
1. **Responsive Test:** Does it render correctly on a narrow mobile portrait screen AND a wide desktop browser layout?
2. **Text Contrast Check:** Are gold labels readable against the ivory light mode background? (Use `#AA7C11` for light mode gold).
3. **Gesture Comfort:** Are scroll lists padded properly at the bottom (`pb-20` minimum) so elements are not clipped by the floating bottom tab bar?
4. **Transition Continuity:** Do pages load with a subtle `fade-in` and `slide-up` instead of abruptly jumping onto the screen?
