const mongoose = require('mongoose')

const contractSchema = new mongoose.Schema({
  metadata: {type: Object, required: true},
  infos: {type: Array, required: false},
  item: {type: mongoose.Types.ObjectId, ref: 'Item', required: false},
  itemStatus: [{type: mongoose.Types.ObjectId, ref: 'ItemStatus', required: false}],
  contractStatus: {type: String, required: false, default: 'waiting'}
})

module.exports = mongoose.model('Contract', contractSchema)