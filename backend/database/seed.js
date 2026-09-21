const bcrypt = require("bcryptjs");

const db = require("../config/database");

async function seedAdmin() {
    try {
        console.log("Starting admin seed...");

        const email = "admin@boutique.com";
        const name = "Boutique Admin";
        const password = "Admin@123";
        const role = "ADMIN";

        // Check whether admin already exists
        const [existingAdmins] = await db.query(
            `
            SELECT id
            FROM admins
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        if (existingAdmins.length > 0) {
            console.log("Admin already exists.");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create admin
        const [result] = await db.query(
            `
            INSERT INTO admins
                (name, email, password, role, status)
            VALUES
                (?, ?, ?, ?, 'ACTIVE')
            `,
            [
                name,
                email,
                hashedPassword,
                role
            ]
        );

        console.log("========================================");
        console.log("Admin created successfully");
        console.log("========================================");
        console.log(`Admin ID : ${result.insertId}`);
        console.log(`Name     : ${name}`);
        console.log(`Email    : ${email}`);
        console.log(`Password : ${password}`);
        console.log(`Role     : ${role}`);
        console.log("========================================");

    } catch (error) {
        console.error("Admin seed failed:", error);
    } finally {
        await db.end();
    }
}

seedAdmin();