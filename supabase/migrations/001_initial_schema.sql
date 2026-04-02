-- =============================================================
-- GEWISS CRM - Supabase Schema (v2)
-- Run this in your Supabase SQL Editor
-- =============================================================

create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  company_name text not null,
  role text not null default 'designer' check (role in ('designer', 'admin')),
  created_at timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Admins can view all users" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- PROJECTS TABLE
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  project_name text not null,
  designer_id uuid references public.users(id) on delete cascade not null,
  installer_name text not null,
  beneficiary_name text not null,
  observations text,
  status text not null default 'registered'
    check (status in ('registered','in_quotation','sale_secured','completed','reward_paid')),
  chance_winning boolean not null default false,
  reward_paid boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Designers can view own projects" on public.projects for select using (auth.uid() = designer_id);
create policy "Designers can insert own projects" on public.projects for insert with check (auth.uid() = designer_id);
create policy "Designers can update own editable projects" on public.projects for update
  using (auth.uid() = designer_id and status not in ('completed','reward_paid'));
create policy "Admins can view all projects" on public.projects for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all projects" on public.projects for update using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- BOQ FILES TABLE (versioned)
create table if not exists public.boq_files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  version_number integer not null default 1,
  file_path text not null,
  file_name text not null,
  file_size_bytes bigint,
  file_type text,
  note text,
  uploaded_by uuid references public.users(id),
  uploaded_at timestamptz default now(),
  unique(project_id, version_number)
);
alter table public.boq_files enable row level security;
create policy "Designers can manage own BOQ files" on public.boq_files for all
  using (exists (select 1 from public.projects where id = project_id and designer_id = auth.uid()));
create policy "Admins can manage all BOQ files" on public.boq_files for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- DESIGNER PAYMENTS TABLE
create table if not exists public.designer_payments (
  id uuid default uuid_generate_v4() primary key,
  designer_id uuid references public.users(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  project_reference text,
  project_id uuid references public.projects(id) on delete set null,
  paid_at timestamptz default now(),
  created_by uuid references public.users(id),
  note text
);
alter table public.designer_payments enable row level security;
create policy "Admins can manage all payments" on public.designer_payments for all
  using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
create policy "Designers can view own payments" on public.designer_payments for select
  using (auth.uid() = designer_id);

-- AUTO updated_at
create or replace function public.handle_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- NEW USER TRIGGER
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.users (id, username, company_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'company_name','Unknown Company'),
    coalesce(new.raw_user_meta_data->>'role','designer')
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- HELPER: next BOQ version
create or replace function public.next_boq_version(p_project_id uuid) returns integer as $$
  select coalesce(max(version_number),0)+1 from public.boq_files where project_id = p_project_id;
$$ language sql;

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('boq-files','boq-files',false) on conflict (id) do nothing;
create policy "Users can upload BOQ files" on storage.objects for insert
  with check (bucket_id='boq-files' and auth.uid() is not null and (storage.foldername(name))[1]=auth.uid()::text);
create policy "Users can view BOQ files" on storage.objects for select
  using (bucket_id='boq-files' and (
    (storage.foldername(name))[1]=auth.uid()::text
    or exists (select 1 from public.users where id=auth.uid() and role='admin')
  ));
create policy "Admins can delete BOQ files" on storage.objects for delete
  using (bucket_id='boq-files' and exists (select 1 from public.users where id=auth.uid() and role='admin'));

-- SEED ADMIN (run after creating auth user):
-- UPDATE public.users SET username='admin', company_name='Gewiss Romania', role='admin' WHERE id='<uuid>';
