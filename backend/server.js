const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/database");
const app = express();
const PORT = process.env.PORT || 5000;
const authRoutes = require("./admin/routes/authRoutes");
const categoryRoutes = require("./admin/routes/categoryRoutes");



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/uploads", express.static("uploads"));

// admin side
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/categories", categoryRoutes);




app.listen(PORT, () => {
    console.log("========================================");
    console.log(" Boutique Backend Server");
    console.log("========================================");
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`API base URL: http://localhost:${PORT}/api`);
    console.log("========================================");
});