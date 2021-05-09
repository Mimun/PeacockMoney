const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
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
  isActive: {type: Boolean, default: true},
  representatives: [{type: mongoose.Types.ObjectId, ref: 'Employee'}]
})

module.exports = mongoose.model('Store', storeSchema)