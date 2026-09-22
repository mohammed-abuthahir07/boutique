const FavoriteModel = require("../models/favoriteModel");

const FavoriteController = {

    // Add product to favorites
    async addFavorite(req, res) {

        try {

            const customerId = req.customer.id;
            const productId = req.params.productId;

            if (!/^\d+$/.test(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            const product =
                await FavoriteModel.findProduct(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (product.status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "This product is not available"
                });
            }

            const existingFavorite =
                await FavoriteModel.findFavorite(
                    customerId,
                    productId
                );

            if (existingFavorite) {
                return res.status(409).json({
                    success: false,
                    message: "Product is already in favorites"
                });
            }

            const favoriteId =
                await FavoriteModel.addFavorite(
                    customerId,
                    productId
                );

            return res.status(201).json({
                success: true,
                message: "Product added to favorites",
                favorite: {
                    id: favoriteId,
                    product_id: Number(productId)
                }
            });

        } catch (error) {

            console.error(
                "Add favorite error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to add product to favorites",
                error: error.message
            });
        }
    },

    // Get logged-in customer's favorites
    async getFavorites(req, res) {

        try {

            const customerId = req.customer.id;

            const favorites =
                await FavoriteModel.findAllByCustomerId(
                    customerId
                );

            return res.json({
                success: true,
                count: favorites.length,
                favorites
            });

        } catch (error) {

            console.error(
                "Get favorites error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch favorites",
                error: error.message
            });
        }
    },

    // Check whether a product is favorited
    async checkFavorite(req, res) {

        try {

            const customerId = req.customer.id;
            const productId = req.params.productId;

            if (!/^\d+$/.test(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            const favorite =
                await FavoriteModel.findFavorite(
                    customerId,
                    productId
                );

            return res.json({
                success: true,
                product_id: Number(productId),
                is_favorite: !!favorite
            });

        } catch (error) {

            console.error(
                "Check favorite error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to check favorite",
                error: error.message
            });
        }
    },

    // Remove product from favorites
    async removeFavorite(req, res) {

        try {

            const customerId = req.customer.id;
            const productId = req.params.productId;

            if (!/^\d+$/.test(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID"
                });
            }

            const affectedRows =
                await FavoriteModel.deleteFavorite(
                    customerId,
                    productId
                );

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product is not in favorites"
                });
            }

            return res.json({
                success: true,
                message: "Product removed from favorites"
            });

        } catch (error) {

            console.error(
                "Remove favorite error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to remove product from favorites",
                error: error.message
            });
        }
    }

};

module.exports = FavoriteController;