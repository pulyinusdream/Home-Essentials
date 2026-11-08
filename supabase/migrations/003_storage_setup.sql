begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-media',
  'public-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy public_media_read
on storage.objects for select
to anon, authenticated
using (bucket_id = 'public-media');

create policy public_media_staff_insert
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'public-media'
  and private.has_role(array['admin'])
  and (storage.foldername(name))[1] in ('products', 'articles', 'categories', 'site')
);

create policy public_media_staff_update
on storage.objects for update
to authenticated
using (
  bucket_id = 'public-media'
  and private.has_role(array['admin'])
)
with check (
  bucket_id = 'public-media'
  and private.has_role(array['admin'])
);

create policy public_media_staff_delete
on storage.objects for delete
to authenticated
using (
  bucket_id = 'public-media'
  and private.has_role(array['admin'])
);

commit;
