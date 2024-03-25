const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  image_url: { type: String }
});

module.exports = mongoose.model('Product', productSchema);
