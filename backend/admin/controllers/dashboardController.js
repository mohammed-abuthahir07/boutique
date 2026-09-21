const DashboardModel = require("../models/dashboardModel");

const dashboardController = {

    // =========================================================
    // 1. DASHBOARD SUMMARY
    // =========================================================
    async getSummary(req, res) {
        try {

            const summary =
                await DashboardModel.getSummary();

            return res.status(200).json({
                success: true,
                summary
            });

        } catch (error) {

            console.error(
                "Get dashboard summary error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 2. MONTHLY REVENUE
    // =========================================================
    async getMonthlyRevenue(req, res) {
        try {

            const revenue =
                await DashboardModel.getMonthlyRevenue();

            return res.status(200).json({
                success: true,
                monthly_revenue: revenue
            });

        } catch (error) {

            console.error(
                "Get dashboard monthly revenue error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 3. YEARLY REVENUE
    // =========================================================
    async getYearlyRevenue(req, res) {
        try {

            const revenue =
                await DashboardModel.getYearlyRevenue();

            return res.status(200).json({
                success: true,
                yearly_revenue: revenue
            });

        } catch (error) {

            console.error(
                "Get dashboard yearly revenue error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 4. RECENT ORDERS
    // =========================================================
    async getRecentOrders(req, res) {
        try {

            const orders =
                await DashboardModel.getRecentOrders();

            return res.status(200).json({
                success: true,
                recent_orders: orders
            });

        } catch (error) {

            console.error(
                "Get dashboard recent orders error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 5. RECENT PRODUCTS
    // =========================================================
    async getRecentProducts(req, res) {
        try {

            const products =
                await DashboardModel.getRecentProducts();

            return res.status(200).json({
                success: true,
                recent_products: products
            });

        } catch (error) {

            console.error(
                "Get dashboard recent products error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 6. LOW STOCK PRODUCTS
    // =========================================================
    async getLowStock(req, res) {
        try {

            const products =
                await DashboardModel.getLowStockProducts();

            return res.status(200).json({
                success: true,
                low_stock_products: products
            });

        } catch (error) {

            console.error(
                "Get dashboard low stock error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // =========================================================
    // 7. RECENT ACTIVITY
    // =========================================================
    async getRecentActivity(req, res) {
        try {

            const activity =
                await DashboardModel.getRecentActivity();

            return res.status(200).json({
                success: true,
                recent_activity: activity
            });

        } catch (error) {

            console.error(
                "Get dashboard recent activity error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

};

module.exports = dashboardController;