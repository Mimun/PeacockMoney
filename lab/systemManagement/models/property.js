const mongoose = require('mongoose')

const propertySchema = new mongoose.Schema({
  infos: [{
    name: { type: String },
    value: { type: String }
  }],
  evaluationItem: { type: Object },
  status: [{ type: Object }],
  contractId: { type: mongoose.Types.ObjectId },
  originWarehouseId: { type: mongoose.Types.ObjectId },
  currentWarehouseId: {type: mongoose.Types.ObjectId},
  movement: [{type: mongoose.Types.ObjectId}]

})

module.exports = mongoose.model('Property', propertySchema)