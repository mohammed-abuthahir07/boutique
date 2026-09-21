const AnalyticsModel = require("../models/analyticsModel");

const analyticsController = {

    // ==========================================
    // SUMMARY
    // ==========================================

    async getSummary(req, res) {

        try {

            const summary =
                await AnalyticsModel.getSummary();

            return res.status(200).json({
                success: true,
                summary
            });

        } catch (error) {

            console.error("Get analytics summary error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // ==========================================
    // ORDER STATUS
    // ==========================================

    async getOrderStatus(req, res) {

        try {

            const orderStatus =
                await AnalyticsModel.getOrderStatusDistribution();

            return res.status(200).json({
                success: true,
                order_status: orderStatus
            });

        } catch (error) {

            console.error(
                "Get order status analytics error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // ==========================================
    // BEST SELLING PRODUCTS
    // ==========================================

    async getBestSellingProducts(req, res) {

        try {

            const products =
                await AnalyticsModel.getBestSellingProducts();

            return res.status(200).json({
                success: true,
                best_selling_products: products
            });

        } catch (error) {

            console.error(
                "Get best selling products error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // ==========================================
    // MONTHLY ORDERS
    // ==========================================

    async getMonthlyOrders(req, res) {

        try {

            const orders =
                await AnalyticsModel.getMonthlyOrders();

            return res.status(200).json({
                success: true,
                monthly_orders: orders
            });

        } catch (error) {

            console.error(
                "Get monthly orders error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // ==========================================
    // MONTHLY REVENUE
    // ==========================================

    async getMonthlyRevenue(req, res) {

        try {

            const revenue =
                await AnalyticsModel.getMonthlyRevenue();

            return res.status(200).json({
                success: true,
                monthly_revenue: revenue
            });

        } catch (error) {

            console.error(
                "Get monthly revenue error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // ==========================================
    // CATEGORY SALES
    // ==========================================

    async getCategorySales(req, res) {

        try {

            const categorySales =
                await AnalyticsModel.getCategorySales();

            return res.status(200).json({
                success: true,
                category_sales: categorySales
            });

        } catch (error) {

            console.error(
                "Get category sales error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

};

module.exports = analyticsController;