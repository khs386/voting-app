-- Supabase에서 아래 SQL을 실행하세요 (SQL Editor)

create table polls (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  options jsonb not null,
  created_at timestamp with time zone default now(),
  is_active boolean default true
);

create table votes (
  id uuid default gen_random_uuid() primary key,
  poll_id uuid references polls(id) on delete cascade,
  option_index integer not null,
  created_at timestamp with time zone default now()
);
