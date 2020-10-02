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
  contract: { type: mongoose.Types.ObjectId, ref: 'Contract', default: null },
  originWarehouse: { type: mongoose.Types.ObjectId, ref: 'Warehouse', default: null },
  currentWarehouse: {type: mongoose.Types.ObjectId, ref: 'Warehouse', default: null},
  lastWarehouse: {type: mongoose.Types.ObjectId, ref: 'Warehouse', default: null},
  movement: [{type: mongoose.Types.ObjectId, ref: 'Warehouse'}],
  importDate: {type: Date, default: new Date(Date.now())},
  exportDate: {type: Date, default: null},
  isIn: {type: Boolean, default: true},
  importNote: {type: String, default: ''},
  exportNote: {type: String, default: ''},
  id: {type: String, default: null}

})

module.exports = mongoose.model('Property', propertySchema)