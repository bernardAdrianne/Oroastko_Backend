import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
    {
        totalEarnings: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        monthlyEarnings: [
            {
                month: { type: Number }, 
                earnings: { type: Number, default: 0 },
            },
        ],
        bestSellers: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                totalSold: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true }
);

const AdminAnalytics = mongoose.model('AdminAnalytics', analyticsSchema);

export default AdminAnalytics;
