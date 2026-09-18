begin;

create table public.mvp_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  captured_at timestamptz not null,
  author text not null check (author in ('Lia', 'Aram', 'Glen')),
  note text not null check (char_length(btrim(note)) between 1 and 5000),
  screenshot_path text not null unique,
  view_name text check (view_name in ('dashboard', 'entry', 'review', 'confirmation', 'driver')),
  order_id text,
  screen_title text,
  viewport_width integer check (viewport_width > 0),
  viewport_height integer check (viewport_height > 0),
  session_id text,
  app_version text,
  git_commit text
);

alter table public.mvp_feedback enable row level security;
revoke all privileges on table public.mvp_feedback from public, anon, authenticated;
-- Supabase default privileges may grant service_role ALL on new public tables.
revoke all privileges on table public.mvp_feedback from service_role;
grant insert on table public.mvp_feedback to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mvp-feedback-screenshots', 'mvp-feedback-screenshots', false,
  2097152, array['image/webp', 'image/png']::text[]);

commit;
