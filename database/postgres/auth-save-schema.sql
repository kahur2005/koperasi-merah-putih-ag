create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text,
  auth_provider text not null default 'password',
  google_uid text unique,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

alter table app_users alter column password_hash drop not null;
alter table app_users add column if not exists auth_provider text not null default 'password';
alter table app_users add column if not exists google_uid text;
alter table app_users add column if not exists email text;
alter table app_users add column if not exists display_name text;
alter table app_users add column if not exists avatar_url text;

create unique index if not exists idx_app_users_google_uid
on app_users (google_uid)
where google_uid is not null;

create table if not exists game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  save_name text not null default 'Main Save',
  game_state jsonb not null,
  day_number integer,
  money numeric(14, 2),
  happiness numeric(5, 2),
  member_count integer,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now(),
  unique (user_id, save_name)
);

create or replace function set_auth_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_users_updated_at on app_users;
create trigger trg_app_users_updated_at
before update on app_users
for each row execute function set_auth_updated_at();

drop trigger if exists trg_game_saves_updated_at on game_saves;
create trigger trg_game_saves_updated_at
before update on game_saves
for each row execute function set_auth_updated_at();
