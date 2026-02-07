const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name images price inventory'
  );

  if (!cart) {
    // Return empty cart if none exists
    return res.json({
      success: true,
      data: {
        items: [],
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        itemCount: 0,
      },
    });
  }

  res.json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!product.isActive) {
    res.status(400);
    throw new Error('Product is not available');
  }

  // Check stock
  if (product.inventory.quantity < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  // Check if item already in cart
  const itemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant || {})
  );

  if (itemIndex > -1) {
    // Update quantity if item exists
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    
    if (product.inventory.quantity < newQuantity) {
      res.status(400);
      throw new Error('Insufficient stock for requested quantity');
    }
    
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      variant: variant || {},
      price: product.price,
    });
  }

  await cart.save();

  // Populate and return updated cart
  await cart.populate('items.product', 'name images price inventory');

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: cart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  // Check stock
  const product = await Product.findById(item.product);
  if (product.inventory.quantity < quantity) {
    res.status(400);
    throw new Error('Insufficient stock');
  }

  item.quantity = quantity;
  await cart.save();

  await cart.populate('items.product', 'name images price inventory');

  res.json({
    success: true,
    message: 'Cart updated',
    data: cart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();

  await cart.populate('items.product', 'name images price inventory');

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndDelete({ user: req.user._id });

  res.json({
    success: true,
    message: 'Cart cleared',
    data: {},
  });
});

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isValid()) {
    res.status(400);
    throw new Error('Coupon is expired or no longer valid');
  }

  const subtotal = cart.subtotal;

  if (subtotal < coupon.minimumPurchase) {
    res.status(400);
    throw new Error(
      `Minimum purchase of $${coupon.minimumPurchase} required for this coupon`
    );
  }

  cart.coupon = {
    code: coupon.code,
    discount: coupon.discountValue,
    discountType: coupon.discountType,
  };

  await cart.save();
  await cart.populate('items.product', 'name images price inventory');

  res.json({
    success: true,
    message: 'Coupon applied successfully',
    data: cart,
  });
});

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.coupon = {
    code: '',
    discount: 0,
    discountType: 'percentage',
  };

  await cart.save();
  await cart.populate('items.product', 'name images price inventory');

  res.json({
    success: true,
    message: 'Coupon removed',
    data: cart,
  });
});

// @desc    Merge guest cart with user cart
// @route   POST /api/cart/merge
// @access  Private
const mergeCart = asyncHandler(async (req, res) => {
  const { items } = req.body; // Guest cart items

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: [],
    });
  }

  for (const guestItem of items) {
    const product = await Product.findById(guestItem.productId);

    if (!product || !product.isActive) continue;
    if (product.inventory.quantity < guestItem.quantity) continue;

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === guestItem.productId &&
        JSON.stringify(item.variant) === JSON.stringify(guestItem.variant || {})
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + guestItem.quantity;
      if (product.inventory.quantity >= newQuantity) {
        cart.items[itemIndex].quantity = newQuantity;
      }
    } else {
      cart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity,
        variant: guestItem.variant || {},
        price: product.price,
      });
    }
  }

  await cart.save();
  await cart.populate('items.product', 'name images price inventory');

  res.json({
    success: true,
    message: 'Cart merged successfully',
    data: cart,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart,
};
