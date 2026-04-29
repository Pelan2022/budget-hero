# PRD: Budget Hero
## Tvůj rok v životě — vystačí ti peníze?

## Problém
Děti ve věku 9–15 let nemají praktickou zkušenost s hospodařením s penězi. Budget Hero je roční finanční simulátor — dítě nastaví příjmy, vybere životní cíl a "realitu" (náhodná životní událost), pak 12 měsíců rozhoduje o výdajích a na konci vidí, jak dopadlo.

## Cílový uživatel
Děti 9–15 let, hrají samostatně nebo s rodičem — bez nutnosti registrace.

## Struktura aplikace
1. **Obrazovka vstupů** [1] — výběr cíle + reality + zadání příjmů
2. **Obrazovka rozhodování** [1–12] — měsíční výběr výdajů podle kategorií
3. **Obrazovka výsledků** [1] — 4-tierový výsledek + přehled výdajů

## User Stories
- Jako dítě chci zadat příjmy rodiny a vybrat svůj cíl, abych věděl co se snažím naspořit
- Jako dítě chci zvolit "realitu" (životní událost), abych zažil jak nečekané výdaje ovlivní plán
- Jako dítě chci každý měsíc rozhodovat o výdajích podle kategorií, abych viděl co si mohu dovolit
- Jako dítě chci vidět jestli mi pojištění zachránilo situaci při vytopení
- Jako dítě chci po 12 měsících vidět svůj výsledkový tier a co udělal dobře/špatně
- Jako dítě chci hru resetovat a zkusit jinou strategii

## MVP Scope

### In scope
- Vstupní obrazovka: výběr cíle, výběr reality události, zadání příjmů (pravidelné + počáteční úspory)
- 12 měsíců rozhodování s kategoriemi: BYDLENÍ, SPOTŘEBA, INVESTICE, SPOŘENÍ, ZÁBAVA, REZERVY
- BYDLENÍ obsahuje fixní položky (nájem, elektřina, voda, internet) — nelze přeskočit
- Reality event se projeví v průběhu roku — každý event má vlastní timing a mechaniku
- Vizualizace: zbývající budget v měsíci, progress k cíli
- 4-tierový výsledek: Skrblík / Střední třída / Rozpadlé sny / Looser
- Reset tlačítko pro novou hru

### Out of scope
- Více dětí / rodinné účty
- Achievementy / gamifikace bodů
- Multiplayer / srovnání s kamarádem
- Reálné propojení s bankou
- Admin UI pro správu položek

## Herní logika — reality eventy

| Event | Efekt | Timing | Podmínka / volba |
|-------|-------|--------|------------------|
| Vytopení | Jednorázový výdaj 15 000 Kč | Měsíc 6, musí zaplatit hned | Pokud platí pojištění → výdaj = 0 |
| Rozbitá pračka | Odečte 8 000 Kč z úspor | Okamžitě při startu | Musí zaplatit hned |
| Nemoc | Příjem snížen o 50 % | Měsíc 4 (1 měsíc) | Bez podmínky |
| Rozbité auto | Jednorázový výdaj 12 000 Kč | Měsíc 8 | Hráč se může rozhodnout: zaplatit NEBO chodit pěšky (výdaj = 0, ale "bez auta") |
| Sportovní soustředění | Odečte 6 000 Kč z úspor | Měsíc 9 | Musí zaplatit hned |

**Pojistka**: pojištění je položka v kategorii SPOŘENÍ. Pokud ji hráč zaplatil v měsíci 5 nebo dříve → vytopení jej nepoškodí.

**Rozbité auto — volitelná platba**: jediný event kde hráč aktivně rozhoduje v herní obrazovce (zobrazí se modal s volbou). Herní logika: nezaplacení nemá dopad na výsledek, jen textovou poznámku ("jezdíš MHD").

## 4-tierový výsledek

| Tier | Podmínka |
|------|----------|
| 🏆 Skrblík | Dosáhl cíle + zbyly peníze (může rozhodnout co s nimi) |
| 😊 Střední třída | Dosáhl cíle "šur null" (±5 % od cílové částky) |
| 😓 Rozpadlé sny | Nedosáhl cíle, ale pokryl všechny náklady rodiny |
| 💀 Looser | Nedosáhl cíle A nepokryl náklady (záporný zůstatek) |

## Datový model

### Tabulka: goals
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| name | text | Název cíle (např. "Nový telefon") |
| target_amount | integer | Cílová částka v Kč |
| emoji | text | Ikona (📱, 🏖️, 👕) |
| created_at | timestamptz | default now() |

### Tabulka: reality_events
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| name | text | Název události (např. "Vytopení") |
| description | text | Popis co se stane |
| effect_type | text | 'one_time_cost' / 'savings_cost' / 'income_reduction' / 'optional_cost' |
| is_deferrable | boolean | true = hráč může odmítnout zaplatit (Rozbité auto) |
| effect_value | integer | Kč nebo % snížení příjmu |
| effect_month | integer | Ve kterém měsíci nastane (null = okamžitě) |
| created_at | timestamptz | default now() |

### Tabulka: expense_items
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| name | text | Název (např. "Nájem / hypotéka") |
| category | text | BYDLENÍ / SPOTŘEBA / INVESTICE / SPOŘENÍ / ZÁBAVA / REZERVY |
| default_amount | integer | Výchozí cena v Kč |
| is_fixed | boolean | true = povinný výdaj (nelze přeskočit) |
| is_insurance | boolean | true = tato položka chrání před vytopením |
| created_at | timestamptz | default now() |

### Tabulka: sessions
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| player_name | text | Jméno hráče |
| goal_id | integer | FK → goals |
| reality_event_id | integer | FK → reality_events |
| income_work | integer | Výdělek rodičů (Kč/měs) |
| income_job | integer | Brigáda (Kč/měs) |
| income_family | integer | Příspěvky od babiček (Kč/měs) |
| savings_start | integer | Počáteční úspory (Kč) |
| current_month | integer | Aktuální měsíc hry (1–12) |
| created_at | timestamptz | default now() |

### Tabulka: session_choices
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| session_id | integer | FK → sessions (ON DELETE CASCADE) |
| expense_item_id | integer | FK → expense_items |
| month | integer | Ve kterém měsíci zaplaceno (1–12) |
| created_at | timestamptz | default now() |

## SQL pro Supabase

Viz `migrations/002_schema_update.sql` — spusť v DEV projektu v Supabase SQL Editoru (DROP + CREATE).
Až budeš deployovat, stejný SQL spustíš i v PROD projektu.
