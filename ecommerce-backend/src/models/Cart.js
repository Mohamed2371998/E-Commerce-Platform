const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  variant: {
    name: { type: String, default: '' },
    option: { type: String, default: '' },
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: { type: String, default: '' },
      discount: { type: Number, default: 0 },
      discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subtotal
 cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

// Virtual for discount amount
 cartSchema.virtual('discountAmount').get(function () {
  const subtotal = this.subtotal;
  if (this.coupon && this.coupon.discount > 0) {
    if (this.coupon.discountType === 'percentage') {
      return (subtotal * this.coupon.discount) / 100;
    }
    return Math.min(this.coupon.discount, subtotal);
  }
  return 0;
});

// Virtual for total
 cartSchema.virtual('total').get(function () {
  return this.subtotal - this.discountAmount;
});

// Virtual for item count
 cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
