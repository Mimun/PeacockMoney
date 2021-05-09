const mongoose = require('mongoose')

const contractTemplateSchema = new mongoose.Schema({
  templateMetadata: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  contractMetadata: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  infos: [{
    name: { type: String },
    value: { type: String },
    cType: { type: String, default: 'text' },
    dataVie: { type: String },
    dataKor: { type: String, default: 'korean string' }
  }],
  isActive: {type: Boolean, default: true},
  penaltyRules: [{ type: Object }],
  blockRules: [{ type: Object }]
})

module.exports = mongoose.model('ContractTemplate', contractTemplateSchema)