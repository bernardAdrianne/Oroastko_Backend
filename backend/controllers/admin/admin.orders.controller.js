import mongoose from 'mongoose';
import AdminOrder from '../../models/admin/admin.order.model.js';
import UserOrder from '../../models/user.order.model.js';
import Notification from '../../models/user.notif.model.js';

//ADMIN VIEW ALL ORDERS
export const getOrders = async (req, res) => {
    try {
        const orders = await AdminOrder.find()
            .populate('user', 'fullname username')
            .populate('items.product', 'name price quantity time image') 
            .select('items.quantity totalAmount orderStatus createdAt')

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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    try {
        const order = await AdminOrder.findById(id)
            .populate('user', 'fullname username') 
            .populate('items.product', 'name price quantity time image') 
            .select('items.quantity totalAmount orderStatus createdAt'); 

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({ success: true, data: order });
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

    const validStatuses = ['Order Confirmed', 'Preparing', 'Ready for pick-up', 'Received', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    try {
        // Fetch the AdminOrder first
        const adminOrder = await AdminOrder.findById(id);
        if (!adminOrder) {
            return res.status(404).json({ success: false, message: "Admin order not found." });
        }

        // Fetch the corresponding UserOrder based on the user and totalAmount
        const userOrder = await UserOrder.findOne({
            user: adminOrder.user,
            totalAmount: adminOrder.totalAmount,
        });

        if (!userOrder) {
            return res.status(404).json({ success: false, message: "Corresponding user order not found." });
        }

        // Prevent updating if the current status is 'Cancelled'
        if (userOrder.userStatus === 'Cancelled') {
            return res.status(400).json({ success: false, message: "Order cannot be updated." });
        }

        // Update the statuses in both collections
        adminOrder.orderStatus = status;
        await adminOrder.save();

        userOrder.userStatus = status;
        await userOrder.save();

        const updateNotif = new Notification({
            user: adminOrder.user,
            order: userOrder._id,
        });
        await updateNotif.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            data: { userOrder },
        });
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
