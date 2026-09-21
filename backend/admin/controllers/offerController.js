const OfferModel = require("../models/offerModel");

const offerController = {

    // GET ALL OFFERS
    async getAll(req, res) {
        try {
            const offers = await OfferModel.findAll();

            return res.status(200).json({
                success: true,
                offers
            });

        } catch (error) {
            console.error("Get offers error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // GET SINGLE OFFER
    async getById(req, res) {
        try {
            const { id } = req.params;

            const offer = await OfferModel.findById(id);

            if (!offer) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found"
                });
            }

            return res.status(200).json({
                success: true,
                offer
            });

        } catch (error) {
            console.error("Get offer error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // CREATE OFFER
    async create(req, res) {
        try {
            const {
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date
            } = req.body;

            // Required fields
            if (
                !title ||
                !discount_type ||
                discount_value === undefined ||
                !start_date ||
                !end_date
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Title, discount type, discount value, start date and end date are required"
                });
            }

            // Discount type validation
            if (
                discount_type !== "PERCENTAGE" &&
                discount_type !== "FIXED"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Discount type must be PERCENTAGE or FIXED"
                });
            }

            // Discount value validation
            const discountValue = Number(discount_value);

            if (
                !Number.isFinite(discountValue) ||
                discountValue < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Discount value must be a valid non-negative number"
                });
            }

            // Percentage cannot exceed 100
            if (
                discount_type === "PERCENTAGE" &&
                discountValue > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Percentage discount cannot exceed 100"
                });
            }

            // Date validation
            if (new Date(start_date) > new Date(end_date)) {
                return res.status(400).json({
                    success: false,
                    message: "Start date cannot be after end date"
                });
            }

            const offerId = await OfferModel.create({
                title: title.trim(),
                description: description
                    ? description.trim()
                    : null,
                image: image
                    ? image.trim()
                    : null,
                discount_type,
                discount_value: discountValue,
                start_date,
                end_date
            });

            return res.status(201).json({
                success: true,
                message: "Offer created successfully",
                offer_id: offerId
            });

        } catch (error) {
            console.error("Create offer error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // UPDATE OFFER
    async update(req, res) {
        try {
            const { id } = req.params;

            const existingOffer = await OfferModel.findById(id);

            if (!existingOffer) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found"
                });
            }

            const {
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date,
                status
            } = req.body;

            if (
                !title ||
                !discount_type ||
                discount_value === undefined ||
                !start_date ||
                !end_date ||
                !status
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Title, discount type, discount value, start date, end date and status are required"
                });
            }

            if (
                discount_type !== "PERCENTAGE" &&
                discount_type !== "FIXED"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Discount type must be PERCENTAGE or FIXED"
                });
            }

            if (
                status !== "ACTIVE" &&
                status !== "INACTIVE"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Status must be ACTIVE or INACTIVE"
                });
            }

            const discountValue = Number(discount_value);

            if (
                !Number.isFinite(discountValue) ||
                discountValue < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Discount value must be a valid non-negative number"
                });
            }

            if (
                discount_type === "PERCENTAGE" &&
                discountValue > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Percentage discount cannot exceed 100"
                });
            }

            if (new Date(start_date) > new Date(end_date)) {
                return res.status(400).json({
                    success: false,
                    message: "Start date cannot be after end date"
                });
            }

            await OfferModel.update(id, {
                title: title.trim(),
                description: description
                    ? description.trim()
                    : null,
                image: image
                    ? image.trim()
                    : null,
                discount_type,
                discount_value: discountValue,
                start_date,
                end_date,
                status
            });

            return res.status(200).json({
                success: true,
                message: "Offer updated successfully"
            });

        } catch (error) {
            console.error("Update offer error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // DELETE OFFER
    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingOffer = await OfferModel.findById(id);

            if (!existingOffer) {
                return res.status(404).json({
                    success: false,
                    message: "Offer not found"
                });
            }

            await OfferModel.delete(id);

            return res.status(200).json({
                success: true,
                message: "Offer deleted successfully"
            });

        } catch (error) {
            console.error("Delete offer error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
};

module.exports = offerController;