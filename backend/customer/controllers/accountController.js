const fs = require("fs");
const path = require("path");
const db = require("../../config/database");
const AccountModel = require("../models/accountModel");

const AccountController = {

    async deleteAccount(req, res) {
        const customerId = req.customer && req.customer.id;

        if (!customerId) {
            return res.status(401).json({
                success: false,
                message: "Customer authentication required"
            });
        }

        const connection = await db.getConnection();
        let profileImage = null;

        try {
            await connection.beginTransaction();

            const customer = await AccountModel.findById(
                connection,
                customerId
            );

            if (!customer) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            profileImage = customer.profile_image;

            const orders = await AccountModel.findOrdersByCustomerId(
                connection,
                customerId
            );

            for (const order of orders) {
                const archivedOrderId = await AccountModel.archiveOrder(
                    connection,
                    order
                );

                const items = await AccountModel.findOrderItemsByOrderId(
                    connection,
                    order.id
                );

                for (const item of items) {
                    await AccountModel.archiveOrderItem(
                        connection,
                        archivedOrderId,
                        item
                    );
                }

                await AccountModel.verifyArchivedOrder(
                    connection,
                    archivedOrderId,
                    items.length
                );
            }

            const orderIds = orders.map((order) => order.id);

            await AccountModel.deleteLiveOrderItems(connection, orderIds);
            await AccountModel.deleteLiveOrders(connection, customerId);
            await AccountModel.deleteCartAndItems(connection, customerId);
            await AccountModel.deleteFavorites(connection, customerId);
            await AccountModel.deleteCustomer(connection, customerId);

            await connection.commit();

            if (
                profileImage &&
                profileImage.startsWith("/uploads/customers/")
            ) {
                const oldImagePath = path.join(
                    process.cwd(),
                    profileImage.replace("/uploads/", "uploads/")
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            return res.json({
                success: true,
                message: "Your account has been deleted successfully."
            });

        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Delete customer account rollback error:",
                    rollbackError
                );
            }

            console.error("Delete customer account error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to delete your account. Please try again."
            });

        } finally {
            connection.release();
        }
    }

};

module.exports = AccountController;
