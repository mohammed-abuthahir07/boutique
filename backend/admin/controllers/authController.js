const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AdminModel = require("../models/adminModel");

const authController = {

    // =========================================================
    // ADMIN LOGIN
    // =========================================================
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const admin = await AdminModel.findByEmail(email);

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            if (admin.status !== "ACTIVE") {
                return res.status(403).json({
                    success: false,
                    message: "Admin account is inactive"
                });
            }

            const passwordMatch = await bcrypt.compare(
                password,
                admin.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                {
                    id: admin.id,
                    email: admin.email,
                    role: admin.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            await AdminModel.updateLastLogin(admin.id);

            return res.status(200).json({
                success: true,
                message: "Admin login successful",
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    status: admin.status
                }
            });

        } catch (error) {
            console.error("Admin login error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    // =========================================================
    // GET LOGGED-IN ADMIN PROFILE
    // =========================================================
    async profile(req, res) {
        try {
            const admin = await AdminModel.findById(req.admin.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Admin not found"
                });
            }

            return res.status(200).json({
                success: true,
                admin
            });

        } catch (error) {
            console.error("Admin profile error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
};

module.exports = authController;