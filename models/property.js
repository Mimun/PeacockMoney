const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  infos: [{
    name: { type: String },
    value: { type: String }
  }],
  evaluationItem: { type: Object },
  status: [{ type: Object }],
  contract: { type: mongoose.Types.ObjectId, ref: 'Contract' },
  originWarehouse: { type: mongoose.Types.ObjectId, ref: 'Warehouse' },
  currentWarehouse: {type: mongoose.Types.ObjectId, ref: 'Warehouse'},
  movement: [{type: mongoose.Types.ObjectId, ref: 'Warehouse'}]

})

module.exports = mongoose.model('Property', propertySchema)