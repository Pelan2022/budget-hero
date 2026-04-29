# Budget Hero — Brand & Design System

> Verze 2.0 · Živý dokument · Zdroj pravdy pro veškerá vizuální a komunikační rozhodnutí.

---

## 1. Základ značky

| Atribut | Hodnota |
|---|---|
| **Název** | Budget Hero |
| **Žánr** | Vzdělávací hra o osobních financích |
| **Cílová skupina** | 8–15 let (primárně), rodiče a učitelé (sekundárně) |
| **Tone of brand** | Povzbudivý, hravý, respektuje inteligenci hráče |
| **Vizuální inspirace** | Duolingo — sytost barev, 3D herní UI, zaoblené komponenty |

### Design principy

1. **Radost nad strachem** — Chyba je příležitost, ne trest. Hráč se nikdy necítí ztraceně.
2. **Jasnost na prvním místě** — Každý prvek musí být čitelný pro 8leté i 15leté zároveň.
3. **Hra, ne škola** — Vzdělávací obsah se skrývá za herní mechaniky, ne naopak.
4. **Konzistence buduje důvěru** — Každá obrazovka vypadá, jako by pocházela ze stejného světa.

---

## 2. Maskot

Maskot je **centrální postava celé hry** — stojí ve středu hlavního dashboardu a je symbolem značky Budget Hero. Není jen dekorace; je to průvodce, který hráče motivuje a slaví s ním úspěchy.

### Charakter

| Atribut | Hodnota |
|---|---|
| **Vzhled** | Dívka nebo chlapec (vizuálně ~10–12 let), game-friendly oblečení |
| **Jméno** | *Zatím neurčeno — doplnit před spuštěním* |
| **Osobnost** | Zvídavý, odvážný, povzbudivý. Slaví hráče, netlačí na pilu. |
| **Stav** | Statická ilustrace (v1) — animace přijdou v pozdější verzi |

### Vizuální pravidla maskota

- Styl: **2D kartónová ilustrace**, tučné černé obrysy (3–4 px), sytá plochá výplň
- Inspirace: Duolingo character design — záměrně přehnaně kulatý, velmi expresivní
- Vždy obklopený dostatkem prázdného prostoru, nikdy ořezaný nebo překrytý
- Výraz se přizpůsobuje stavu: neutrální (výchozí), úsměv (úspěch), překvapení (nová výzva)
- Pozadí postavy: průhledné nebo neutrální kruh v `--color-accent-pink-soft`

> **TODO:** Po schválení jména maskota doplnit sem + do všech UI textů a onboardingu.

---

## 3. Barevná paleta

Paleta je inspirovaná Duolingem: sytá, kontrastní, herní. Teplé žluté pozadí (`#FFF4C9`) zůstává jako unikátní vizuální identita Budget Hero.

### Primární barvy

| Název | Hex | Použití |
|---|---|---|
| **Primary** | `#6DC030` | Hlavní akční prvky, progress, úspěch |
| **Primary Dark** | `#4E9A20` | Hover, aktivní stavy, spodní border tlačítek |
| **Primary Light** | `#A3D96B` | Jemné akcenty, pozadí tagů |
| **Background** | `#FFF4C9` | Hlavní plocha aplikace — teplá, unikátní |
| **Background Soft** | `#FFFBF0` | Outer shell, wrapper |

### Herní akcenty

| Název | Hex | Herní kontext |
|---|---|---|
| **Gold** | `#FFD700` | XP body, hvězdičky, odměny |
| **Gold Soft** | `#FFFAEB` | Pozadí XP karet |
| **Blue** | `#5EB3FF` | Tipy, informace, lekce |
| **Blue Soft** | `#DCF0FF` | Pozadí info karet |
| **Pink** | `#FF6BA8` | Zábava, odměny, speciální akce |
| **Pink Soft** | `#FFE0F0` | Pozadí zábavních karet |
| **Purple** | `#A855F7` | Investice, level-up, speciální achievementy |
| **Purple Soft** | `#F3E8FF` | Pozadí level karet |
| **Orange** | `#FF9B3B` | Spotřeba, streak, denní výzva |
| **Orange Soft** | `#FFF0DC` | Pozadí výzev |

