const mongoose = require('mongoose')

const contractSchema = new mongoose.Schema({
  contractStatus: { type: String, required: false, default: 'waiting' },
  contractMetadata: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  infos: [{ type: Object }],
  items: [{
    infos: [{ type: Object }],
    evaluationItem: { type: Object },
    status: [{ type: Object }]
  }],
  templateMetadata: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  store: {
    name: { type: String },
    value: { type: Object },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  },
  employee: {
    name: { type: String },
    value: { type: Object },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  },
  id: { type: String },
  loanPackage: { type: Object, default: null },
  originalLoanPackage: {type: Object, default: null},
  blockRules: [{ type: Object }],
  penaltyRules: [{ type: Object }],
  likes: [{type: Object}]

  // item: {type: mongoose.Types.ObjectId, ref: 'Item', required: false},
  // itemStatus: [{type: mongoose.Types.ObjectId, ref: 'ItemStatus', required: false}],
})

module.exports = mongoose.model('Contract', contractSchema)