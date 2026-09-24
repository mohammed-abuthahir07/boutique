const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ProfileController =
    require("../controllers/profileController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

const uploadDirectory = path.join(
    process.cwd(),
    "uploads",
    "customers"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const fileName = `customer-${Date.now()}-${Math.round(Math.random() * 1000000)}${extension}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.use(customerAuthMiddleware);

router.get(
    "/",
    ProfileController.getProfile
);

router.put(
    "/",
    upload.single("profile_image"),
    ProfileController.updateProfile
);

module.exports = router;