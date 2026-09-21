const ProductModel = require("../models/productModel");

const productController = {

    // GET /api/admin/products
    async getAll(req, res) {
        try {
            const products = await ProductModel.findAll();

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {
            console.error("Get products error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch products"
            });
        }
    },


    // GET /api/admin/products/:id
    async getById(req, res) {
        try {
            const { id } = req.params;

            const product = await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            return res.status(200).json({
                success: true,
                product
            });

        } catch (error) {
            console.error("Get product error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch product"
            });
        }
    },


    // POST /api/admin/products
    async create(req, res) {
        try {
            const {
                category_id,
                name,
                description,
                price,
                stock,
                image
            } = req.body;


            // Validate category
            if (!category_id) {
                return res.status(400).json({
                    success: false,
                    message: "Category is required"
                });
            }


            // Validate name
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name is required"
                });
            }


            // Validate price
            if (
                price === undefined ||
                price === null ||
                price === "" ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid product price is required"
                });
            }


            // Validate stock
            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid product stock is required"
                });
            }


            // Check category exists
            const category =
                await ProductModel.findCategoryById(category_id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }


            // Only active categories can receive new products
            if (category.status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot create product under an inactive category"
                });
            }


            const cleanName = name.trim();

            const productId =
                await ProductModel.create({
                    category_id,
                    name: cleanName,
                    description: description
                        ? description.trim()
                        : null,
                    price: Number(price),
                    stock: Number(stock),
                    image: image || null
                });


            const product =
                await ProductModel.findById(productId);


            return res.status(201).json({
                success: true,
                message: "Product created successfully",
                product
            });

        } catch (error) {
            console.error("Create product error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create product"
            });
        }
    },


    // PUT /api/admin/products/:id
    async update(req, res) {
        try {
            const { id } = req.params;

            const {
                category_id,
                name,
                description,
                price,
                stock,
                image,
                status
            } = req.body;


            // Check product
            const existingProduct =
                await ProductModel.findById(id);

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }


            // Validate category
            if (!category_id) {
                return res.status(400).json({
                    success: false,
                    message: "Category is required"
                });
            }


            const category =
                await ProductModel.findCategoryById(category_id);

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }


            if (category.status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot assign product to an inactive category"
                });
            }


            // Validate name
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name is required"
                });
            }


            // Validate price
            if (
                price === undefined ||
                price === null ||
                price === "" ||
                Number(price) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid product price is required"
                });
            }


            // Validate stock
            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid product stock is required"
                });
            }


            // Validate status
            if (
                status !== undefined &&
                !["ACTIVE", "INACTIVE"].includes(status)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product status"
                });
            }


            await ProductModel.update(
                id,
                {
                    category_id,
                    name: name.trim(),
                    description: description
                        ? description.trim()
                        : null,
                    price: Number(price),
                    stock: Number(stock),
                    image: image || null,
                    status: status || existingProduct.status
                }
            );


            const updatedProduct =
                await ProductModel.findById(id);


            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                product: updatedProduct
            });

        } catch (error) {
            console.error("Update product error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update product"
            });
        }
    },


    // DELETE /api/admin/products/:id
    async delete(req, res) {
        try {
            const { id } = req.params;

            const product =
                await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }


            const deleted =
                await ProductModel.delete(id);


            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: "Product could not be deleted"
                });
            }


            return res.status(200).json({
                success: true,
                message: "Product deleted successfully"
            });

        } catch (error) {
            console.error("Delete product error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete product"
            });
        }
    }
};

module.exports = productController;