begin;

-- Name verified against pg_constraint on the linked project before authoring.
alter table public.mvp_feedback
  drop constraint mvp_feedback_author_check,
  add constraint mvp_feedback_author_check
    check (author in ('Lia', 'Aram', 'Glen', 'Justin'));

commit;
