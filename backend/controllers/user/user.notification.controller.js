import Notification from "../../models/user.notif.model.js";


//FETCH MULTIPLE ORDER NOTFICATION
export const getNotifs = async (req, res) => {
    try { 
        const  userId  = req.user.userId;
        const notifications = await Notification.find({ user: userId })
            .populate('user', 'username')
            .populate({
                path: 'order',
                populate: {
                    path: 'items.product',
                    select: 'name image',
                },
            })
            .exec();    

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ success: false, message: "No notifications found." });
        }

        const mappedNotifications = notifications.map(notification => ({
            orderId: notification.order._id,
            username: notification.user.username,
            products: notification.order.items.map(item => ({
                name: item.product?.name,
                image: item.product?.image,
            })),
            totalAmount: notification.order.totalAmount,
            status: notification.order.userStatus,
            createdAt: notification.order.createdAt,
        }));

        return res.status(200).json({ success: true, data: mappedNotifications });
    } catch (error) {
        console.error("Error fetching notifications: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//FETCH SINGLE ORDER NOTIFICATION
export const getNotif = async (req, res) => {

};

//DELETE NOTIFICATION ORDER
export const deleteNotif = async (req, res) => {

};