const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const CustomerAuthModel = require("../models/customerauthModel");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

const CustomerAuthController = {

    // ==========================================
    // CUSTOMER REGISTER
    // ==========================================
    async register(req, res) {
        try {
            const {
                name,
                email,
                phone,
                password
            } = req.body;

            if (!name || !email || !phone || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Name, email, phone and password are required"
                });
            }

            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();
            const cleanPhone = phone.trim();

            if (cleanName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters"
                });
            }

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters"
                });
            }

            const existingCustomer =
                await CustomerAuthModel.findByEmail(cleanEmail);

            if (existingCustomer) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists"
                });
            }

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const customerId =
                await CustomerAuthModel.create({
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    password: hashedPassword,
                    google_id: null
                });

            const customer =
                await CustomerAuthModel.findById(customerId);

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

            console.error(
                "Customer register error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Customer registration failed",
                error: error.message
            });
        }
    },


    // ==========================================
    // CUSTOMER LOGIN
    // ==========================================
    async login(req, res) {
        try {
            const {
                email,
                password
            } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required"
                });
            }

            const cleanEmail =
                email.trim().toLowerCase();

            const customer =
                await CustomerAuthModel.findByEmail(
                    cleanEmail
                );

            if (!customer) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            if (customer.status !== "ACTIVE") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is inactive"
                });
            }

            // Google-only accounts don't have
            // a normal password.
            if (!customer.password) {
                return res.status(401).json({
                    success: false,
                    message: "This account uses Google login. Please continue with Google."
                });
            }

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

            console.error(
                "Customer login error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Customer login failed",
                error: error.message
            });
        }
    },


    // ==========================================
    // GOOGLE LOGIN
    // ==========================================
    async googleLogin(req, res) {
        try {

            const {
                credential
            } = req.body;

            if (!credential) {
                return res.status(400).json({
                    success: false,
                    message: "Google credential is required"
                });
            }

            // ------------------------------------------
            // VERIFY GOOGLE ID TOKEN
            // ------------------------------------------

            const ticket =
                await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });

            const payload =
                ticket.getPayload();

            if (!payload) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Google credential"
                });
            }

            const googleId =
                payload.sub;

            const googleEmail =
                payload.email;

            const emailVerified =
                payload.email_verified;

            const googleName =
                payload.name || "Google Customer";

            if (!googleId || !googleEmail) {
                return res.status(401).json({
                    success: false,
                    message: "Google account information is missing"
                });
            }

            if (!emailVerified) {
                return res.status(401).json({
                    success: false,
                    message: "Google email is not verified"
                });
            }

            const cleanEmail =
                googleEmail.trim().toLowerCase();


            // ------------------------------------------
            // STEP 1:
            // FIND CUSTOMER USING GOOGLE ID
            // ------------------------------------------

            let customer =
                await CustomerAuthModel.findByGoogleId(
                    googleId
                );

            if (customer) {

                if (customer.status !== "ACTIVE") {
                    return res.status(403).json({
                        success: false,
                        message: "Your account is inactive"
                    });
                }

            } else {

                // ------------------------------------------
                // STEP 2:
                // GOOGLE ID NOT FOUND
                // CHECK EMAIL
                // ------------------------------------------

                customer =
                    await CustomerAuthModel.findByEmail(
                        cleanEmail
                    );

                if (customer) {

                    if (customer.status !== "ACTIVE") {
                        return res.status(403).json({
                            success: false,
                            message: "Your account is inactive"
                        });
                    }

                    // Existing normal customer.
                    // Connect Google account to it.
                    if (
                        customer.google_id &&
                        customer.google_id !== googleId
                    ) {
                        return res.status(409).json({
                            success: false,
                            message: "This email is already linked to another Google account"
                        });
                    }

                    if (!customer.google_id) {

                        await CustomerAuthModel.updateGoogleId(
                            customer.id,
                            googleId
                        );

                        customer.google_id =
                            googleId;
                    }

                } else {

                    // ------------------------------------------
                    // STEP 3:
                    // NO CUSTOMER WITH THIS EMAIL
                    // CREATE NEW CUSTOMER
                    // ------------------------------------------

                    const customerId =
                        await CustomerAuthModel.create({
                            name: googleName,
                            email: cleanEmail,

                            // Google users can provide
                            // phone later during profile/
                            // checkout.
                            phone: null,

                            // Google account doesn't use
                            // normal password login.
                            password: null,

                            google_id: googleId
                        });

                    customer =
                        await CustomerAuthModel.findById(
                            customerId
                        );
                }
            }


            // ------------------------------------------
            // CREATE OUR BOUTIQUE JWT
            // ------------------------------------------

            const token =
                jwt.sign(
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


            // ------------------------------------------
            // RESPONSE
            // ------------------------------------------

            return res.json({
                success: true,
                message: "Google login successful",
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

            console.error(
                "Google login error:",
                error
            );

            return res.status(401).json({
                success: false,
                message: "Google authentication failed",
                error: error.message
            });
        }
    },


    // ==========================================
    // CUSTOMER PROFILE
    // ==========================================
    async profile(req, res) {
        try {

            const customerId =
                req.customer.id;

            const customer =
                await CustomerAuthModel.findById(
                    customerId
                );

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

            console.error(
                "Customer profile error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer profile",
                error: error.message
            });
        }
    }

};

module.exports = CustomerAuthController;