const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  metadata: [{
    type: Object
  }],
  infos: [{
    name: { type: String },
    value: { type: String }
  }],
  evaluationItem: { type: Object },
  status: [{type: Object}],
  contract: { type: mongoose.Types.ObjectId, ref: 'Contract' },
  originWarehouse: { type: mongoose.Types.ObjectId, ref: 'Warehouse' },
  currentWarehouse: {type: mongoose.Types.ObjectId, ref: 'Warehouse'},
  movement: [{type: mongoose.Types.ObjectId, ref: 'Warehouse'}],
  importDate: {type: Date, default: new Date(Date.now())},
  exportDate: {type: Date, default: null},
  exportStatus: {type: String, default: ''},
  note: {type: String, default: ''}

})

module.exports = mongoose.model('Property', propertySchema)