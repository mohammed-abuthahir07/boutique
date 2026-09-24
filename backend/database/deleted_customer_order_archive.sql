-- Safe additive migration: archive tables for deleted customer order history.
-- Does not alter or drop existing tables or data.

CREATE TABLE IF NOT EXISTS deleted_customer_orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    original_order_id INT UNSIGNED NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    original_customer_id INT UNSIGNED NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(30) NULL,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(20) NULL,
    payment_status VARCHAR(20) NULL,
    razorpay_order_id VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    razorpay_signature VARCHAR(255) NULL,
    original_created_at TIMESTAMP NULL,
    original_updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_deleted_customer_orders_original_customer (original_customer_id),
    KEY idx_deleted_customer_orders_original_order (original_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS deleted_customer_order_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    deleted_customer_order_id INT UNSIGNED NOT NULL,
    original_order_item_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NULL,
    variant_id INT UNSIGNED NULL,
    variant_color VARCHAR(100) NULL,
    variant_size VARCHAR(50) NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    original_created_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    KEY idx_deleted_order_items_archive_order (deleted_customer_order_id),
    CONSTRAINT fk_deleted_order_items_archive_order
        FOREIGN KEY (deleted_customer_order_id)
        REFERENCES deleted_customer_orders (id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
