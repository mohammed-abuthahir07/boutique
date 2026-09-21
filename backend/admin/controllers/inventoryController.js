const InventoryModel = require("../models/inventoryModel");

const inventoryController = {

    // Get product stock information
    async getInventory(req, res) {

        try {

            const inventory =
                await InventoryModel.getInventory();

            return res.status(200).json({
                success: true,
                inventory
            });

        } catch (error) {

            console.error(
                "Get inventory error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

};

module.exports = inventoryController;