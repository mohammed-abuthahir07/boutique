const OfferModel = require("../models/offerModel");

const OfferController = {

    async getAll(req, res) {
        try {

            const offers =
                await OfferModel.findActiveOffers();

            return res.json({
                success: true,
                count: offers.length,
                offers
            });

        } catch (error) {

            console.error(
                "Public offer listing error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch offers",
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {

            const offerId = req.params.id;

            if (!/^\d+$/.test(offerId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid offer ID"
                });
            }

            const offer =
                await OfferModel.findActiveOfferById(
                    offerId
                );

            if (!offer) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found"
                });
            }

            return res.json({
                success: true,
                offer
            });

        } catch (error) {

            console.error(
                "Public offer details error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch offer",
                error: error.message
            });
        }
    }

};

module.exports = OfferController;