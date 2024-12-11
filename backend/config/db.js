import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '../.env' });

console.log(`MONGO_URI: ${process.env.MONGO_URI}`);

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
