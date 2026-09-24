const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const categoryController =
    require("../controllers/categoryController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const router = express.Router();


// ==================================================
// CATEGORY IMAGE UPLOAD CONFIGURATION
// ==================================================

const uploadDirectory =
    path.join(
        process.cwd(),
        "uploads",
        "categories"
    );


// Create directory automatically
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


// ==================================================
// MULTER STORAGE
// ==================================================

const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            cb
        ) => {

            cb(
                null,
                uploadDirectory
            );
        },


        filename: (
            req,
            file,
            cb
        ) => {

            const extension =
                path
                    .extname(
                        file.originalname
                    )
                    .toLowerCase();

            const fileName =
                `category-${Date.now()}-${Math.round(
                    Math.random() * 1000000
                )}${extension}`;

            cb(
                null,
                fileName
            );
        }

    });


// ==================================================
// IMAGE TYPE VALIDATION
// ==================================================

const fileFilter =
    (
        req,
        file,
        cb
    ) => {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed"
                ),
                false
            );
        }
    };


// ==================================================
// MULTER
// ==================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024
        }

    });


// ==================================================
// ADMIN AUTHENTICATION
// ==================================================

router.use(
    authMiddleware
);


// ==================================================
// GET ALL CATEGORIES
// ==================================================

router.get(
    "/",
    categoryController.getAll
);


// ==================================================
// GET CATEGORY BY ID
// ==================================================

router.get(
    "/:id",
    categoryController.getById
);


// ==================================================
// CREATE CATEGORY + IMAGE
// ==================================================

router.post(
    "/",
    upload.single("image"),
    categoryController.create
);


// ==================================================
// UPDATE CATEGORY + OPTIONAL IMAGE
// ==================================================

router.put(
    "/:id",
    upload.single("image"),
    categoryController.update
);


// ==================================================
// DELETE CATEGORY
// ==================================================

router.delete(
    "/:id",
    categoryController.delete
);


module.exports = router;