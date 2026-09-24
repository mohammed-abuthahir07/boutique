const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/database");
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require("./admin/routes/authRoutes");
const categoryRoutes = require("./admin/routes/categoryRoutes");
const productRoutes = require("./admin/routes/productRoutes");
const offerRoutes = require("./admin/routes/offerRoutes");
const orderRoutes = require("./admin/routes/orderRoutes");
const analyticsRoutes = require("./admin/routes/analyticsRoutes");
const dashboardRoutes = require("./admin/routes/dashboardRoutes");
const inventoryRoutes = require("./admin/routes/inventoryRoutes");
const customerRoutes = require("./admin/routes/customerRoutes");
const deletedCustomerRoutes = require("./admin/routes/deletedCustomerRoutes");
const customerAuthRoutes = require("./customer/routes/customerauthRoutes");
const publicProductRoutes = require("./public/routes/productRoutes");
const publicOfferRoutes = require("./public/routes/offerRoutes");
const publicCategoryRoutes = require("./public/routes/categoryRoutes");
const customerProfileRoutes = require("./customer/routes/profileRoutes");
const customerFavoriteRoutes = require("./customer/routes/favoriteRoutes");
const customerCartRoutes = require("./customer/routes/cartRoutes");
const customerOrderRoutes = require("./customer/routes/orderRoutes");
const customerPaymentRoutes = require("./customer/routes/paymentRoutes");
const customerAccountRoutes = require("./customer/routes/accountRoutes");


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static("uploads"));

// admin side
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/offers", offerRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/deleted-customers", deletedCustomerRoutes);
app.use("/api/customer/auth", customerAuthRoutes);

// Public Side
app.use( "/api/public/products", publicProductRoutes);
app.use("/api/public/offers", publicOfferRoutes);
app.use("/api/public/categories", publicCategoryRoutes);

// Customer side
app.use("/api/customer/profile", customerProfileRoutes);
app.use("/api/customer/favorites", customerFavoriteRoutes);
app.use("/api/customer/cart", customerCartRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/payment", customerPaymentRoutes);
app.use("/api/customer/account", customerAccountRoutes);





app.listen(PORT, () => {
    console.log("========================================");
    console.log(" Boutique Backend Server");
    console.log("========================================");
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
    console.log("========================================");
});