const ProductModel = require("../models/productModel");

const ProductController = {

    async getAll(req, res) {
        try {

            const products = await ProductModel.findAll();

            const productsWithVariants = await Promise.all(
                products.map(async (product) => {

                    const variants =
                        await ProductModel.findVariantsByProductId(
                            product.id
                        );

                    return {
                        ...product,
                        variants
                    };
                })
            );

            return res.json({
                success: true,
                count: productsWithVariants.length,
                products: productsWithVariants
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

    async getById(req, res) {
        try {

            const productId = req.params.id;

            if (!/^\d+$/.test(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            const product =
                await ProductModel.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const variants =
                await ProductModel.findVariantsByProductId(
                    product.id
                );

            return res.json({
                success: true,
                product: {
                    ...product,
                    variants
                }
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