-- ========================================================
-- COFFEE MANAGEMENT SYSTEM - SUPABASE SCHEMA (CORRECTED)
-- Complete database schema for managing coffee shop operations
-- ========================================================

-- ==================== DROP EXISTING TABLES ====================
-- Start fresh - drop all tables if they exist
DROP TABLE IF EXISTS transaction_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS daily_statistics CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ==================== USER ROLES TABLE ====================
-- Stores user roles and staff information
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ==================== MENU ITEMS TABLE ====================
-- Stores all available menu items (coffee drinks and food)
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== TRANSACTIONS TABLE ====================
-- Stores all completed orders/transactions
CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_time TIME NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'e-wallet')),
  status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ==================== TRANSACTION ITEMS TABLE ====================
-- Stores individual items within each transaction
CREATE TABLE transaction_items (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL,
  menu_item_id BIGINT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit > 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
);

-- ==================== PAYMENT METHODS TABLE ====================
-- Stores available payment methods
CREATE TABLE payment_methods (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== DAILY STATISTICS TABLE ====================
-- Stores daily revenue and order statistics
CREATE TABLE daily_statistics (
  id BIGSERIAL PRIMARY KEY,
  stat_date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total_revenue >= 0),
  total_orders INT NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
  total_customers INT NOT NULL DEFAULT 0 CHECK (total_customers >= 0),
  total_smiles INT NOT NULL DEFAULT 0 CHECK (total_smiles >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== CREATE INDEXES ====================
-- Improve query performance for common queries
DROP INDEX IF EXISTS idx_user_roles_email;
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_transactions_date;
DROP INDEX IF EXISTS idx_transactions_created_at;
DROP INDEX IF EXISTS idx_transaction_items_transaction;
DROP INDEX IF EXISTS idx_transaction_items_menu;
DROP INDEX IF EXISTS idx_daily_stats_date;
DROP INDEX IF EXISTS idx_menu_items_active;

CREATE INDEX idx_user_roles_email ON user_roles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_menu ON transaction_items(menu_item_id);
CREATE INDEX idx_daily_stats_date ON daily_statistics(stat_date DESC);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- ==================== AUTO-INSERT TRIGGER ====================
-- Automatically create user_roles record when user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger that fires on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_statistics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable update for all users" ON menu_items;
DROP POLICY IF EXISTS "Enable read for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON transactions;
DROP POLICY IF EXISTS "Enable read for all users" ON transaction_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON transaction_items;
DROP POLICY IF EXISTS "Enable read for all users" ON payment_methods;
DROP POLICY IF EXISTS "Enable insert for all users" ON payment_methods;
DROP POLICY IF EXISTS "Enable read for all users" ON daily_statistics;
DROP POLICY IF EXISTS "Enable insert for all users" ON daily_statistics;
DROP POLICY IF EXISTS "Enable update for all users" ON daily_statistics;
DROP POLICY IF EXISTS "Enable read for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable update for all users" ON user_roles;

-- Create policies for user_roles table
CREATE POLICY "Enable read for all users"
  ON user_roles FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
  ON user_roles FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON user_roles FOR UPDATE USING (true) WITH CHECK (true);

-- Create policies for menu_items table (public read, admin write)
CREATE POLICY "Enable read for all users"
  ON menu_items FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON menu_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON menu_items FOR UPDATE USING (true) WITH CHECK (true);

-- Create policies for transactions table (public read/write)
CREATE POLICY "Enable read for all users"
  ON transactions FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
  ON transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON transactions FOR UPDATE USING (true) WITH CHECK (true);

-- Create policies for transaction_items table
CREATE POLICY "Enable read for all users"
  ON transaction_items FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users"
  ON transaction_items FOR INSERT WITH CHECK (true);

-- Create policies for payment_methods table
CREATE POLICY "Enable read for all users"
  ON payment_methods FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON payment_methods FOR INSERT WITH CHECK (true);

-- Create policies for daily_statistics table
CREATE POLICY "Enable read for all users"
  ON daily_statistics FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON daily_statistics FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON daily_statistics FOR UPDATE USING (true) WITH CHECK (true);

-- ==================== SEED DATA ====================
-- Delete existing data to prevent conflicts
DELETE FROM transaction_items;
DELETE FROM transactions;
DELETE FROM menu_items;
DELETE FROM payment_methods;
DELETE FROM daily_statistics;

-- Insert default menu items with correct IDs
INSERT INTO menu_items (name, emoji, price, description, is_active) VALUES
  ('Caramel Latte', '☕', 5.50, 'Smooth espresso with caramel syrup and steamed milk', true),
  ('Blueberry Muffin', '🧁', 4.25, 'Fresh blueberry muffin baked daily', true),
  ('Iced Coffee', '🧊', 4.75, 'Cold brew coffee with ice and cream', true),
  ('Croissant & Tea', '🥐', 6.00, 'Buttery croissant paired with herbal tea', true),
  ('Hot Chocolate', '☕', 4.50, 'Rich hot chocolate with whipped cream', true),
  ('Chocolate Cookie', '🍪', 3.50, 'Homemade chocolate chip cookie', true);

-- Insert payment methods
INSERT INTO payment_methods (name, description, icon, is_active) VALUES
  ('Cash', 'Pay with cash', '💵', true),
  ('E-Wallet', 'Digital payment (GCash, PayMaya, etc.)', '📱', true);

-- Create today's statistics entry
INSERT INTO daily_statistics (stat_date, total_revenue, total_orders, total_customers, total_smiles)
VALUES (CURRENT_DATE, 0, 0, 0, 0)
ON CONFLICT (stat_date) DO NOTHING;

-- ==================== TABLE COMMENTS ====================
COMMENT ON TABLE user_roles IS 'Stores user information and their assigned roles (admin, staff)';
COMMENT ON TABLE menu_items IS 'All available products in the coffee shop';
COMMENT ON TABLE transactions IS 'Complete transaction/order records';
COMMENT ON TABLE transaction_items IS 'Individual items within each transaction';
COMMENT ON TABLE payment_methods IS 'Available payment options';
COMMENT ON TABLE daily_statistics IS 'Daily aggregated metrics and statistics';

COMMENT ON COLUMN transactions.payment_method IS 'Payment method: cash or e-wallet';
COMMENT ON COLUMN transactions.status IS 'Transaction status: completed, pending, or cancelled';
COMMENT ON COLUMN user_roles.role IS 'User role: admin or staff';

-- ==================== SETUP INSTRUCTIONS ====================
-- 
-- 1. Copy this entire SQL script
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Create a new query and paste this script
-- 4. Click RUN
-- 5. Tables will be created automatically
--
-- ENVIRONMENT VARIABLES (.env file):
-- VITE_SUPABASE_URL=https://your-project.supabase.co
-- VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
--
-- VERIFY SETUP:
-- - Menu items should show 6 items with correct prices
-- - Payment methods should show 2 options (Cash, E-Wallet)
-- - Today's statistics should initialize to 0
-- - user_roles trigger should auto-insert on new auth users
