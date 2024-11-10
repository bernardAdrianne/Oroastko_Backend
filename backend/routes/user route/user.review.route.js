// USER FEEDBACK ROUTES

import express from 'express';

const router = express.Router();

// User Review
router.post("/reviews", postReview);
router.get("/products/:id/reviews", viewReviews);

export default router;