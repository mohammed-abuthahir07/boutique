-- Add payment columns for Razorpay Test Mode.
-- Existing Direct Orders keep defaults: payment_method=DIRECT, payment_status=PENDING.
-- Does not rename or drop any existing columns.

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255) NULL;