### Neutrály

| Název | Hex | Použití |
|---|---|---|
| **Text** | `#2C2C2C` | Hlavní text |
| **Text Soft** | `#6B7280` | Sekundární text, popisy |
| **Border** | `#E5E7EB` | Karty, oddělovače |
| **Border Soft** | `#F3F4F6` | Velmi jemné oddělovače |
| **White** | `#FFFFFF` | Podklad karet |

### Stavové barvy

| Stav | Barva | Bg | Kdy použít |
|---|---|---|---|
| **Success** | `#58CC02` | `#E5F9CC` | Správná odpověď, splněná mise |
| **Warning** | `#FF9B3B` | `#FFF0DC` | Pozor, připomenutí |
| **Error** | `#FF4B4B` | `#FFE0E0` | Pouze v inputu — nikdy celá obrazovka |
| **Info** | `#5EB3FF` | `#DCF0FF` | Nápověda, tip |

---

## 4. Typografie

**Primární font: `Nunito`**

Nunito je základ vizuálního jazyka Budget Hero. Extrémně zaoblená písmenka, výborná čitelnost pro děti i dospívající — přátelský, ale ne dětinský. Nejbližší volně dostupný ekvivalent fontu Duolinga.

```
font-family: "Nunito", system-ui, -apple-system, sans-serif;
```

Google Fonts: `https://fonts.google.com/specimen/Nunito`  
Weights: `400 (Regular) · 600 (SemiBold) · 700 (Bold) · 800 (ExtraBold)`

### Hierarchie

| Úroveň | Velikost | Weight | Použití |
|---|---|---|---|
| **Display** | 40–48 px | 800 | Hero sekce, level-up screeny, velké oslavy |
| **H1** | 32–36 px | 700 | Název stránky |
| **H2** | 24–28 px | 700 | Nadpisy sekcí a karet |
| **H3** | 18–20 px | 600 | Pod-sekce, labely |
| **Body** | 16–18 px | 400 | Základní text, `line-height: 1.6` |
| **Small** | 14 px | 400 | Pomocné texty, poznámky |
| **Micro** | 12 px | 700 | Tagy, badges — vždy uppercase + `letter-spacing: 0.05em` |

### Pravidla

- **Nikdy** nepoužívat weight pod 400 v herním UI
- Body text min. **16 px** — pod touto hranicí iOS automaticky přibližuje input pole
- Herní čísla (XP, body, procenta): weight **800**, může být výrazně větší než okolní text

---

## 5. Ikonografie a ilustrace

### Styl ikon

- Styl: **outlined s tučným tahem** — min. 2px stroke, zaoblené konce linek
- Doporučená sada: **Heroicons** (rounded) nebo **Phosphor Icons** (regular/bold)
- Velikosti: `16 / 20 / 24 / 32 px`
- Barva: `--color-text` nebo barva kategorie — nikdy šedá na šedé

### Emoji jako herní badge

- Používat jako vizuální ikonu karty — uvnitř barevného kruhu nebo zaoblené čtverce
- Vždy doplněny textem — nikdy jako jediný informační prvek
- Styl: systémový (Apple nebo Google) — ne vlastní SVG emoji

### Ilustrace

- Styl: 2D, ploché barvy, tučné černé obrysy (3–4 px), minimální stínování
- Paleta: sytá, vychází ze sekce 3
- Formát: SVG pro web, PNG/SVG pro prezentace

---

## 6. Layout a spacing

### Spacing systém

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px
```

Vychází z 4px gridu. Nepoužívat hodnoty mimo tuto řadu.

### Border radius

| Prvek | Radius |
|---|---|
| Tlačítko | `999px` (pill) |
| Karta | `20px` |
| Modal | `28px` |
| Badge / tag | `999px` |
| Input | `12px` |
| Avatar circle | `999px` |

### Layout

- **Mobile-first** — breakpoint pro desktop: `768px`
- Hlavní layout dashboardu: avatar uprostřed, kategorie kolem dokola (3×3 grid)
- Progress bar: vertikální, vlevo mimo grid

---

## 7. Komponentový styl

### Tlačítka — 3D herní styl

Tlačítka mají **tučný spodní border** místo box-shadow — vytváří dojem fyzického 3D tlačítka, typický pro Duolingo a herní UI.

```css
/* Primary */
background: var(--color-primary);
color: #fff;
font-family: "Nunito", sans-serif;
font-weight: 700;
font-size: 16px;
border-radius: 999px;
border: none;
border-bottom: 4px solid var(--color-primary-dark);
padding: 14px 28px;
cursor: pointer;
transition: transform 0.08s, border-bottom-width 0.08s;

