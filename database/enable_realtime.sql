-- ============================================================
-- Enable Supabase Realtime on all portfolio tables
-- Run this once in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable realtime publication for all portfolio tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE skills;
ALTER PUBLICATION supabase_realtime ADD TABLE education;
ALTER PUBLICATION supabase_realtime ADD TABLE experience;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE resume;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE social_links;

-- ============================================================
-- Verify RLS policies are correct for anon reads + auth writes
-- (Run only if you reset policies)
-- ============================================================

-- Re-confirm public read on all tables (safe to re-run)
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['users','skills','education','experience','projects',
                          'certificates','achievements','resume','social_links'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
