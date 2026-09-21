const jwt = require("jsonwebtoken");

const customerAuthMiddleware = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });

        }


        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });

        }


        const token = authHeader.split(" ")[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Make sure this token belongs to a customer
        if (decoded.role !== "CUSTOMER") {

            return res.status(403).json({
                success: false,
                message: "Customer access required"
            });

        }


        // Store customer information in request
        req.customer = decoded;


        next();


    } catch (error) {

        console.error("Customer auth error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }

};

module.exports = customerAuthMiddleware;