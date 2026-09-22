const ProductModel =
    require("../models/productModel");

const productController = {

    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

    async getAll(req, res) {

        try {

            const products =
                await ProductModel.findAll();

            return res.status(200).json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "Get products error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch products"
            });
        }
    },


    // =====================================================
    // GET PRODUCT BY ID
    // =====================================================

    async getById(req, res) {

        try {

            const { id } = req.params;

            const product =
                await ProductModel.findById(id);

            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }

            return res.status(200).json({
                success: true,
                product
            });

        } catch (error) {

            console.error(
                "Get product error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch product"
            });
        }
    },


    // =====================================================
    // CREATE PRODUCT
    // =====================================================

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
                    message:
                        "Category is required"
                });
            }


            if (!name || !name.trim()) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product name is required"
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
                    message:
                        "Valid product price is required"
                });
            }


            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(
                    Number(stock)
                ) ||
                Number(stock) < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Valid product stock is required"
                });
            }


            const category =
                await ProductModel.findCategoryById(
                    category_id
                );


            if (!category) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Category not found"
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
                    description:
                        description
                            ? description.trim()
                            : null,
                    price: Number(price),
                    stock: Number(stock),
                    image: image || null
                });


            const product =
                await ProductModel.findById(
                    productId
                );


            return res.status(201).json({
                success: true,
                message:
                    "Product created successfully",
                product
            });

        } catch (error) {

            console.error(
                "Create product error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create product"
            });
        }
    },


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

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
                    message:
                        "Product not found"
                });
            }


            if (!category_id) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Category is required"
                });
            }


            const category =
                await ProductModel.findCategoryById(
                    category_id
                );


            if (!category) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Category not found"
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
                    message:
                        "Product name is required"
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
                    message:
                        "Valid product price is required"
                });
            }


            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(
                    Number(stock)
                ) ||
                Number(stock) < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Valid product stock is required"
                });
            }


            if (
                status !== undefined &&
                !["ACTIVE", "INACTIVE"]
                    .includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product status"
                });
            }


            await ProductModel.update(
                id,
                {
                    category_id,
                    name: name.trim(),
                    description:
                        description
                            ? description.trim()
                            : null,
                    price: Number(price),
                    stock: Number(stock),
                    image:
                        image !== undefined
                            ? image
                            : existingProduct.image,
                    status:
                        status ||
                        existingProduct.status
                }
            );


            const updatedProduct =
                await ProductModel.findById(id);


            return res.status(200).json({
                success: true,
                message:
                    "Product updated successfully",
                product:
                    updatedProduct
            });

        } catch (error) {

            console.error(
                "Update product error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update product"
            });
        }
    },


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async delete(req, res) {

        try {

            const { id } = req.params;


            const product =
                await ProductModel.findById(id);


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }


            const deleted =
                await ProductModel.delete(id);


            if (!deleted) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product could not be deleted"
                });
            }


            return res.status(200).json({
                success: true,
                message:
                    "Product deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete product"
            });
        }
    },


    // =====================================================
    // CREATE COLOR + SIZE VARIANT
    // =====================================================

    async createVariant(req, res) {

        try {

            const { id } = req.params;

            const {
                color,
                size,
                stock
            } = req.body;


            const product =
                await ProductModel.findById(id);


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }


            if (
                !color ||
                !color.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Color is required"
                });
            }


            if (
                !size ||
                !size.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Size is required"
                });
            }


            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(
                    Number(stock)
                ) ||
                Number(stock) < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Valid variant stock is required"
                });
            }


            const cleanColor =
                color.trim();

            const cleanSize =
                size.trim();


            const existingVariants =
                await ProductModel
                    .findVariantsByProductId(id);


            const duplicate =
                existingVariants.some(
                    variant =>
                        variant.color
                            .toLowerCase() ===
                            cleanColor.toLowerCase() &&

                        variant.size
                            ?.toLowerCase() ===
                            cleanSize.toLowerCase()
                );


            if (duplicate) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This color and size combination already exists"
                });
            }


            const variantId =
                await ProductModel.createVariant({
                    product_id: id,
                    color: cleanColor,
                    size: cleanSize,
                    stock:
                        Number(stock)
                });


            const variant =
                await ProductModel.findVariantById(
                    variantId
                );


            return res.status(201).json({
                success: true,
                message:
                    "Product variant created successfully",
                variant
            });

        } catch (error) {

            console.error(
                "Create variant error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create product variant"
            });
        }
    },


    // =====================================================
    // UPDATE COLOR + SIZE VARIANT
    // =====================================================

    async updateVariant(req, res) {

        try {

            const {
                id,
                variantId
            } = req.params;

            const {
                color,
                size,
                stock
            } = req.body;


            const product =
                await ProductModel.findById(id);


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }


            const variant =
                await ProductModel.findVariantById(
                    variantId
                );


            if (
                !variant ||
                Number(variant.product_id) !==
                    Number(id)
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product variant not found"
                });
            }


            if (
                !color ||
                !color.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Color is required"
                });
            }


            if (
                !size ||
                !size.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Size is required"
                });
            }


            if (
                stock === undefined ||
                stock === null ||
                stock === "" ||
                !Number.isInteger(
                    Number(stock)
                ) ||
                Number(stock) < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Valid variant stock is required"
                });
            }


            const cleanColor =
                color.trim();

            const cleanSize =
                size.trim();


            const existingVariants =
                await ProductModel
                    .findVariantsByProductId(id);


            const duplicate =
                existingVariants.some(
                    item =>
                        Number(item.id) !==
                            Number(variantId) &&

                        item.color
                            .toLowerCase() ===
                            cleanColor.toLowerCase() &&

                        item.size
                            ?.toLowerCase() ===
                            cleanSize.toLowerCase()
                );


            if (duplicate) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This color and size combination already exists"
                });
            }


            await ProductModel.updateVariant(
                variantId,
                {
                    color: cleanColor,
                    size: cleanSize,
                    stock:
                        Number(stock)
                }
            );


            const updatedVariant =
                await ProductModel.findVariantById(
                    variantId
                );


            return res.status(200).json({
                success: true,
                message:
                    "Product variant updated successfully",
                variant:
                    updatedVariant
            });

        } catch (error) {

            console.error(
                "Update variant error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update product variant"
            });
        }
    },


    // =====================================================
    // DELETE VARIANT
    // =====================================================

    async deleteVariant(req, res) {

        try {

            const {
                id,
                variantId
            } = req.params;


            const product =
                await ProductModel.findById(id);


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }


            const variant =
                await ProductModel.findVariantById(
                    variantId
                );


            if (
                !variant ||
                Number(variant.product_id) !==
                    Number(id)
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product variant not found"
                });
            }


            await ProductModel.deleteVariant(
                variantId
            );


            return res.status(200).json({
                success: true,
                message:
                    "Product variant deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete variant error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete product variant"
            });
        }
    },


    // =====================================================
    // UPLOAD COLOR IMAGES
    // =====================================================

    async uploadColorImages(req, res) {

        try {

            const { id, color } =
                req.params;


            const product =
                await ProductModel.findById(id);


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found"
                });
            }


            if (
                !color ||
                !color.trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Color is required"
                });
            }


            if (
                !req.files ||
                req.files.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "At least one image is required"
                });
            }


            const existingImages =
                await ProductModel.findColorImages(
                    id,
                    color.trim()
                );


            let sortOrder =
                existingImages.length + 1;


            const uploadedImages = [];


            for (const file of req.files) {

                const imagePath =
                    `/uploads/products/${file.filename}`;


                const imageId =
                    await ProductModel
                        .createColorImage({
                            product_id:
                                Number(id),
                            color:
                                color.trim(),
                            image:
                                imagePath,
                            sort_order:
                                sortOrder
                        });


                uploadedImages.push({
                    id: imageId,
                    product_id:
                        Number(id),
                    color:
                        color.trim(),
                    image:
                        imagePath,
                    sort_order:
                        sortOrder
                });


                sortOrder++;
            }


            return res.status(201).json({

                success: true,

                message:
                    "Product color images uploaded successfully",

                images:
                    uploadedImages

            });

        } catch (error) {

            console.error(
                "Upload color images error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to upload color images"
            });
        }
    },


    // =====================================================
    // DELETE COLOR IMAGE
    // =====================================================

    async deleteColorImage(req, res) {

        try {

            const { id, imageId } =
                req.params;


            const image =
                await ProductModel
                    .findColorImageById(
                        imageId
                    );


            if (
                !image ||
                Number(image.product_id) !==
                    Number(id)
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product color image not found"
                });
            }


            await ProductModel.deleteColorImage(
                imageId
            );


            return res.status(200).json({
                success: true,
                message:
                    "Product color image deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete color image error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete color image"
            });
        }
    }

};


module.exports = productController;