-- Update files table with proper columns and indexes
alter table files
  add column if not exists id uuid default uuid_generate_v4() primary key,
  add column if not exists labID uuid references labs(id) on delete cascade,
  add column if not exists filename text not null,
  add column if not exists folder text not null default 'root',
  add column if not exists fileType text,
  add column if not exists fileSize text,
  add column if not exists fileTag text,
  add column if not exists author text,
  add column if not exists date text,
  add column if not exists created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Create indexes
create index if not exists files_labID_idx on files(labID);
create index if not exists files_folder_idx on files(folder);

-- Add RLS policies
alter table files enable row level security;

create policy "Files are viewable by lab members"
  on files for select
  using (
    labID in (
      select labID from lab_members
      where userID = auth.uid()
    )
  );

create policy "Files are editable by lab admins"
  on files for all
  using (
    labID in (
      select labID from lab_members
      where userID = auth.uid() and role = 'admin'
    )
  ); 