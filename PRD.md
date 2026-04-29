# PRD: Budget Hero

## Problém
Děti ve věku 9–15 let nemají praktickou zkušenost s hospodařením s penězi. Budget Hero je simulátor rodinného rozpočtu, kde dítě každý měsíc rozhoduje o volitelných výdajích a na konci roku vidí, jestli dosáhlo svého cíle (např. dovolená u moře).

## Cílový uživatel
Děti 9–15 let, hrají samostatně nebo s rodičem — bez nutnosti registrace.

## User Stories
- Jako dítě chci vybrat šablonu rodinného rozpočtu, abych věděl s čím začínám
- Jako dítě chci každý měsíc rozhodovat co koupím, abych viděl jestli mi zbydou peníze
- Jako dítě chci vidět progress k cíli (dovolená), abych věděl jestli šetřím dost
- Jako dítě chci po 12 měsících vidět výsledek a zhodnocení celé hry
- Jako dítě chci hru resetovat a zkusit znovu jinak

## MVP Scope

### In scope
- Výběr přednastavené šablony rodinného rozpočtu
- Měsíční simulace (12 kol): dítě vybírá volitelné výdaje klikáním
- Vizualizace: zbývající peníze v měsíci, progress k ročnímu cíli
- Měsíční přehled výdajů podle kategorie
- Reset tlačítko pro novou hru (smaže session)

### Out of scope
- Více dětí / rodinné účty
- Achievementy / gamifikace bodů
- Multiplayer / srovnání s kamarádem
- Reálné propojení s bankou
- Admin UI pro správu scénářů

## Datový model

### Tabulka: scenarios
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| name | text | Název scénáře (např. "Rodina Novákových") |
| monthly_income | integer | Měsíční příjem v Kč |
| fixed_expenses | integer | Fixní výdaje v Kč/měsíc (nájem, jídlo...) |
| goal_name | text | Název cíle (např. "Letní dovolená") |
| goal_amount | integer | Cílová částka v Kč |
| goal_months | integer | Počet měsíců na dosažení cíle (12) |
| created_at | timestamptz | default now() |

### Tabulka: expense_items
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| scenario_id | integer | FK → scenarios |
| name | text | Název položky (např. "PlayStation hra") |
| category | text | Kategorie (Zábava, Oblečení, Vzdělání...) |
| amount | integer | Cena v Kč |
| created_at | timestamptz | default now() |

### Tabulka: sessions
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| scenario_id | integer | FK → scenarios |
| player_name | text | Jméno hráče |
| current_month | integer | Aktuální měsíc hry (1–12) |
| created_at | timestamptz | default now() |

### Tabulka: session_choices
| Sloupec | Typ | Popis |
|---------|-----|-------|
| id | integer (PK) | generated always as identity |
| session_id | integer | FK → sessions (ON DELETE CASCADE) |
| expense_item_id | integer | FK → expense_items |
| month | integer | Ve kterém měsíci koupeno (1–12) |
| created_at | timestamptz | default now() |

## SQL pro Supabase

Viz `migrations/001_initial.sql` — spusť v DEV projektu v Supabase SQL Editoru.
Až budeš deployovat, stejný SQL spustíš i v PROD projektu.
