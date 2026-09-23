-- Boutique Ecommerce
-- Reusable test-data reset
--
-- Inspected from boutique_db:
--   SHOW TABLES
--   information_schema.KEY_COLUMN_USAGE
--
-- PRESERVE:
--   admins  (do not DELETE, TRUNCATE, or UPDATE this table)
--
-- CLEAR (actual tables):
--   customer_cart_items
--   order_items
--   customer_favorites
--   new_arrivals
--   customer_carts
--   orders
--   product_color_images
--   product_variants
--   products
--   offers
--   customers
--   categories
--
-- Foreign keys require child rows to be removed before parents.
-- TRUNCATE is used so AUTO_INCREMENT values reset for a clean test state.
-- FOREIGN_KEY_CHECKS is saved, temporarily disabled only for TRUNCATE,
-- then restored to the original session value.

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

-- Child / dependent tables first
TRUNCATE TABLE customer_cart_items;
TRUNCATE TABLE order_items;
TRUNCATE TABLE customer_favorites;
TRUNCATE TABLE new_arrivals;
TRUNCATE TABLE customer_carts;
TRUNCATE TABLE orders;
TRUNCATE TABLE product_color_images;
TRUNCATE TABLE product_variants;

-- Parent catalog / customer tables
TRUNCATE TABLE products;
TRUNCATE TABLE offers;
TRUNCATE TABLE customers;
TRUNCATE TABLE categories;

-- admins is intentionally not truncated or deleted.

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
