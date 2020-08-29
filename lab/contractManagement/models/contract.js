const mongoose = require('mongoose')

const contractSchema = new mongoose.Schema({
  metadata: [{
    name: {type: String},
    value: {type: String},
    cType: {type: String, default: 'text'},
    dataVie: {type: String},
    dataKor: {type: String, default: 'korean string'}
  }],
  items:[{
    infos: [{type: Object}],
    evaluationItem: {type: mongoose.Types.ObjectId, ref: 'Item'},
    status: [{type: mongoose.Types.ObjectId, ref: 'ItemStatus'}]
  }],
  contractStatus: {type: String, required: false, default: 'waiting'},

  // item: {type: mongoose.Types.ObjectId, ref: 'Item', required: false},
  // itemStatus: [{type: mongoose.Types.ObjectId, ref: 'ItemStatus', required: false}],
})

module.exports = mongoose.model('Contract', contractSchema)