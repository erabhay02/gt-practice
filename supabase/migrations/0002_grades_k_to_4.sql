-- Kindergarten (0) through 4th grade (4); previously 1st and 2nd only.
alter table public.children drop constraint children_grade_check;
alter table public.children add constraint children_grade_check check (grade between 0 and 4);
