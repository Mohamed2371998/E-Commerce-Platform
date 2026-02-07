const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Coupon.countDocuments();

  res.json({
    success: true,
    count: coupons.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: coupons,
  });
});

// @desc    Get coupon by ID (Admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.json({
    success: true,
    data: coupon,
  });
});

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumPurchase,
    maximumDiscount,
    usageLimit,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    excludedProducts,
  } = req.body;

  // Check if code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minimumPurchase,
    maximumDiscount,
    usageLimit,
    startDate,
    endDate,
    applicableProducts,
    applicableCategories,
    excludedProducts,
  });

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  // If code is being updated, check for duplicates
  if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
    const existingCoupon = await Coupon.findOne({
      code: req.body.code.toUpperCase(),
    });
    if (existingCoupon) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }
    req.body.code = req.body.code.toUpperCase();
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedCoupon,
  });
});

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await coupon.deleteOne();

  res.json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

// @desc    Validate coupon (Public)
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isValid()) {
    res.status(400);
    throw new Error('Coupon is expired or no longer valid');
  }

  if (subtotal && subtotal < coupon.minimumPurchase) {
    res.status(400);
    throw new Error(
      `Minimum purchase of $${coupon.minimumPurchase} required for this coupon`
    );
  }

  const discount = coupon.calculateDiscount(subtotal || 0);

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      minimumPurchase: coupon.minimumPurchase,
    },
  });
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
