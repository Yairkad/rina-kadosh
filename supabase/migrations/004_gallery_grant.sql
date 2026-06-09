-- Grant table-level SELECT on gallery_items (required alongside RLS policy)
GRANT SELECT ON gallery_items TO anon, authenticated;
