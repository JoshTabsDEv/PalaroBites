-- Performance Optimization for PalaroBites Database
-- Run these queries in your Supabase SQL Editor

-- 1. Add missing indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
-- Admin pages frequently filter and update by id and name
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);

-- 2. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_stores_open_name ON stores(is_open, name) WHERE is_open = true;
CREATE INDEX IF NOT EXISTS idx_products_available_category ON products(is_available, category) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_products_store_available ON products(store_id, is_available) WHERE is_available = true;
-- Admin lists sort by name quite often
CREATE INDEX IF NOT EXISTS idx_stores_is_open_name ON stores(is_open, name);

-- 3. Optimize the products_with_stores view with better indexing
CREATE INDEX IF NOT EXISTS idx_products_store_id_name ON products(store_id, name);
CREATE INDEX IF NOT EXISTS idx_stores_id_name ON stores(id, name);

-- 4. Add partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(id, name, description, image, rating, delivery_time, location, phone, categories) 
WHERE is_open = true;

CREATE INDEX IF NOT EXISTS idx_products_active ON products(id, name, description, price, image, store_id, category) 
WHERE is_available = true;

-- 4b. Targeted indexes for admin operations (edit/delete/update by id)
CREATE INDEX IF NOT EXISTS idx_stores_is_open ON stores(is_open);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);

-- 5. Optimize order queries
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id, product_name, quantity);

-- 6. Add database-level caching hints
-- Enable query plan caching
SET shared_preload_libraries = 'pg_stat_statements';
SET track_activity_query_size = 2048;

-- 7. Create materialized view for frequently accessed data
CREATE MATERIALIZED VIEW IF NOT EXISTS active_stores_summary AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.image,
    s.rating,
    s.delivery_time,
    s.location,
    s.phone,
    s.categories,
    COUNT(p.id) as product_count
FROM stores s
LEFT JOIN products p ON s.id = p.store_id AND p.is_available = true
WHERE s.is_open = true
GROUP BY s.id, s.name, s.description, s.image, s.rating, s.delivery_time, s.location, s.phone, s.categories;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_active_stores_summary_name ON active_stores_summary(name);

-- 8. Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_active_stores_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY active_stores_summary;
END;
$$ LANGUAGE plpgsql;

-- 9. Set up automatic refresh (run this as a cron job or trigger)
-- You can set up a cron job to run this every 5 minutes:
-- SELECT cron.schedule('refresh-stores-summary', '*/5 * * * *', 'SELECT refresh_active_stores_summary();');

-- 10. Add query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Grant permissions for the materialized view
GRANT SELECT ON active_stores_summary TO authenticated;
