const CategoryModel = require("../models/categoryModel");

const CategoryController = {

    async getAll(req, res) {
        try {

            const categories =
                await CategoryModel.findActive();

            return res.status(200).json({
                success: true,
                count: categories.length,
                categories
            });

        } catch (error) {

            console.error(
                "Public category listing error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories"
            });
        }
    }

};

module.exports = CategoryController;
