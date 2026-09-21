const db = require("../../config/database");

const AnalyticsModel = {

    // ==========================================
    // SUMMARY
    // ==========================================

    async getSummary() {

        const [rows] = await db.query(`
            SELECT

                (
                    SELECT COUNT(*)
                    FROM orders
                ) AS total_orders,

                (
                    SELECT COALESCE(SUM(total_amount), 0)
                    FROM orders
                    WHERE order_status != 'CANCELLED'
                ) AS total_revenue,

                (
                    SELECT COUNT(*)
                    FROM orders
                    WHERE order_status = 'PENDING'
                ) AS pending_orders,

                (
                    SELECT COUNT(*)
                    FROM orders
                    WHERE order_status = 'DELIVERED'
                ) AS completed_orders,

                (
                    SELECT COALESCE(SUM(oi.quantity), 0)
                    FROM order_items oi
                    INNER JOIN orders o
                        ON oi.order_id = o.id
                    WHERE o.order_status != 'CANCELLED'
                ) AS products_sold,

                (
                    SELECT COUNT(*)
                    FROM products
                    WHERE status = 'ACTIVE'
                ) AS active_products,

                (
                    SELECT COUNT(*)
                    FROM products
                    WHERE stock = 0
                ) AS out_of_stock_products,

                (
                    SELECT COUNT(*)
                    FROM products
                    WHERE stock > 0
                      AND stock <= 5
                ) AS low_stock_products
        `);

        return rows[0];
    },


    // ==========================================
    // ORDER STATUS
    // ==========================================

    async getOrderStatusDistribution() {

        const [rows] = await db.query(`
            SELECT
                order_status,
                COUNT(*) AS order_count
            FROM orders
            GROUP BY order_status
            ORDER BY order_count DESC
        `);

        return rows;
    },


    // ==========================================
    // BEST SELLING PRODUCTS
    // ==========================================

    async getBestSellingProducts() {

        const [rows] = await db.query(`
            SELECT
                oi.product_id,
                oi.product_name,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_sales

            FROM order_items oi

            INNER JOIN orders o
                ON oi.order_id = o.id

            WHERE o.order_status != 'CANCELLED'

            GROUP BY
                oi.product_id,
                oi.product_name

            ORDER BY total_quantity DESC

            LIMIT 10
        `);

        return rows;
    },


    // ==========================================
    // MONTHLY ORDERS
    // ==========================================

    async getMonthlyOrders() {

        const [rows] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS order_count

            FROM orders

            WHERE order_status != 'CANCELLED'

            GROUP BY
                DATE_FORMAT(created_at, '%Y-%m')

            ORDER BY month ASC
        `);

        return rows;
    },


    // ==========================================
    // MONTHLY REVENUE
    // ==========================================

    async getMonthlyRevenue() {

        const [rows] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COALESCE(SUM(total_amount), 0) AS revenue

            FROM orders

            WHERE order_status != 'CANCELLED'

            GROUP BY
                DATE_FORMAT(created_at, '%Y-%m')

            ORDER BY month ASC
        `);

        return rows;
    },


    // ==========================================
    // CATEGORY SALES
    // ==========================================

    async getCategorySales() {

        const [rows] = await db.query(`
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                SUM(oi.quantity) AS products_sold,
                SUM(oi.subtotal) AS total_sales

            FROM categories c

            INNER JOIN products p
                ON p.category_id = c.id

            INNER JOIN order_items oi
                ON oi.product_id = p.id

            INNER JOIN orders o
                ON oi.order_id = o.id

            WHERE o.order_status != 'CANCELLED'

            GROUP BY
                c.id,
                c.name

            ORDER BY total_sales DESC
        `);

        return rows;
    }

};

module.exports = AnalyticsModel;