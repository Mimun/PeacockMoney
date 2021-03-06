const mongoose = require('mongoose')

const fundSchema = new mongoose.Schema({
  createdAt: { type: Date, default: new Date(Date.now()) },
  name: { type: String },
  cash: { type: Number, default: 0 },
  iCash: { type: Number, default: 0 },
  // transHistory: [{ type: Object }],
  receiptRecords: [{type: Object}],
  pendingReceiptRecords: [{type: Object}],
  store: {type: String},
  storeId: {type: String}
})

module.exports = mongoose.model('Fund', fundSchema)
