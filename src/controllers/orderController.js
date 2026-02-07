const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    billingAddress,
    paymentMethod,
    notes,
  } = req.body;

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Verify stock availability
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (product.inventory.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  // Calculate prices
  const subtotal = cart.subtotal;
  const discount = cart.discountAmount;
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax - discount;

  // Create order items
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images[0],
    price: item.price,
    quantity: item.quantity,
    variant: item.variant,
  }));

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'pending',
    },
    prices: {
      subtotal,
      shipping,
      tax,
      discount,
      total,
    },
    notes: {
      customer: notes || '',
    },
    coupon: {
      code: cart.coupon.code,
      discount,
    },
  });

  // If payment method is card, create Stripe payment intent
  if (paymentMethod === 'card') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.payment.transactionId = paymentIntent.id;
    await order.save();

    // Update coupon usage count
    if (cart.coupon.code) {
      await Coupon.findOneAndUpdate(
        { code: cart.coupon.code },
        { $inc: { usageCount: 1 } }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        order,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } else {
    // For COD or other methods
    // Reduce inventory
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { 'inventory.quantity': -item.quantity },
      });
    }

    // Update coupon usage count
    if (cart.coupon.code) {
      await Coupon.findOneAndUpdate(
        { code: cart.coupon.code },
        { $inc: { usageCount: 1 } }
      );
    }

    // Clear cart
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
      success: true,
      data: { order },
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: orders,
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter['payment.status'] = req.query.paymentStatus;

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(filter);

  // Calculate total revenue
  const revenue = await Order.aggregate([
    { $match: { 'payment.status': 'completed' } },
    { $group: { _id: null, total: { $sum: '$prices.total' } } },
  ]);

  res.json({
    success: true,
    count: orders.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    revenue: revenue[0]?.total || 0,
    data: orders,
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber, carrier } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status || order.status;

  if (status === 'shipped') {
    order.shipping.trackingNumber = trackingNumber || order.shipping.trackingNumber;
    order.shipping.carrier = carrier || order.shipping.carrier;
    order.shipping.shippedAt = new Date();
  }

  if (status === 'delivered') {
    order.shipping.deliveredAt = new Date();
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated',
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user owns the order or is admin
  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  // Can only cancel pending or processing orders
  if (!['pending', 'processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled');
  }

  order.status = 'cancelled';
  await order.save();

  // Restore inventory
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'inventory.quantity': item.quantity },
    });
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

// @desc    Handle Stripe webhook
// @route   POST /api/orders/webhook
// @access  Public
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      // Update order payment status
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          'payment.status': 'completed',
          'payment.paidAt': new Date(),
          status: 'processing',
        },
        { new: true }
      );

      if (order) {
        // Reduce inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { 'inventory.quantity': -item.quantity },
          });
        }

        // Clear user's cart
        await Cart.findOneAndDelete({ user: order.user });
      }

      console.log('Payment succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedOrderId = failedPayment.metadata.orderId;

      await Order.findByIdAndUpdate(failedOrderId, {
        'payment.status': 'failed',
      });

      console.log('Payment failed:', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

  // Total orders
  const totalOrders = await Order.countDocuments();

  // Orders today
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const ordersToday = await Order.countDocuments({
    createdAt: { $gte: todayStart },
  });

  // Revenue
  const revenue = await Order.aggregate([
    { $match: { 'payment.status': 'completed' } },
    { $group: { _id: null, total: { $sum: '$prices.total' } } },
  ]);

  // Revenue last 30 days
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        'payment.status': 'completed',
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    { $group: { _id: null, total: { $sum: '$prices.total' } } },
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      ordersToday,
      totalRevenue: revenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      ordersByStatus,
    },
  });
});

module.exports = {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  stripeWebhook,
  getOrderStats,
};
