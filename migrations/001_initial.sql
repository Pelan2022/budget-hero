-- Budget Hero — initial schema
-- Spusť v DEV projektu v Supabase SQL Editoru
-- Při deployi na produkci spusť stejný SQL i v PROD projektu

-- Šablony rodinných rozpočtů (pre-seeded, nikdy se nemažou)
create table scenarios (
  id              integer generated always as identity primary key,
  name            text not null,
  monthly_income  integer not null,
  fixed_expenses  integer not null,
  goal_name       text not null,
  goal_amount     integer not null,
  goal_months     integer not null default 12,
  created_at      timestamptz default now()
);

alter table scenarios enable row level security;
create policy "scenarios_allow_all" on scenarios
  for all using (true) with check (true);

-- Volitelné výdaje v rámci scénáře (pre-seeded)
create table expense_items (
  id          integer generated always as identity primary key,
  scenario_id integer references scenarios(id),
  name        text not null,
  category    text not null,
  amount      integer not null,
  created_at  timestamptz default now()
);

alter table expense_items enable row level security;
create policy "expense_items_allow_all" on expense_items
  for all using (true) with check (true);

-- Herní session (jedno zahrání = 12 měsíců)
create table sessions (
  id            integer generated always as identity primary key,
  scenario_id   integer references scenarios(id),
  player_name   text not null,
  current_month integer not null default 1,
  created_at    timestamptz default now()
);

alter table sessions enable row level security;
create policy "sessions_allow_all" on sessions
  for all using (true) with check (true);

-- Co dítě koupilo v daném měsíci
create table session_choices (
  id              integer generated always as identity primary key,
  session_id      integer references sessions(id) on delete cascade,
  expense_item_id integer references expense_items(id),
  month           integer not null,
  created_at      timestamptz default now()
);

alter table session_choices enable row level security;
create policy "session_choices_allow_all" on session_choices
  for all using (true) with check (true);

-- Seed: šablony scénářů
insert into scenarios (name, monthly_income, fixed_expenses, goal_name, goal_amount, goal_months) values
  ('Rodina Novákových', 45000, 30000, 'Letní dovolená u moře', 30000, 12),
  ('Rodina Svobodových', 35000, 25000, 'Nový herní počítač', 20000, 12);

-- Seed: volitelné výdaje — Novákovi (scenario_id = 1)
insert into expense_items (scenario_id, name, category, amount) values
  (1, 'PlayStation hra', 'Zábava', 1500),
  (1, 'Kino s kamarády', 'Zábava', 400),
  (1, 'Nové tenisky', 'Oblečení', 2500),
  (1, 'Knížka', 'Vzdělání', 300),
  (1, 'Fast food oběd', 'Jídlo', 200),
  (1, 'Výlet na kole', 'Sport', 150),
  (1, 'Online hra (měsíční předplatné)', 'Zábava', 250),
  (1, 'Nové tričko', 'Oblečení', 600);

-- Seed: volitelné výdaje — Svobodovi (scenario_id = 2)
insert into expense_items (scenario_id, name, category, amount) values
  (2, 'Mobilní hra (in-app nákup)', 'Zábava', 500),
  (2, 'Nové boty', 'Oblečení', 1800),
  (2, 'Streaming služba', 'Zábava', 199),
  (2, 'Školní pomůcky', 'Vzdělání', 450),
  (2, 'Burger King', 'Jídlo', 180),
  (2, 'Permanentka do bazénu', 'Sport', 800);
