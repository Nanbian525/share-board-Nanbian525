-- 在 Supabase 控制台 → SQL Editor 中运行此脚本
-- https://supabase.com/dashboard

-- 1. 数据表
create table if not exists share_posts (
  id uuid primary key default gen_random_uuid(),
  board_id text not null default 'default',
  text text not null default '',
  link text not null default '',
  image_path text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists share_posts_board_updated
  on share_posts (board_id, updated_at desc);

-- 2. 存储桶（若已存在可跳过，在 Storage 里手动建名为 share-board 的 Public 桶也行）
insert into storage.buckets (id, name, public)
values ('share-board', 'share-board', true)
on conflict (id) do update set public = true;

-- 3. 行级安全：允许匿名读写（适合私人小圈子；勿把密钥泄露给陌生人）
alter table share_posts enable row level security;

drop policy if exists "share_posts_select" on share_posts;
drop policy if exists "share_posts_insert" on share_posts;
drop policy if exists "share_posts_update" on share_posts;
drop policy if exists "share_posts_delete" on share_posts;

create policy "share_posts_select" on share_posts for select using (true);
create policy "share_posts_insert" on share_posts for insert with check (true);
create policy "share_posts_update" on share_posts for update using (true);
create policy "share_posts_delete" on share_posts for delete using (true);

-- 4. 存储桶策略：允许上传与读取图片
drop policy if exists "share_board_storage_select" on storage.objects;
drop policy if exists "share_board_storage_insert" on storage.objects;
drop policy if exists "share_board_storage_update" on storage.objects;
drop policy if exists "share_board_storage_delete" on storage.objects;

create policy "share_board_storage_select"
  on storage.objects for select
  using (bucket_id = 'share-board');

create policy "share_board_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'share-board');

create policy "share_board_storage_update"
  on storage.objects for update
  using (bucket_id = 'share-board');

create policy "share_board_storage_delete"
  on storage.objects for delete
  using (bucket_id = 'share-board');
