-- Budget Hero — schema update (v2)
-- Spusť v DEV projektu v Supabase SQL Editoru
-- Pozor: DROP smaže existující data!

-- Cleanup starého schématu
drop table if exists session_choices cascade;
drop table if exists sessions cascade;
drop table if exists expense_items cascade;
drop table if exists scenarios cascade;
drop table if exists goals cascade;
drop table if exists reality_events cascade;

-- Cíle (pre-seeded)
create table goals (
  id            integer generated always as identity primary key,
  name          text not null,
  target_amount integer not null,
  emoji         text not null default '🎯',
  created_at    timestamptz default now()
);

alter table goals enable row level security;
create policy "goals_allow_all" on goals for all using (true) with check (true);

-- Reality eventy (pre-seeded)
create table reality_events (
  id            integer generated always as identity primary key,
  name          text not null,
  description   text not null,
  effect_type   text not null, -- 'one_time_cost' | 'savings_cost' | 'income_reduction'
  effect_value  integer not null,
  effect_month  integer,       -- null = okamžitě při startu
  created_at    timestamptz default now()
);

alter table reality_events enable row level security;
create policy "reality_events_allow_all" on reality_events for all using (true) with check (true);

-- Výdajové položky (pre-seeded)
create table expense_items (
  id             integer generated always as identity primary key,
  name           text not null,
  category       text not null,  -- BYDLENÍ | SPOTŘEBA | INVESTICE | SPOŘENÍ | ZÁBAVA
  default_amount integer not null,
  is_fixed       boolean not null default false,
  is_insurance   boolean not null default false,
  created_at     timestamptz default now()
);

alter table expense_items enable row level security;
create policy "expense_items_allow_all" on expense_items for all using (true) with check (true);

-- Herní session
create table sessions (
  id                integer generated always as identity primary key,
  player_name       text not null,
  goal_id           integer references goals(id),
  reality_event_id  integer references reality_events(id),
  income_work       integer not null default 0,
  income_job        integer not null default 0,
  income_family     integer not null default 0,
  savings_start     integer not null default 0,
  current_month     integer not null default 1,
  created_at        timestamptz default now()
);

alter table sessions enable row level security;
create policy "sessions_allow_all" on sessions for all using (true) with check (true);

-- Rozhodnutí hráče
create table session_choices (
  id              integer generated always as identity primary key,
  session_id      integer references sessions(id) on delete cascade,
  expense_item_id integer references expense_items(id),
  month           integer not null,
  created_at      timestamptz default now()
);

alter table session_choices enable row level security;
create policy "session_choices_allow_all" on session_choices for all using (true) with check (true);

-- Seed: cíle
insert into goals (name, target_amount, emoji) values
  ('Nový telefon', 15000, '📱'),
  ('Letní dovolená', 25000, '🏖️'),
  ('Ta cool mikina', 3500, '👕');

-- Seed: reality eventy
insert into reality_events (name, description, effect_type, effect_value, effect_month) values
  ('Vytopení', 'Soused tě vytopil! Oprava přijde draho — pokud nemáš pojištění.', 'one_time_cost', 15000, 6),
  ('Rozbitá pračka', 'Pračka se porouchala a musíš koupit novou hned.', 'savings_cost', 8000, null),
  ('Nemoci', 'Celá rodina onemocněla. 3 měsíce výpadek 50 % příjmu.', 'income_reduction', 50, 4);

-- Seed: BYDLENÍ — fixní
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Nájem / hypotéka', 'BYDLENÍ', 15000, true),
  ('Elektřina', 'BYDLENÍ', 2500, true),
  ('Voda', 'BYDLENÍ', 800, true),
  ('Internet', 'BYDLENÍ', 600, true);

-- Seed: BYDLENÍ — volitelné (streaming)
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Netflix', 'BYDLENÍ', 329, false),
  ('Spotify', 'BYDLENÍ', 159, false),
  ('Disney+', 'BYDLENÍ', 239, false);

-- Seed: SPOTŘEBA — fixní
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Potraviny', 'SPOTŘEBA', 8000, true);

-- Seed: SPOTŘEBA — volitelné
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Restaurace a kavárny', 'SPOTŘEBA', 1200, false),
  ('Fast food', 'SPOTŘEBA', 600, false),
  ('Oblečení', 'SPOTŘEBA', 1500, false);

-- Seed: INVESTICE
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Online kurz', 'INVESTICE', 990, false),
  ('Kroužky', 'INVESTICE', 800, false);

-- Seed: SPOŘENÍ (pojištění = is_insurance)
insert into expense_items (name, category, default_amount, is_fixed, is_insurance) values
  ('Pojištění', 'SPOŘENÍ', 500, false, true);

insert into expense_items (name, category, default_amount, is_fixed) values
  ('Spoření / fond', 'SPOŘENÍ', 1000, false),
  ('Nová elektronika', 'SPOŘENÍ', 2000, false),
  ('Merch', 'SPOŘENÍ', 800, false),
  ('Výlety', 'SPOŘENÍ', 1500, false);

-- Seed: ZÁBAVA
insert into expense_items (name, category, default_amount, is_fixed) values
  ('Nová hra / tokeny', 'ZÁBAVA', 800, false),
  ('Čas s kamarády', 'ZÁBAVA', 600, false);
