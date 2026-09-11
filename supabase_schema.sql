-- ==============================================================================
-- SRI BALAJI GRANITES & MARBLES - SUPABASE DATABASE SCHEMA
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Slabs / Inventory Table
CREATE TABLE IF NOT EXISTS public.slabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    godown_id TEXT NOT NULL DEFAULT 'godown_1', -- 'godown_1', 'godown_2', 'godown_3'
    godown_name TEXT NOT NULL DEFAULT 'Godown 1 (Industrial Area Yard)',
    block_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Italian Marble', 'Indian Marble', 'Granite', 'Quartz', 'Onyx', 'Sandstone'
    image_url TEXT NOT NULL,
    length NUMERIC(10, 2) NOT NULL,
    width NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'feet', -- 'feet', 'meters', 'centimeters', 'inches'
    pieces INTEGER NOT NULL DEFAULT 1,
    total_sq_ft NUMERIC(10, 2) NOT NULL,
    total_sq_meters NUMERIC(10, 2) NOT NULL,
    thickness_mm INTEGER NOT NULL DEFAULT 18,
    finish TEXT NOT NULL DEFAULT 'Polished', -- 'Polished', 'Honed', 'Leathered', 'Flamed', 'Lappato'
    price_per_sq_ft NUMERIC(10, 2) NOT NULL,
    is_sold BOOLEAN NOT NULL DEFAULT FALSE,
    lot_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Customer Enquiries Table
CREATE TABLE IF NOT EXISTS public.customer_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT,
    client_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    delivery_address TEXT,
    preferred_godown TEXT DEFAULT 'any',
    requirement TEXT NOT NULL,
    dimension_unit TEXT DEFAULT 'feet',
    requested_quantity_sq_ft NUMERIC(10, 2) DEFAULT 0,
    selected_slab_ids JSONB DEFAULT '[]'::jsonb,
    total_estimated_cost NUMERIC(12, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Contacted', 'Quoted', 'Closed'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Trash / Recycle Bin Table (7-Day Auto Recovery)
CREATE TABLE IF NOT EXISTS public.trash_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slab_id UUID,
    slab_data JSONB NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_by TEXT DEFAULT 'admin',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- 4. Create Yard Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    type TEXT NOT NULL DEFAULT 'general', -- 'offer', 'arrival', 'general'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert Sample Seed Data for Sri Balaji Granites
INSERT INTO public.slabs (godown_id, godown_name, block_number, title, category, image_url, length, width, unit, pieces, total_sq_ft, total_sq_meters, thickness_mm, finish, price_per_sq_ft, is_sold, lot_name)
VALUES
('godown_1', 'Godown 1 (Industrial Area Yard)', 'SBG-BLK-101', 'Black Galaxy Granite (Gold Star)', 'Granite', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 10, 6, 'feet', 42, 2520, 234.11, 18, 'Polished', 185, false, 'Ongole Premium Lot 14'),
('godown_2', 'Godown 2 (Kishangarh Bypass Gallery)', 'SBG-BLK-102', 'Statuario Extra White Italian Marble', 'Italian Marble', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 9.5, 5.5, 'feet', 28, 1463, 135.91, 18, 'Polished', 750, false, 'Carrara Direct Import 08'),
('godown_3', 'Godown 3 (Makrana Highway Yard)', 'SBG-BLK-103', 'Makrana Pure White Albeta Marble', 'Indian Marble', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80', 8, 4.5, 'feet', 60, 2160, 200.67, 16, 'Polished', 320, false, 'Makrana Dungri Lot 03'),
('godown_1', 'Godown 1 (Industrial Area Yard)', 'SBG-BLK-104', 'Rajasthan Royal Tan Brown Granite', 'Granite', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', 11, 6.5, 'feet', 35, 2502.5, 232.49, 20, 'Lappato', 125, false, 'Jalore Quarry Lot 19'),
('godown_2', 'Godown 2 (Kishangarh Bypass Gallery)', 'SBG-BLK-105', 'Royal Emerald Honey Onyx (Backlit)', 'Onyx', 'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=1200&q=80', 7, 4, 'feet', 15, 420, 39.02, 16, 'Polished', 1200, false, 'Iranian Translucent Lot 02')
ON CONFLICT DO NOTHING;

INSERT INTO public.announcements (title, message, type, is_active)
VALUES
('New Ongole Black Galaxy Slabs Unloaded', 'Over 25,000 Sq.Ft fresh premium export quality Black Galaxy Granite lot now available at Godown 1.', 'arrival', true),
('Direct Factory Discount on Makrana Albeta', 'Special trade discount of ₹25/sq.ft for full truckload dispatch this month.', 'offer', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) & Allow Read/Write
ALTER TABLE public.slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
CREATE POLICY "Public Read Slabs" ON public.slabs FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Insert Enquiries" ON public.customer_queries FOR INSERT WITH CHECK (true);

-- Admin Full Access Policies (Using Supabase Service Role or Authenticated users)
CREATE POLICY "Full Access Slabs" ON public.slabs FOR ALL USING (true);
CREATE POLICY "Full Access Enquiries" ON public.customer_queries FOR ALL USING (true);
CREATE POLICY "Full Access Trash" ON public.trash_items FOR ALL USING (true);
CREATE POLICY "Full Access Announcements" ON public.announcements FOR ALL USING (true);
