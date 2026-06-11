-- Run this script in the Supabase SQL Editor (https://supabase.com)
-- to set up the 'users' table required for the investment simulator.

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    game_state JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on username for faster lookup during login
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 3. (Optional) Row Level Security (RLS) configuration
-- Since the backend Express server connects using the SERVICE_ROLE_KEY,
-- it will bypass Row Level Security. However, it is good practice to enable RLS
-- and deny all direct public access if you're not using Supabase client directly on the client.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Disable all public access to this table (only Service Role Key can read/write)
DROP POLICY IF EXISTS "Deny all public access" ON public.users;
CREATE POLICY "Deny all public access" ON public.users 
    FOR ALL 
    USING (false);

-- Success! Your table is ready.
