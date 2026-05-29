-- Run this entire file in Supabase SQL Editor > New Query

-- ── Extend suppliers table ──────────────────────────────────────────────────
ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS bio        TEXT,
  ADD COLUMN IF NOT EXISTS status     TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ   DEFAULT NOW();

-- ── Profile views ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profile_views (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id     UUID        NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  viewer_clerk_id TEXT,
  viewed_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Inquiries (planner → supplier) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inquiries (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id      UUID        NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  planner_name     TEXT        NOT NULL,
  planner_email    TEXT        NOT NULL,
  planner_location TEXT,
  event_type       TEXT        NOT NULL,
  event_date       DATE,
  guest_count      INTEGER,
  budget_min       INTEGER,
  budget_max       INTEGER,
  message          TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending',
  -- status: 'pending' | 'confirmed' | 'declined' | 'completed'
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Bookings (confirmed inquiries) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id    UUID        REFERENCES inquiries(id),
  supplier_id   UUID        NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  planner_name  TEXT        NOT NULL,
  event_type    TEXT        NOT NULL,
  event_date    DATE        NOT NULL,
  guest_count   INTEGER,
  amount_cents  INTEGER     NOT NULL DEFAULT 0,  -- price in cents e.g. 12000 = $120
  status        TEXT        NOT NULL DEFAULT 'confirmed',
  -- status: 'confirmed' | 'completed' | 'cancelled'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Availability blocks (supplier-managed) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS availability_blocks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id  UUID        NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  blocked_date DATE        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (supplier_id, blocked_date)
);

-- ── Optional: seed realistic demo data ─────────────────────────────────────
-- Replace 'YOUR-SUPPLIER-UUID' with your actual supplier row id after signing up.
-- You can find it in Supabase > Table Editor > suppliers.

-- INSERT INTO inquiries (supplier_id, planner_name, planner_email, planner_location, event_type, event_date, guest_count, budget_min, budget_max, status)
-- VALUES
--   ('YOUR-SUPPLIER-UUID', 'Sarah K.',      'sarah@example.com',    'North York, Toronto',  'Baby shower',     '2026-03-15', 35, 300, 400,  'pending'),
--   ('YOUR-SUPPLIER-UUID', 'Jennifer L.',   'jen@example.com',      'Yorkville, Toronto',   '1st birthday',    '2026-03-22', 50, 500, 700,  'confirmed'),
--   ('YOUR-SUPPLIER-UUID', 'Michael + Amy', 'michamy@example.com',  'Downtown, Toronto',    'Engagement party','2026-04-05', 80, 800, 1200, 'pending'),
--   ('YOUR-SUPPLIER-UUID', 'Priya M.',      'priya@example.com',    'Etobicoke, Toronto',   'Baby shower',     '2026-02-28', 28, 200, 300,  'completed'),
--   ('YOUR-SUPPLIER-UUID', 'Danielle R.',   'danielle@example.com', 'Scarborough, Toronto', '1st birthday',    '2026-04-12', 45, 400, 600,  'pending');

-- INSERT INTO bookings (supplier_id, planner_name, event_type, event_date, guest_count, amount_cents, status)
-- VALUES
--   ('YOUR-SUPPLIER-UUID', 'Priya M.',    'Baby shower',   '2026-02-28', 28, 84000,  'completed'),
--   ('YOUR-SUPPLIER-UUID', 'Jennifer L.', '1st birthday',  '2026-03-22', 50, 126000, 'confirmed'),
--   ('YOUR-SUPPLIER-UUID', 'Diana M.',    'Welcome baby',  '2026-02-22', 20, 57600,  'completed');
