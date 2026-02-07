const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getFeaturedProducts,
  getCategories,
  getRelatedProducts,
} = require('../controllers/productController');
const { protect, vendor, optionalAuth } = require('../middleware/auth');
const {
  createProductValidator,
  updateProductValidator,
  createReviewValidator,
} = require('../middleware/validators');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', protect, vendor, createProductValidator, createProduct);
router.put('/:id', protect, vendor, updateProductValidator, updateProduct);
router.delete('/:id', protect, vendor, deleteProduct);
router.post('/:id/reviews', protect, createReviewValidator, createReview);

module.exports = router;
