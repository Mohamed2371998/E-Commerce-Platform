const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const {
  addToCartValidator,
  updateCartItemValidator,
  applyCouponValidator,
} = require('../middleware/validators');

router.use(protect); // All cart routes are protected

router.get('/', getCart);
router.post('/items', addToCartValidator, addToCart);
router.put('/items/:itemId', updateCartItemValidator, updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);
router.post('/coupon', applyCouponValidator, applyCoupon);
router.delete('/coupon', removeCoupon);
router.post('/merge', mergeCart);

module.exports = router;
