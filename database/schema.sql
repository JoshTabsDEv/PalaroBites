-- PalaroBites Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image TEXT DEFAULT '/logo.png',
    rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    delivery_time TEXT,
    location TEXT,
    phone TEXT,
    is_open BOOLEAN DEFAULT true,
    categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    image TEXT DEFAULT '/logo.png',
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    special_instructions TEXT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'card', 'gcash')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    store_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_is_open ON stores(is_open);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store_id ON order_items(store_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON stores
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON orders
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON order_items
    FOR ALL USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');

-- Insert sample data (optional - remove if you don't want sample data)
INSERT INTO stores (name, description, delivery_time, location, phone, categories) VALUES
('Campus Cafe', 'Fresh coffee, sandwiches, and pastries for your study sessions', '15-20 min', 'Main Campus Building', '(555) 123-4567', ARRAY['Coffee', 'Sandwiches', 'Pastries']),
('Pizza Corner', 'Hot, fresh pizza delivered to your dorm or classroom', '20-25 min', 'Student Center', '(555) 234-5678', ARRAY['Pizza', 'Italian', 'Fast Food']),
('Healthy Bites', 'Nutritious salads, wraps, and smoothies for health-conscious students', '10-15 min', 'Library Building', '(555) 345-6789', ARRAY['Healthy', 'Salads', 'Smoothies']),
('Burger Joint', 'Classic burgers, fries, and milkshakes - comfort food at its finest', '18-22 min', 'Sports Complex', '(555) 456-7890', ARRAY['Burgers', 'American', 'Comfort Food']);

-- Insert sample products (optional - remove if you don't want sample data)
INSERT INTO products (name, description, price, store_id, category) VALUES
('Cappuccino', 'Rich and creamy cappuccino with perfect foam', 3.50, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Coffee'),
('Chicken Sandwich', 'Grilled chicken with lettuce, tomato, and mayo', 6.99, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Sandwiches'),
('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Pizza'),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', 8.50, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Salads'),
('Classic Burger', 'Beef patty with lettuce, tomato, onion, and special sauce', 9.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Burgers');

-- Create a view for products with store information
CREATE OR REPLACE VIEW products_with_stores AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image,
    p.store_id,
    s.name as store_name,
    p.category,
    p.is_available,
    p.created_at,
    p.updated_at
FROM products p
JOIN stores s ON p.store_id = s.id;

-- Grant permissions
GRANT ALL ON stores TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT SELECT ON products_with_stores TO authenticated;
