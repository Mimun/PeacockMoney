const mongoose = require('mongoose')

const receiptIdSchema = new mongoose.Schema({
  name: { type: String },
  type: {type: String},
  createdAt: { type: Date, default: new Date(Date.now()) }
})

module.exports = mongoose.model('ReceiptId', receiptIdSchema)