/* Hover / Active — tlačítko se "stiskne" */
transform: translateY(2px);
border-bottom-width: 2px;

/* Secondary */
background: #fff;
border: 2px solid var(--color-primary);
border-bottom: 4px solid var(--color-primary);
color: var(--color-primary);

/* Disabled */
background: #E5E7EB;
color: #9CA3AF;
border-bottom: 4px solid #D1D5DB;
cursor: not-allowed;
```

### Karty

```css
background: #fff;
border-radius: 20px;
border: 2px solid var(--color-border);
box-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
padding: 20px;
transition: transform 0.15s, box-shadow 0.15s;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 8px 0 rgba(0, 0, 0, 0.08);
```

Barevná varianta karty: `border-top: 4px solid <accent-color>` (vychází z mapování v sekci 11).

### Progress bar

```css
/* Track */
background: #E5E7EB;
border-radius: 999px;
height: 16px;
border: 2px solid rgba(0, 0, 0, 0.06);

/* Fill */
background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
border-radius: 999px;
transition: width 0.4s ease;
```

- Výška min. **16px** — dotyková plocha na mobilu
- Vždy zobrazit číselnou hodnotu nebo label vedle baru

### Badge / XP indikátor

```css
background: var(--color-gold-soft);
color: #92600A;
border: 2px solid #F59E0B;
border-radius: 999px;
font-size: 12px;
font-weight: 800;
padding: 4px 10px;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### Formuláře

```css
/* Input */
background: #fff;
border: 2px solid var(--color-border);
border-radius: 12px;
padding: 12px 16px;
font-family: "Nunito", sans-serif;
font-size: 16px; /* min 16px — zabraňuje autozoomu na iOS */

/* Focus */
border-color: var(--color-primary);
outline: none;
box-shadow: 0 0 0 3px rgba(109, 192, 48, 0.2);

/* Error */
border-color: var(--color-error);
box-shadow: 0 0 0 3px rgba(255, 75, 75, 0.15);
```

---

## 8. Herní vizuální jazyk

### Odměny — vizuální hierarchie

| Úroveň | Barva | Hex | Kdy |
|---|---|---|---|
| Splnění kategorie | Zelená | `#58CC02` | Dosažení cíle v dané kategorii |
| XP / hvězdičky | Gold | `#FFD700` | Správná odpověď, body |
| Streak | Orange | `#FF9B3B` | Série dní za sebou |
| Achievement | Purple | `#A855F7` | Speciální výzva, milestone |

### Celebrační stavy

- **Správná odpověď / splněná mise:** zelený flash + animace maskota
- **Level-up:** celá obrazovka — fialová + zlatá + animace postavičky
- **Streak:** oranžová notifikace s počtem dní

### Chybové stavy — pravidlo „bez trestání"

- Červená se zobrazí **pouze** v inputu nebo inline u konkrétního pole
- Celá obrazovka nikdy červená
- Jazyk vždy povzbudivý: místo „Špatně!" → „Skoro! Zkus to ještě jednou."
- Hráč nikdy neztrácí postup — může zkusit znovu bez penalizace viditelné v UI

### Prázdné stavy (empty state)

- Vždy s ilustrací maskota (usměvavý, zvídavý výraz)
- Text říká, **co hráč může udělat** — ne co chybí
- Vždy s CTA tlačítkem

---

## 9. Tone of voice

### Klíčový princip

Neklesáme na dětinskou úroveň, ale nikdy nemluvíme jako banka. Věk 8–15 let znamená jednu věc: respektuj inteligenci hráče.

