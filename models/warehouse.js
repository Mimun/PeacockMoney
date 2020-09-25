const mongoose = require('mongoose')

const warehouseSchema = new mongoose.Schema({
  metadata: [{
    name: {type: String},
    value: {type: String},
    cType: {type: String, default: 'text'},
    dataVie: {type: String},
    dataKor: {type: String, default: 'korean string'}
  }],
  infos: [{
    name: {type: String},
    value: {type: String},
    cType: {type: String, default: 'text'}
  }],
  representatives: [{type: mongoose.Types.ObjectId, ref: 'Employee', required: false}],
  store: {type: mongoose.Types.ObjectId, ref: 'Store', required: false},
  deactive: {type: Boolean, default: false}
})

module.exports = mongoose.model('Warehouse', warehouseSchema)