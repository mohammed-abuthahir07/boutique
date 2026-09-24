const CategoryModel = require("../models/categoryModel");
const fs = require("fs");

const categoryController = {

    // ==========================================
    // GET ALL CATEGORIES
    // ==========================================

    async getAll(req, res) {
        try {

            const categories =
                await CategoryModel.findAll();

            return res.status(200).json({
                success: true,
                categories
            });

        } catch (error) {

            console.error(
                "Get categories error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch categories"
            });
        }
    },


    // ==========================================
    // GET CATEGORY BY ID
    // ==========================================

    async getById(req, res) {
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

            return res.status(200).json({
                success: true,
                category
            });

        } catch (error) {

            console.error(
                "Get category error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch category"
            });
        }
    },


    // ==========================================
    // CREATE CATEGORY
    // ==========================================

    async create(req, res) {

        let uploadedImage = null;

        try {

            const { name } = req.body;

            uploadedImage = req.file
                ? `/uploads/categories/${req.file.filename}`
                : null;


            // --------------------------------------
            // VALIDATE NAME
            // --------------------------------------

            if (!name || !name.trim()) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message: "Category name is required"
                });
            }


            const cleanName =
                name.trim();


            // --------------------------------------
            // CHECK DUPLICATE NAME
            // --------------------------------------

            const existingCategory =
                await CategoryModel.findByName(
                    cleanName
                );

            if (existingCategory) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(409).json({
                    success: false,
                    message: "Category already exists"
                });
            }


            // --------------------------------------
            // GENERATE SLUG
            // --------------------------------------

            const slug =
                cleanName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");


            // --------------------------------------
            // CHECK DUPLICATE SLUG
            // --------------------------------------

            const existingSlug =
                await CategoryModel.findBySlug(
                    slug
                );

            if (existingSlug) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(409).json({
                    success: false,
                    message: "Category slug already exists"
                });
            }


            // --------------------------------------
            // CREATE CATEGORY
            // --------------------------------------

            const categoryId =
                await CategoryModel.create({
                    name: cleanName,
                    slug,
                    image: uploadedImage
                });


            // --------------------------------------
            // GET CREATED CATEGORY
            // --------------------------------------

            const category =
                await CategoryModel.findById(
                    categoryId
                );


            return res.status(201).json({
                success: true,
                message:
                    "Category created successfully",
                category
            });

        } catch (error) {

            // Remove uploaded image if database
            // operation fails
            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            console.error(
                "Create category error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create category"
            });
        }
    },


    // ==========================================
    // UPDATE CATEGORY
    // ==========================================

    async update(req, res) {

        try {

            const { id } = req.params;

            const {
                name,
                status
            } = req.body;


            // --------------------------------------
            // FIND CATEGORY
            // --------------------------------------

            const existingCategory =
                await CategoryModel.findById(id);

            if (!existingCategory) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }


            // --------------------------------------
            // VALIDATE NAME
            // --------------------------------------

            if (!name || !name.trim()) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Category name is required"
                });
            }


            // --------------------------------------
            // VALIDATE STATUS
            // --------------------------------------

            if (
                status !== undefined &&
                ![
                    "ACTIVE",
                    "INACTIVE"
                ].includes(status)
            ) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid category status"
                });
            }


            const cleanName =
                name.trim();


            // --------------------------------------
            // CHECK DUPLICATE NAME
            // --------------------------------------

            const duplicateName =
                await CategoryModel.findByName(
                    cleanName
                );

            if (
                duplicateName &&
                Number(duplicateName.id) !==
                    Number(id)
            ) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(409).json({
                    success: false,
                    message:
                        "Another category with this name already exists"
                });
            }


            // --------------------------------------
            // GENERATE SLUG
            // --------------------------------------

            const slug =
                cleanName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");


            // --------------------------------------
            // CHECK DUPLICATE SLUG
            // --------------------------------------

            const duplicateSlug =
                await CategoryModel.findBySlug(
                    slug
                );

            if (
                duplicateSlug &&
                Number(duplicateSlug.id) !==
                    Number(id)
            ) {

                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(409).json({
                    success: false,
                    message:
                        "Another category with this slug already exists"
                });
            }


            // --------------------------------------
            // IMAGE
            // --------------------------------------

            let image =
                existingCategory.image;


            if (req.file) {

                image =
                    `/uploads/categories/${req.file.filename}`;

                // Delete previous image
                if (
                    existingCategory.image &&
                    existingCategory.image.startsWith(
                        "/uploads/categories/"
                    )
                ) {

                    const oldImagePath =
                        existingCategory.image.replace(
                            "/uploads/",
                            "uploads/"
                        );

                    if (
                        fs.existsSync(oldImagePath)
                    ) {
                        fs.unlinkSync(
                            oldImagePath
                        );
                    }
                }
            }


            // --------------------------------------
            // UPDATE CATEGORY
            // --------------------------------------

            await CategoryModel.update(
                id,
                {
                    name: cleanName,
                    slug,
                    image,
                    status:
                        status ||
                        existingCategory.status
                }
            );


            // --------------------------------------
            // GET UPDATED CATEGORY
            // --------------------------------------

            const updatedCategory =
                await CategoryModel.findById(
                    id
                );


            return res.status(200).json({
                success: true,
                message:
                    "Category updated successfully",
                category: updatedCategory
            });

        } catch (error) {

            if (
                req.file &&
                fs.existsSync(req.file.path)
            ) {
                fs.unlinkSync(req.file.path);
            }

            console.error(
                "Update category error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update category"
            });
        }
    },


    // ==========================================
    // DELETE CATEGORY
    // ==========================================

    async delete(req, res) {

        try {

            const { id } = req.params;

            const category =
                await CategoryModel.findById(id);

            if (!category) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Category not found"
                });
            }


            const deleted =
                await CategoryModel.delete(id);

            if (!deleted) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Category could not be deleted"
                });
            }


            // Delete category image
            if (
                category.image &&
                category.image.startsWith(
                    "/uploads/categories/"
                )
            ) {

                const imagePath =
                    category.image.replace(
                        "/uploads/",
                        "uploads/"
                    );

                if (
                    fs.existsSync(imagePath)
                ) {
                    fs.unlinkSync(
                        imagePath
                    );
                }
            }


            return res.status(200).json({
                success: true,
                message:
                    "Category deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete category error:",
                error
            );


            // Foreign key protection
            if (
                error.code ===
                "ER_ROW_IS_REFERENCED_2"
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Cannot delete category because products are using it"
                });
            }


            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete category"
            });
        }
    }

};

module.exports =
    categoryController;