import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import path from 'path';
import cors from 'cors';    
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

import adminRoutes from './routes/admin route/admin.route.js';
import productRoutes from "./routes/admin route/product.route.js";
import categoryRoutes from './routes/admin route/admin.category.route.js'
import viewUsers from './routes/admin route/admin.user.route.js'
import orderRoutes from './routes/admin route/admin.order.route.js';
import imageRoutes from './routes/admin route/image.route.js';

import userRoutes from './routes/user route/user.route.js'; 
import userProductBrowsing from './routes/user route/user.product.browsing.route.js';
import userCart from './routes/user route/user.cart.route.js';
import userOrder from './routes/user route/user.order.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static('public'));
//Admin routes
app.use("/oroastko/admin", adminRoutes);
app.use("/oroastko/admin/products", productRoutes);
app.use("/oroastko/admin/category", categoryRoutes);
app.use("/oroastko/admin/mycustomer", viewUsers);
app.use("/oroastko/admin/orders", orderRoutes);
app.use("/oroastko/admin/image", imageRoutes);


//Admin login render
app.get('/oroastko/admin/login', (req, res) => {
    res.render('adminLogin');
})

//User routes
app.use("/oroastko/user", userRoutes);
app.use("/oroastko/user/products", userProductBrowsing);
app.use("/oroastko/user/cart", userCart);
app.use("/oroastko/user/order", userOrder);

//User login render
app.get('/oroastko/user/login', (req, res) => {
    res.render('userLogin');
});


app.listen(5000, () =>  {
    connectDB();
    console.log("Server started at http://localhost:5000");
}); 

