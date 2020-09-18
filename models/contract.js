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
    evaluationItem: { type: mongoose.Types.ObjectId, ref: 'Item', required: false },
    status: [{ type: mongoose.Types.ObjectId, ref: 'ItemStatus', required: false }]
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
    value: { type: mongoose.Types.ObjectId, ref: 'Store' },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  },
  employee: {
    name: { type: String },
    value: { type: mongoose.Types.ObjectId, ref: 'Employee' },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }

  // item: {type: mongoose.Types.ObjectId, ref: 'Item', required: false},
  // itemStatus: [{type: mongoose.Types.ObjectId, ref: 'ItemStatus', required: false}],
})

module.exports = mongoose.model('Contract', contractSchema)