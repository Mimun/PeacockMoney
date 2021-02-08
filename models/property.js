const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  metadata: [{
    _id: false,
    type: Object
  }],
  infos: [{
    _id: false,
    name: { type: String },
    value: { type: String }
  }],
  evaluationItem: { type: Object, _id: false, },
  status: [{ type: Object, _id: false, }],
  contract: { type: mongoose.Types.ObjectId, ref: 'Contract' },
  originWarehouse: { type: Object, default: null, _id: false },
  currentWarehouse: { type: Object, default: null, _id: false },
  lastWarehouse: { type: Object, default: null, _id: false },
  movement: [{
    _id: false,
    storeId: { type: String },
    warehouseFrom: { type: String, default: '' },
    warehouseTo: { type: String, default: '' },
    importDate: { type: Date },
    importNote: { type: String, default: '' },
    exportDate: { type: Date },
    exportNote: { type: String, default: '' },
  }],
  isIn: { type: Boolean, default: true},
  id: { type: String, default: null, }
})

module.exports = mongoose.model('Property', propertySchema)