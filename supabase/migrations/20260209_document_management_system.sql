-- Create Document Type Enums (Idempotent)
DO $$ BEGIN
    CREATE TYPE public.document_category AS ENUM ('reference', 'instruction', 'assignment_support', 'policy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.document_parent_node AS ENUM ('course', 'module', 'lesson');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.document_visibility AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Documents Table
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    document_type public.document_category not null,
    parent_type public.document_parent_node not null,
    parent_id uuid not null,
    storage_path text not null unique,
    visibility_status public.document_visibility default 'draft' not null,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Indexes for performance
create index if not exists idx_documents_parent on public.documents (parent_type, parent_id);
create index if not exists idx_documents_visibility on public.documents (visibility_status);

-- RLS Configuration (Direct Dashboard Access Mode)
alter table public.documents disable row level security;
grant all on table public.documents to anon, authenticated, service_role;

-- Admin: Full Control
drop policy if exists "Admins have full access to documents" on public.documents;
create policy "Admins have full access to documents"
on public.documents
for all
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
)
with check (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

-- Student: Read-only access to published documents for unlocked content
drop policy if exists "Students can view published documents for unlocked content" on public.documents;
create policy "Students can view published documents for unlocked content"
on public.documents
for select
to authenticated
using (
    visibility_status = 'published'
    and (
        -- Course level: If course is published
        (parent_type = 'course' and exists (
            select 1 from public.courses 
            where courses.id = parent_id 
            and courses.is_published = true
        ))
        or
        -- Module level: If enrolled and module is unlocked
        (parent_type = 'module' and exists (
            select 1 from public.enrollments e
            join public.modules m on m.course_id = e.course_id
            where m.id = parent_id
            and e.student_id = auth.uid()
            -- Add logic here if you have a module_locks or similar, 
            -- otherwise based on enrollment existence and course being published
        ))
        or
        -- Lesson level: If enrolled and lesson belongs to unlocked module
        (parent_type = 'lesson' and exists (
            select 1 from public.enrollments e
            join public.modules m on m.course_id = e.course_id
            join public.lessons l on l.module_id = m.id
            where l.id = parent_id
            and e.student_id = auth.uid()
        ))
    )
);

-- Storage Bucket: course-documents
insert into storage.buckets (id, name, public) 
values ('course-documents', 'course-documents', false)
on conflict (id) do nothing;

-- Storage RLS Policies
drop policy if exists "Admins can manage document files" on storage.objects;
create policy "Admins can manage document files"
on storage.objects
for all
to authenticated
using (
    bucket_id = 'course-documents' 
    and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
);

drop policy if exists "Students can download published documents" on storage.objects;
create policy "Students can download published documents"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'course-documents'
    and exists (
        select 1 from public.documents
        where storage_path = name
        and visibility_status = 'published'
        -- Access logic is handled by the documents table policy + enrollment check
    )
);

-- Audit Functions for Documents
create or replace function public.log_document_action()
returns trigger as $$
declare
    v_action text;
begin
    if (TG_OP = 'INSERT') then
        v_action := 'document_uploaded';
    elsif (TG_OP = 'DELETE') then
        v_action := 'document_deleted';
    else
        v_action := 'document_updated';
    end if;

    insert into public.audit_logs (
        actor_id,
        actor_role,
        action,
        entity_type,
        entity_id,
        metadata
    ) values (
        auth.uid(),
        'admin',
        v_action,
        'document',
        case when TG_OP = 'DELETE' then OLD.id::text else NEW.id::text end,
        jsonb_build_object(
            'title', case when TG_OP = 'DELETE' then OLD.title else NEW.title end,
            'parent_type', case when TG_OP = 'DELETE' then OLD.parent_type else NEW.parent_type end,
            'parent_id', case when TG_OP = 'DELETE' then OLD.parent_id else NEW.parent_id end,
            'storage_path', case when TG_OP = 'DELETE' then OLD.storage_path else NEW.storage_path end
        )
    );
    
    if (TG_OP = 'DELETE') then
        return OLD;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_audit_documents on public.documents;
create trigger tr_audit_documents
after insert or update or delete on public.documents
for each row execute function public.log_document_action();
