-- Phase 3: CogAT Levels 11 (5th grade) and 12 (6th grade); previously K through 4th.
alter table public.children drop constraint children_grade_check;
alter table public.children add constraint children_grade_check check (grade between 0 and 6);
