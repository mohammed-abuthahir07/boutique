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

            if (!category_id) {
                return res.status(400).json({
                    success: false,
                    message: "Category is required"
                });
            }

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name is required"
                });
            }

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
                    message:
                        "Cannot create product under an inactive category"
                });
            }

            const productId =
                await ProductModel.create({
                    category_id,
                    name: name.trim(),
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

            const existingProduct =
                await ProductModel.findById(id);

            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

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
                    message:
                        "Cannot assign product to an inactive category"
                });
            }

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name is required"
                });
            }

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
    },


    // POST /api/admin/products/:id/variants
    async createVariant(req, res) {
        try {
            const { id } = req.params;
            const { color, stock } = req.body;

            const product =
                await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (!color || !color.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Color is required"
                });
            }

            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid variant stock is required"
                });
            }

            const cleanColor = color.trim();

            const existingVariants =
                await ProductModel.findVariantsByProductId(id);

            const duplicate =
                existingVariants.some(
                    variant =>
                        variant.color.toLowerCase() ===
                        cleanColor.toLowerCase()
                );

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "This color already exists for the product"
                });
            }

            const variantId =
                await ProductModel.createVariant({
                    product_id: id,
                    color: cleanColor,
                    stock: Number(stock)
                });

            const variant =
                await ProductModel.findVariantById(variantId);

            return res.status(201).json({
                success: true,
                message: "Product variant created successfully",
                variant
            });

        } catch (error) {
            console.error("Create variant error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to create product variant"
            });
        }
    },


    // PUT /api/admin/products/:id/variants/:variantId
    async updateVariant(req, res) {
        try {
            const { id, variantId } = req.params;
            const { color, stock } = req.body;

            const product =
                await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const variant =
                await ProductModel.findVariantById(variantId);

            if (!variant || Number(variant.product_id) !== Number(id)) {
                return res.status(404).json({
                    success: false,
                    message: "Product variant not found"
                });
            }

            if (!color || !color.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Color is required"
                });
            }

            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(Number(stock)) ||
                Number(stock) < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid variant stock is required"
                });
            }

            const cleanColor = color.trim();

            const existingVariants =
                await ProductModel.findVariantsByProductId(id);

            const duplicate =
                existingVariants.some(
                    item =>
                        Number(item.id) !== Number(variantId) &&
                        item.color.toLowerCase() ===
                        cleanColor.toLowerCase()
                );

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "This color already exists for the product"
                });
            }

            await ProductModel.updateVariant(
                variantId,
                {
                    color: cleanColor,
                    stock: Number(stock)
                }
            );

            const updatedVariant =
                await ProductModel.findVariantById(variantId);

            return res.status(200).json({
                success: true,
                message: "Product variant updated successfully",
                variant: updatedVariant
            });

        } catch (error) {
            console.error("Update variant error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to update product variant"
            });
        }
    },


    // DELETE /api/admin/products/:id/variants/:variantId
    async deleteVariant(req, res) {
        try {
            const { id, variantId } = req.params;

            const product =
                await ProductModel.findById(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            const variant =
                await ProductModel.findVariantById(variantId);

            if (!variant || Number(variant.product_id) !== Number(id)) {
                return res.status(404).json({
                    success: false,
                    message: "Product variant not found"
                });
            }

            await ProductModel.deleteVariant(variantId);

            return res.status(200).json({
                success: true,
                message: "Product variant deleted successfully"
            });

        } catch (error) {
            console.error("Delete variant error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to delete product variant"
            });
        }
    }
};

module.exports = productController;