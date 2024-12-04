import mongoose from 'mongoose';
import AdminOrder from '../../models/admin/admin.order.model.js';
import UserOrder from '../../models/user.order.model.js';

//ADMIN VIEW ALL ORDERS
export const getOrders = async (req, res) => {
    try {
        const orders = await AdminOrder.find()
            .populate('user', 'fullName')
            .populate('items.product', 'name price');


        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found." });
        }

        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching customer orders: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//ADMIN VIEW SPECIFIC ORDER
export const viewOrder = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    try {
        const order = await AdminOrder.findById(id)
            .populate('user', 'fullname')
            .populate('items.product', 'name totalAmount');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({ success: false, data: order})
    } catch (error) {
        console.error("Error fetching customer order: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//ADMIN UPDATE ORDER STATUS
export const orderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    const validStatuses = ['Pending', 'Order Confirmed', 'Preparing', 'Received'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    try {
        const adminOrder = await AdminOrder.findByIdAndUpdate(
            id,
            { orderStatus: status },
            { new: true }
        );

        if (!adminOrder) {
            return res.status(404).json({ success: false, message: "Admin order not found." });
        }

        const userOrder = await UserOrder.findOneAndUpdate(
            { user: adminOrder.user, totalAmount: adminOrder.totalAmount }, 
            { userStatus: status },
            { new: true }
        );

        if (!userOrder) {
            console.warn(`No corresponding UserOrder found for AdminOrder with ID: ${id}`);
        }

        return res.status(200).json({ success: true, message: "Order status updated successfully.", data: adminOrder });
    } catch (error) {
        console.error("Error updating order status:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

//ADMIN DELETE ORDER
export const deleteOrder = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID." });
    }

    try {
        const deletedOrder = await AdminOrder.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting order:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
