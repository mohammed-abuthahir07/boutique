const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CustomerAuthModel = require("../models/customerauthModel");


const CustomerAuthController = {

    // =====================================================
    // CUSTOMER REGISTER
    // =====================================================
    async register(req, res) {

        try {

            const {
                name,
                email,
                phone,
                password
            } = req.body;


            // Required fields
            if (!name || !email || !phone || !password) {

                return res.status(400).json({
                    success: false,
                    message: "Name, email, phone and password are required"
                });

            }


            // Clean input
            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();
            const cleanPhone = phone.trim();


            // Validate name
            if (cleanName.length < 2) {

                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters"
                });

            }


            // Validate email
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });

            }


            // Validate password
            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters"
                });

            }


            // Check existing customer
            const existingCustomer =
                await CustomerAuthModel.findByEmail(cleanEmail);


            if (existingCustomer) {

                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists"
                });

            }


            // Hash password
            const hashedPassword =
                await bcrypt.hash(password, 10);


            // Create customer
            const customerId =
                await CustomerAuthModel.create({
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    password: hashedPassword
                });


            // Get created customer
            const customer =
                await CustomerAuthModel.findById(customerId);


            // Create JWT
            const token = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    role: "CUSTOMER"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


            return res.status(201).json({
                success: true,
                message: "Customer registered successfully",
                token,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    status: customer.status
                }
            });


        } catch (error) {

            console.error("Customer register error:", error);

            return res.status(500).json({
                success: false,
                message: "Customer registration failed",
                error: error.message
            });

        }

    },


    // =====================================================
    // CUSTOMER LOGIN
    // =====================================================
    async login(req, res) {

        try {

            const {
                email,
                password
            } = req.body;


            // Required fields
            if (!email || !password) {

                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });

            }


            // Clean email
            const cleanEmail =
                email.trim().toLowerCase();


            // Find customer
            const customer =
                await CustomerAuthModel.findByEmail(cleanEmail);


            if (!customer) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }


            // Check account status
            if (customer.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message: "Your account is inactive"
                });

            }


            // Check password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    customer.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }


            // Create JWT
            const token = jwt.sign(
                {
                    id: customer.id,
                    email: customer.email,
                    role: "CUSTOMER"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );


            return res.json({
                success: true,
                message: "Customer login successful",
                token,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    status: customer.status
                }
            });


        } catch (error) {

            console.error("Customer login error:", error);

            return res.status(500).json({
                success: false,
                message: "Customer login failed",
                error: error.message
            });

        }

    },


    // =====================================================
    // CUSTOMER PROFILE
    // =====================================================
    async profile(req, res) {

        try {

            // Customer ID comes from JWT middleware
            const customerId = req.customer.id;


            const customer =
                await CustomerAuthModel.findById(customerId);


            if (!customer) {

                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });

            }


            return res.json({
                success: true,
                customer
            });


        } catch (error) {

            console.error("Customer profile error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer profile",
                error: error.message
            });

        }

    }

};


module.exports = CustomerAuthController;