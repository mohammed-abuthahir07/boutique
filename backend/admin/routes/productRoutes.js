const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const productController =
    require("../controllers/productController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// MULTER STORAGE
// =====================================================

const storage =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            const uploadDirectory =
                path.join(
                    __dirname,
                    "../../uploads/products"
                );


            fs.mkdirSync(
                uploadDirectory,
                {
                    recursive: true
                }
            );


            cb(
                null,
                uploadDirectory
            );
        },


        filename: function (
            req,
            file,
            cb
        ) {

            const extension =
                path.extname(
                    file.originalname
                );


            const baseName =
                path.basename(
                    file.originalname,
                    extension
                )
                    .replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    )
                    .toLowerCase();


            const uniqueName =
                `${Date.now()}-${baseName}${extension}`;


            cb(
                null,
                uniqueName
            );
        }

    });


// =====================================================
// FILE FILTER
// =====================================================

const fileFilter =
    function (
        req,
        file,
        cb
    ) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed"
                )
            );
        }
    };


// =====================================================
// MULTER
// =====================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024
        }

    });


// =====================================================
// ADMIN AUTH
// =====================================================

router.use(
    authMiddleware
);


// =====================================================
// PRODUCT VARIANT ROUTES
// =====================================================

// Add color + size variant
// POST /api/admin/products/:id/variants

router.post(
    "/:id/variants",
    productController.createVariant
);


// Update color + size variant
// PUT /api/admin/products/:id/variants/:variantId

router.put(
    "/:id/variants/:variantId",
    productController.updateVariant
);


// Delete variant
// DELETE /api/admin/products/:id/variants/:variantId

router.delete(
    "/:id/variants/:variantId",
    productController.deleteVariant
);


// =====================================================
// COLOR IMAGE ROUTES
// =====================================================

// Upload multiple images for a color
//
// POST
// /api/admin/products/:id/colors/:color/images
//
// form-data:
// images = file
// images = file
// images = file

router.post(
    "/:id/colors/:color/images",
    upload.array("images", 10),
    productController.uploadColorImages
);


// Delete color image
//
// DELETE
// /api/admin/products/:id/colors/:color/images/:imageId

router.delete(
    "/:id/colors/:color/images/:imageId",
    productController.deleteColorImage
);


// =====================================================
// PRODUCT ROUTES
// =====================================================

// Get all products
// GET /api/admin/products

router.get(
    "/",
    productController.getAll
);


// Get single product
// GET /api/admin/products/:id

router.get(
    "/:id",
    productController.getById
);


// Create product
// POST /api/admin/products

router.post(
    "/",
    productController.create
);


// Update product
// PUT /api/admin/products/:id

router.put(
    "/:id",
    productController.update
);


// Delete product
// DELETE /api/admin/products/:id

router.delete(
    "/:id",
    productController.delete
);


module.exports = router;