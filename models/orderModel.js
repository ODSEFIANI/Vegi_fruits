const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  product: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
});

module.exports = mongoose.model('Order', orderSchema);
