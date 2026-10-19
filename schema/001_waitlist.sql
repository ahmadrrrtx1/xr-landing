-- Waitlist table for the XR landing page.
--
-- Apply with:
--   turso db shell . schema/001_waitlist.sql
--
-- `email` is the PRIMARY KEY on purpose: a duplicate signup is a
-- no-op at the database level, not an application convention, and it
-- can never produce two rows for one address.
--
-- Only the email is stored. No name, no IP, no user agent, no
-- analytics. `source` records which form on the page was used and
-- is a fixed, non-identifying label.

CREATE TABLE IF NOT EXISTS waitlist (
  email       TEXT PRIMARY KEY NOT NULL,
  source      TEXT NOT NULL DEFAULT 'landing',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS waitlist_created_at ON waitlist(created_at);
