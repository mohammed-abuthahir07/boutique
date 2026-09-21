const CategoryModel = require("../models/categoryModel");

const categoryController = {

    // GET /api/admin/categories
    async getAll(req, res) {
        try {
            const categories = await CategoryModel.findAll();

            return res.status(200).json({
                success: true,
                categories
            });

        } catch (error) {
            console.error("Get categories error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories"
            });
        }
    },


    // GET /api/admin/categories/:id
    async getById(req, res) {
        try {
            const { id } = req.params;

            const category = await CategoryModel.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            return res.status(200).json({
                success: true,
                category
            });

        } catch (error) {
            console.error("Get category error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch category"
            });
        }
    },


    // POST /api/admin/categories
    async create(req, res) {
        try {
            const { name } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category name is required"
                });
            }

            const cleanName = name.trim();

            // Check duplicate category name
            const existingCategory =
                await CategoryModel.findByName(cleanName);

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Category already exists"
                });
            }

            // Generate slug
            const slug = cleanName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            // Check duplicate slug
            const existingSlug =
                await CategoryModel.findBySlug(slug);

            if (existingSlug) {
                return res.status(409).json({
                    success: false,
                    message: "Category slug already exists"
                });
            }

            const categoryId =
                await CategoryModel.create({
                    name: cleanName,
                    slug
                });

            const category =
                await CategoryModel.findById(categoryId);

            return res.status(201).json({
                success: true,
                message: "Category created successfully",
                category
            });

        } catch (error) {
            console.error("Create category error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create category"
            });
        }
    },


    // PUT /api/admin/categories/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, status } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Category name is required"
                });
            }

            if (
                status !== undefined &&
                !["ACTIVE", "INACTIVE"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category status"
                });
            }

            const existingCategory =
                await CategoryModel.findById(id);

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            const cleanName = name.trim();

            // Check duplicate name excluding current category
            const duplicateName =
                await CategoryModel.findByName(cleanName);

            if (
                duplicateName &&
                Number(duplicateName.id) !== Number(id)
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }

            const slug = cleanName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            const duplicateSlug =
                await CategoryModel.findBySlug(slug);

            if (
                duplicateSlug &&
                Number(duplicateSlug.id) !== Number(id)
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Another category with this slug already exists"
                });
            }

            await CategoryModel.update(id, {
                name: cleanName,
                slug,
                status: status || existingCategory.status
            });

            const updatedCategory =
                await CategoryModel.findById(id);

            return res.status(200).json({
                success: true,
                message: "Category updated successfully",
                category: updatedCategory
            });

        } catch (error) {
            console.error("Update category error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update category"
            });
        }
    },


    // DELETE /api/admin/categories/:id
    async delete(req, res) {
        try {
            const { id } = req.params;

            const category =
                await CategoryModel.findById(id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

            /*
             * Product relationship check will be added
             * when the Product module is created.
             *
             * We should NOT allow deletion of a category
             * that is being used by products.
             */

            const deleted =
                await CategoryModel.delete(id);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: "Category could not be deleted"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Category deleted successfully"
            });

        } catch (error) {
            console.error("Delete category error:", error);

            // Foreign key protection
            if (error.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(409).json({
                    success: false,
                    message: "Cannot delete category because products are using it"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to delete category"
            });
        }
    }
};

module.exports = categoryController;