const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  metadata: [{
    name: {type: String},
    value: {type: String},
    cType: {type: String, default: 'text'},
    dataVie: {type: String},
    dataKor: {type: String, default: 'korean string'}
  }],
  infos: [{
    name: { type: String },
    value: { type: String }
  }],
  evaluationItem: { type: Object },
  status: [{ type: Object }],
  contract: { type: mongoose.Types.ObjectId, ref: 'Contract' },
  originWarehouse: { type: mongoose.Types.ObjectId, ref: 'Warehouse' },
  currentWarehouse: {type: mongoose.Types.ObjectId, ref: 'Warehouse'},
  movement: [{type: mongoose.Types.ObjectId, ref: 'Warehouse'}],
  importDate: {type: Date, default: new Date(Date.now())},
  exportDate: {type: Date, default: null}

})

module.exports = mongoose.model('Property', propertySchema)