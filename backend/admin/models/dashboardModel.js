const db = require("../../config/database");

const DashboardModel = {

    // =========================================================
    // 1. DASHBOARD SUMMARY
    // =========================================================
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
                      AND status = 'ACTIVE'
                ) AS low_stock_products,

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
                    SELECT COUNT(*)
                    FROM categories
                    WHERE status = 'ACTIVE'
                ) AS active_categories
        `);

        return rows[0];
    },


    // =========================================================
    // 2. MONTHLY REVENUE
    // =========================================================
    async getMonthlyRevenue() {
        const [rows] = await db.query(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE order_status != 'CANCELLED'
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        `);

        return rows;
    },


    // =========================================================
    // 3. YEARLY REVENUE
    // =========================================================
    async getYearlyRevenue() {
        const [rows] = await db.query(`
            SELECT
                YEAR(created_at) AS year,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            WHERE order_status != 'CANCELLED'
            GROUP BY YEAR(created_at)
            ORDER BY year ASC
        `);

        return rows;
    },


    // =========================================================
    // 4. RECENT ORDERS
    // =========================================================
    async getRecentOrders() {
        const [rows] = await db.query(`
            SELECT
                id,
                order_id,
                customer_name,
                customer_phone,
                total_amount,
                order_status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 10
        `);

        return rows;
    },


    // =========================================================
    // 5. RECENT PRODUCTS
    // =========================================================
    async getRecentProducts() {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.name,
                p.price,
                p.stock,
                p.status,
                p.created_at,
                c.name AS category_name
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 10
        `);

        return rows;
    },


    // =========================================================
    // 6. LOW STOCK PRODUCTS
    // =========================================================
    async getLowStockProducts() {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.name,
                p.price,
                p.stock,
                p.status,
                c.name AS category_name
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.stock > 0
              AND p.stock <= 5
              AND p.status = 'ACTIVE'
            ORDER BY p.stock ASC, p.name ASC
        `);

        return rows;
    },


    // =========================================================
    // 7. RECENT ACTIVITY
    // =========================================================
    async getRecentActivity() {
        const [rows] = await db.query(`
            SELECT
                id,
                order_id,
                customer_name,
                total_amount,
                order_status,
                created_at
            FROM orders
            ORDER BY created_at DESC
            LIMIT 10
        `);

        return rows;
    }

};

module.exports = DashboardModel;