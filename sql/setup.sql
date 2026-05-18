-- ============================================================================
-- DataKeeper Accounting System - Supabase Database Schema
-- ============================================================================
-- This script sets up all tables, RLS policies, and functions for DataKeeper
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query → Paste → Run

-- ============================================================================
-- 1. USERS TABLE (extends auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profile
CREATE POLICY "users_can_read_own_profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
CREATE POLICY "users_can_update_own_profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- 2. MATERIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stock_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  initial_stock_kg DECIMAL(10, 2) NOT NULL DEFAULT 0,
  purchase_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own materials
CREATE POLICY "materials_users_can_read_own" ON public.materials
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own materials
CREATE POLICY "materials_users_can_insert" ON public.materials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own materials
CREATE POLICY "materials_users_can_update" ON public.materials
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own materials
CREATE POLICY "materials_users_can_delete" ON public.materials
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON public.materials(created_at DESC);

-- ============================================================================
-- 3. SALES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  material_id TEXT NOT NULL REFERENCES public.materials(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  material_name TEXT NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  rate_per_kg DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own sales
CREATE POLICY "sales_users_can_read_own" ON public.sales
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own sales
CREATE POLICY "sales_users_can_insert" ON public.sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own sales
CREATE POLICY "sales_users_can_update" ON public.sales
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own sales
CREATE POLICY "sales_users_can_delete" ON public.sales
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_material_id ON public.sales(material_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);

-- ============================================================================
-- 4. TRIGGER FUNCTIONS
-- ============================================================================

-- Auto-create user profile when signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for auto user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for materials
DROP TRIGGER IF EXISTS update_materials_updated_at ON public.materials;
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for sales
DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. SEED DATA (for demo - optional, remove for production)
-- ============================================================================
-- Note: Replace 'demo-user-uuid' with actual user ID after creating a test account
-- You can skip this and add data through the app instead
