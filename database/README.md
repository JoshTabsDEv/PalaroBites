# PalaroBites Database Setup

This directory contains SQL scripts to set up your Supabase database for the PalaroBites delivery platform.

## Files

- `schema.sql` - Main database schema with tables, indexes, triggers, and RLS policies
- `seed.sql` - Sample data to populate your database for testing
- `README.md` - This file with setup instructions

## Setup Instructions

### 1. Run the Schema Script

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Click "Run" to execute the script

This will create:
- `stores` table with all necessary columns and constraints
- `products` table with foreign key relationship to stores
- Indexes for better query performance
- Row Level Security (RLS) policies
- Triggers for automatic `updated_at` timestamps
- A view for products with store information

### 2. Run the Seed Script (Optional)

1. In the SQL Editor, copy and paste the contents of `seed.sql`
2. Click "Run" to populate with sample data

This will add:
- 4 sample stores (Campus Cafe, Pizza Corner, Healthy Bites, Burger Joint)
- 20+ sample products across different categories
- One closed store and one unavailable product for testing

### 3. Verify Setup

You can verify the setup by running these queries in the SQL Editor:

```sql
-- Check stores
SELECT * FROM stores;

-- Check products with store names
SELECT * FROM products_with_stores;

-- Check store counts
SELECT s.name, COUNT(p.id) as product_count 
FROM stores s 
LEFT JOIN products p ON s.id = p.store_id 
GROUP BY s.id, s.name;
```

## Database Schema

### Stores Table
- `id` - UUID primary key
- `name` - Store name (required)
- `description` - Store description
- `image` - Store image URL
- `rating` - Store rating (0-5)
- `delivery_time` - Estimated delivery time
- `location` - Store location
- `phone` - Contact phone number
- `is_open` - Whether store is currently open
- `categories` - Array of store categories
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Products Table
- `id` - UUID primary key
- `name` - Product name (required)
- `description` - Product description
- `price` - Product price (required, >= 0)
- `image` - Product image URL
- `store_id` - Foreign key to stores table
- `category` - Product category
- `is_available` - Whether product is available
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security

- Row Level Security (RLS) is enabled on both tables
- Policies allow all operations for authenticated users
- Foreign key constraints ensure data integrity
- Check constraints validate rating (0-5) and price (>= 0)

## Performance

- Indexes on frequently queried columns
- Foreign key indexes for join performance
- Composite indexes for common query patterns

## Troubleshooting

If you encounter issues:

1. **Permission errors**: Make sure you're running as a superuser or have the necessary permissions
2. **RLS issues**: Check that your user is authenticated and has the correct role
3. **Foreign key errors**: Ensure stores are created before products
4. **Duplicate data**: The seed script uses `ON CONFLICT DO NOTHING` to prevent duplicates

## Next Steps

After running these scripts:
1. Your admin dashboard should be able to load stores and products
2. You can add/edit/delete stores and products through the admin interface
3. The data will persist in your Supabase database
4. You can extend the schema as needed for additional features
