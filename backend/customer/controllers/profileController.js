const ProfileModel = require("../models/profileModel");

const ProfileController = {

    async getProfile(req, res) {

        try {

            const customerId = req.customer.id;

            const customer =
                await ProfileModel.findById(customerId);

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
                "Get customer profile error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch profile",
                error: error.message
            });
        }
    },

    async updateProfile(req, res) {

        try {

            const customerId = req.customer.id;

            const {
                name,
                phone
            } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required"
                });
            }

            if (name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters"
                });
            }

            const customer =
                await ProfileModel.findById(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            const updatedCustomer =
                await ProfileModel.updateProfile(
                    customerId,
                    {
                        name: name.trim(),
                        phone: phone
                            ? phone.trim()
                            : null,
                        profileImage:
                            customer.profile_image
                    }
                );

            return res.json({
                success: true,
                message: "Profile updated successfully",
                customer: updatedCustomer
            });

        } catch (error) {

            console.error(
                "Update customer profile error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to update profile",
                error: error.message
            });
        }
    }

};

module.exports = ProfileController;