| Kontext | Tón | Příklad |
|---|---|---|
| Onboarding | Vzrušený, přátelský | „Vítej, hrdino! Začínáme dobrodružství." |
| Instrukce v UI | Jasný, přímý | „Přesuň 20 % do úspor." |
| Úspěch | Oslavný, upřímný | „Výborně! Tvoje úspory rostou!" |
| Chyba | Povzbudivý | „Skoro! Zkus to ještě jednou." |
| Rodičovská sekce | Profesionální, stručný | „Přehled pokroku za tento týden." |

### Psací zásady

- **Tykat** vždy — dětem i rodičům v herním kontextu
- **Krátké věty** — max. 12 slov v herním UI
- **Bez finančního žargonu** — „odkládáš peníze" místo „alokuješ kapitál"
- **Aktivní slovesa** — „Splnil jsi misi!" ne „Mise byla splněna."
- **Emoce** — vykřičníky jsou povolené ve slavnostních momentech, ne jinde

---

## 10. Mapování barev na herní kategorie

| Kategorie | Barva | Hex | Proč |
|---|---|---|---|
| **Úspory** | Zelená (primary) | `#6DC030` | Růst, pokrok, pozitivní akce |
| **Zábava** | Pink | `#FF6BA8` | Radost, odměna, volnost |
| **Investice** | Purple | `#A855F7` | Prémiový pocit, dlouhodobý výhled |
| **Spotřeba** | Orange | `#FF9B3B` | Každodenní výzva, pozornost |
| **Nutné výdaje** | Blue | `#5EB3FF` | Stabilní základ, spolehlivost |

---

## 11. CSS tokeny

```css
:root {
  /* === BRAND === */
  --color-primary: #6dc030;
  --color-primary-dark: #4e9a20;
  --color-primary-light: #a3d96b;

  /* === BACKGROUNDS === */
  --color-bg: #fff4c9;
  --color-bg-soft: #fffbf0;

  /* === GAME ACCENTS === */
  --color-gold: #ffd700;
  --color-gold-soft: #fffaeb;
  --color-accent-blue: #5eb3ff;
  --color-accent-blue-soft: #dcf0ff;
  --color-accent-pink: #ff6ba8;
  --color-accent-pink-soft: #ffe0f0;
  --color-accent-purple: #a855f7;
  --color-accent-purple-soft: #f3e8ff;
  --color-accent-orange: #ff9b3b;
  --color-accent-orange-soft: #fff0dc;

  /* === TEXT & NEUTRALS === */
  --color-text: #2c2c2c;
  --color-text-soft: #6b7280;
  --color-border: #e5e7eb;
  --color-border-soft: #f3f4f6;
  --color-white: #ffffff;

  /* === STATUS === */
  --color-success: #58cc02;
  --color-success-bg: #e5f9cc;
  --color-warning: #ff9b3b;
  --color-warning-bg: #fff0dc;
  --color-error: #ff4b4b;
  --color-error-bg: #ffe0e0;
  --color-info: #5eb3ff;
  --color-info-bg: #dcf0ff;

  /* === GAME UI SHADOWS === */
  --btn-shadow-primary: 0 4px 0 #4e9a20;
  --btn-shadow-primary-active: 0 2px 0 #4e9a20;
  --card-shadow: 0 4px 0 rgba(0, 0, 0, 0.08);
  --card-shadow-hover: 0 8px 0 rgba(0, 0, 0, 0.08);
  --modal-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* === SPACING === */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* === RADII === */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-full: 999px;
}
```

---

## 12. Použití v prezentacích

- Pozadí slidů: `#FFF4C9`
- Obsahové boxy / karty: bílá, `border-radius: 20px`, `border: 2px solid #E5E7EB`
- Nadpisy: `#2C2C2C` nebo `#6DC030`
- Font: Nunito (fallback: Poppins)
- CTA prvky: stejný vizuální styl jako herní UI — 3D tlačítko, pill tvar

---

## 13. Do budoucna (v1 to neřeší)

- Jméno a finální design maskota
- Motion & animation guidelines (Framer Motion / Lottie)
- XP systém a vizuál levelování
- Achievement / badge systém
- Tmavý režim (dark mode)
- Accessibility (WCAG 2.1 AA audit)
- Sound design principy
