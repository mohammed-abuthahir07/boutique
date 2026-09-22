const ProductModel = require("../models/productModel");

const ProductController = {

    // =====================================================
    // GET ALL PUBLIC PRODUCTS
    // =====================================================
    // This API is only for the product listing page.
    // It returns BASIC product information only.
    //
    // It does NOT return:
    // - variants
    // - sizes
    // - variant stock
    // - color images
    // =====================================================

    async getAll(req, res) {
        try {

            const products =
                await ProductModel.findAll();

            return res.json({
                success: true,
                count: products.length,
                products
            });

        } catch (error) {

            console.error(
                "Public product listing error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error: error.message
            });
        }
    },


    // =====================================================
    // GET SINGLE PUBLIC PRODUCT
    // =====================================================
    // This API is used when the customer clicks a product.
    //
    // It returns:
    // - Basic product information
    // - Variants
    // - Color
    // - Size
    // - Variant stock
    // - Color images
    // =====================================================

    async getById(req, res) {
        try {

            const productId =
                req.params.id;


            // Validate product ID
            if (!/^\d+$/.test(productId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });

            }


            const product =
                await ProductModel.findById(
                    productId
                );


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });

            }


            return res.json({
                success: true,
                product
            });

        } catch (error) {

            console.error(
                "Public product details error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch product details",
                error: error.message
            });
        }
    }

};


module.exports = ProductController;