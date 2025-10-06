-- PalaroBites Sample Data
-- Run this script after schema.sql to populate with sample data

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM products;
-- DELETE FROM stores;

-- Insert sample stores
INSERT INTO stores (name, description, delivery_time, location, phone, categories, rating) VALUES
('Campus Cafe', 'Fresh coffee, sandwiches, and pastries for your study sessions', '15-20 min', 'Main Campus Building', '(555) 123-4567', ARRAY['Coffee', 'Sandwiches', 'Pastries'], 4.5),
('Pizza Corner', 'Hot, fresh pizza delivered to your dorm or classroom', '20-25 min', 'Student Center', '(555) 234-5678', ARRAY['Pizza', 'Italian', 'Fast Food'], 4.2),
('Healthy Bites', 'Nutritious salads, wraps, and smoothies for health-conscious students', '10-15 min', 'Library Building', '(555) 345-6789', ARRAY['Healthy', 'Salads', 'Smoothies'], 4.7),
('Burger Joint', 'Classic burgers, fries, and milkshakes - comfort food at its finest', '18-22 min', 'Sports Complex', '(555) 456-7890', ARRAY['Burgers', 'American', 'Comfort Food'], 4.3)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products for Campus Cafe
INSERT INTO products (name, description, price, store_id, category) VALUES
('Cappuccino', 'Rich and creamy cappuccino with perfect foam', 3.50, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Coffee'),
('Latte', 'Smooth espresso with steamed milk', 4.00, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Coffee'),
('Chicken Sandwich', 'Grilled chicken with lettuce, tomato, and mayo', 6.99, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Sandwiches'),
('Turkey Club', 'Sliced turkey with bacon, lettuce, and tomato', 7.50, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Sandwiches'),
('Chocolate Croissant', 'Buttery croissant filled with rich chocolate', 3.25, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Pastries'),
('Blueberry Muffin', 'Fresh baked muffin with juicy blueberries', 2.75, (SELECT id FROM stores WHERE name = 'Campus Cafe'), 'Pastries')
ON CONFLICT DO NOTHING;

-- Insert sample products for Pizza Corner
INSERT INTO products (name, description, price, store_id, category) VALUES
('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Pizza'),
('Pepperoni Pizza', 'Traditional pizza topped with spicy pepperoni', 14.99, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Pizza'),
('Supreme Pizza', 'Loaded with pepperoni, sausage, peppers, and onions', 16.99, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Pizza'),
('Garlic Bread', 'Crispy bread brushed with garlic butter', 4.50, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Italian'),
('Caesar Salad', 'Fresh romaine with caesar dressing and croutons', 6.99, (SELECT id FROM stores WHERE name = 'Pizza Corner'), 'Italian')
ON CONFLICT DO NOTHING;

-- Insert sample products for Healthy Bites
INSERT INTO products (name, description, price, store_id, category) VALUES
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', 8.50, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Salads'),
('Greek Salad', 'Mixed greens with feta, olives, and balsamic vinaigrette', 9.25, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Salads'),
('Chicken Wrap', 'Grilled chicken with vegetables in a whole wheat tortilla', 7.99, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Healthy'),
('Veggie Bowl', 'Quinoa bowl with roasted vegetables and tahini dressing', 8.75, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Healthy'),
('Green Smoothie', 'Spinach, banana, and mango smoothie', 5.50, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Smoothies'),
('Berry Blast', 'Mixed berries with yogurt and honey', 5.99, (SELECT id FROM stores WHERE name = 'Healthy Bites'), 'Smoothies')
ON CONFLICT DO NOTHING;

-- Insert sample products for Burger Joint
INSERT INTO products (name, description, price, store_id, category) VALUES
('Classic Burger', 'Beef patty with lettuce, tomato, onion, and special sauce', 9.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Burgers'),
('Cheeseburger', 'Classic burger with melted American cheese', 10.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Burgers'),
('Bacon Burger', 'Beef patty with crispy bacon and cheddar cheese', 12.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Burgers'),
('French Fries', 'Crispy golden fries with sea salt', 3.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'American'),
('Onion Rings', 'Beer-battered onion rings', 4.50, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'American'),
('Chocolate Milkshake', 'Rich and creamy chocolate milkshake', 4.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Comfort Food'),
('Vanilla Milkshake', 'Classic vanilla milkshake', 4.99, (SELECT id FROM stores WHERE name = 'Burger Joint'), 'Comfort Food')
ON CONFLICT DO NOTHING;

-- Update one store to be closed for testing
UPDATE stores SET is_open = false WHERE name = 'Burger Joint';

-- Update one product to be unavailable for testing
UPDATE products SET is_available = false WHERE name = 'Classic Burger';
