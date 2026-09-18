begin;

create table public.mvp_feedback_processing (
  feedback_id uuid primary key
    references public.mvp_feedback(id) on delete cascade,
  status text not null check (status in (
    'reviewed', 'resolved', 'needs_clarification', 'no_change'
  )),
  classification text not null check (classification in (
    'bug', 'ux', 'feature_request', 'business_rule',
    'positive_feedback', 'other'
  )),
  analysis text not null,
  resolution_summary text,
  processed_at timestamptz not null default now(),
  resolved_commit text
);

alter table public.mvp_feedback_processing enable row level security;
revoke all privileges on table public.mvp_feedback_processing
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.mvp_feedback_processing
  to service_role;

commit;
