import UserCart from "../../models/user.cart.model.js";
import UserOrder from "../../models/user.order.model.js";
import AdminOrder from '../../models/admin/admin.order.model.js';


//CUSTOMER PLACE ORDER IN CART
export const placeOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { selectedItems } = req.body;

        if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
            return res.status(400).json({ success: false, message: "No items selected for order." });
        }

        const userCart = await UserCart.findOne({ user: userId }).populate('items.product');

        if (!userCart || userCart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
        }

        const selectedCartItems = userCart.items.filter(item => 
            selectedItems.includes(item.product._id.toString())
        );

        if (selectedCartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Selected items not found in cart." });
        }

        const totalAmount = selectedCartItems.reduce(
            (total, item) => total + item.quantity * item.product.price,
            0
        );

        const userOrder = new UserOrder({
            user: userId,
            items: selectedCartItems.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
            })),
            totalAmount,
            userStatus: 'Pending',
        });
        await userOrder.save();

        const adminOrder = new AdminOrder({
            user: userId,
            items: selectedCartItems.map(item => ({
                product: item.product._id,
                price: item.product.price,
            })),
            totalAmount,
            orderStatus: 'Pending',
        });
        await adminOrder.save();

        userCart.items = userCart.items.filter(item => 
            !selectedItems.includes(item.product._id.toString())
        );
        await userCart.save();

        return res.status(201).json({ 
            success: true, 
            message: "Order placed successfully.", 
            order: userOrder 
        });
    } catch (error) {
        console.error("Error placing order: ", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

//CUSTOMER ALL ORDERS HISTORY
export const myOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await UserOrder.find({ user: userId }).populate('items.product');
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found." });
        }

        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error fetching orders: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};  

//CUSTOMER VIEW SPECIFIC ORDER
export const myOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await UserOrder.findById(orderId).populate('items.product', 'name price totalAmount image');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error("error fetching order: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//CUSTOMER DELETE COMPLETED ORDERS
export const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id; 
        
        const deletedOrder = await UserOrder.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        return res.status(200).json({ success: true, message: "Order deleted successfully." });
    } catch (error) {
        console.error("Error deleting order: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
